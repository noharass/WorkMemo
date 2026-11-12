use super::*;
use crate::database::tests::{TestClock, TestDirectory};

fn input() -> ManualEntryInput {
    ManualEntryInput {
        request_id: "manual-request-0001".into(),
        category: "文档".into(),
        quantity: 2.5,
        remark: "  真实补录  ".into(),
        start_time: 100_000,
        end_time: 200_000,
        duration_ms: 75_250,
    }
}
fn memory() -> (Store, TestClock) {
    let clock = TestClock::new();
    (
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap(),
        clock,
    )
}
fn count(store: &Store, table: &str) -> i64 {
    store
        .connection
        .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r.get(0))
        .unwrap()
}

#[test]
fn manual_work_is_complete_and_preserves_active_timer_without_fabricated_segments() {
    let (mut store, clock) = memory();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "当前工作".into(),
        })
        .unwrap();
    let active = store.active().unwrap().unwrap().id;
    clock.advance(1250);
    let id = store.create_manual_entry(input()).unwrap();
    let record = store.record(id).unwrap();
    assert_eq!(record.source, "MANUAL_ENTRY");
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.settlement_status, "COMPLETE");
    assert_eq!(record.quantity, Some(2.5));
    assert_eq!(record.remark, "真实补录");
    assert_eq!(record.duration_ms, 75_250);
    assert_eq!(record.duration_seconds, 75);
    assert_eq!(record.legacy_duration_ms, 75_250);
    let detail = store.dashboard_detail(id).unwrap();
    assert_eq!(detail["record"]["is_demo"], false);
    assert!(detail["segments"].as_array().unwrap().is_empty());
    assert!(store.pending_records().unwrap().is_empty());
    assert_eq!(store.snapshot().unwrap().active.unwrap().id, active);
    assert_eq!(store.record(active).unwrap().duration_ms, 1250);
    assert_eq!(store.segment.as_ref().unwrap().id, active);
    let totals = store
        .dashboard_query(data_center::DashboardQuery {
            scope: "real".into(),
            ..Default::default()
        })
        .unwrap();
    assert_eq!(totals["totals"]["records"], 1);
    assert_eq!(totals["totals"]["quantity"], 2.5);
    assert_eq!(totals["totals"]["duration_ms"], 75_250);
}

#[test]
fn retries_and_restart_create_exactly_one_record() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        id = store.create_manual_entry(input()).unwrap();
        // A clock rollback after commit must not turn a response retry into a new write.
        clock.jump_wall(-900_000);
        assert_eq!(store.create_manual_entry(input()).unwrap(), id);
        assert_eq!(count(&store, "work_records"), 1);
    }
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert_eq!(reopened.create_manual_entry(input()).unwrap(), id);
    assert_eq!(count(&reopened, "work_records"), 1);
    assert_eq!(count(&reopened, "manual_entry_requests"), 1);
}

#[test]
fn reused_request_cannot_replace_or_duplicate_saved_or_deleted_work() {
    let (mut store, _) = memory();
    let id = store.create_manual_entry(input()).unwrap();
    let mut changed = input();
    changed.quantity = 8.0;
    assert!(store.create_manual_entry(changed).is_err());
    assert_eq!(store.record(id).unwrap().quantity, Some(2.5));
    store.dashboard_delete(id, 0).unwrap();
    assert!(store.create_manual_entry(input()).is_err());
    assert_eq!(count(&store, "work_records"), 0);
    assert_eq!(count(&store, "manual_entry_requests"), 1);
}

#[test]
fn request_write_failure_rolls_back_record_and_allows_safe_retry() {
    let (mut store, _) = memory();
    store.connection.execute_batch("CREATE TRIGGER fail_manual BEFORE INSERT ON manual_entry_requests BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
    assert!(store.create_manual_entry(input()).is_err());
    assert_eq!(count(&store, "work_records"), 0);
    assert_eq!(count(&store, "manual_entry_requests"), 0);
    store
        .connection
        .execute_batch("DROP TRIGGER fail_manual")
        .unwrap();
    assert_eq!(store.create_manual_entry(input()).unwrap(), 1);
    assert_eq!(count(&store, "work_records"), 1);
}

#[test]
fn invalid_times_durations_and_quantities_never_create_work() {
    let (mut store, _) = memory();
    for (start, end, duration) in [
        (-1, 200_000, 1),
        (100_000, 100_000, 0),
        (200_000, 100_000, 1),
        (100_000, 1_000_001, 1),
        (100_000, 200_000, -1),
        (100_000, 200_000, 100_001),
    ] {
        let mut value = input();
        value.start_time = start;
        value.end_time = end;
        value.duration_ms = duration;
        assert!(store.create_manual_entry(value).is_err());
    }
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        let mut value = input();
        value.quantity = quantity;
        assert!(store.create_manual_entry(value).is_err());
    }
    for request in ["short", "../../unsafe/request", "请求标识不合法0000000000"] {
        let mut value = input();
        value.request_id = request.into();
        assert!(store.create_manual_entry(value).is_err());
    }
    let mut value = input();
    value.category = "未知".into();
    assert!(store.create_manual_entry(value).is_err());
    let mut value = input();
    value.remark = "😀".repeat(2001);
    assert!(store.create_manual_entry(value).is_err());
    assert_eq!(count(&store, "work_records"), 0);
}

#[test]
fn zero_quantity_zero_duration_and_unicode_boundary_are_valid() {
    let (mut store, _) = memory();
    let mut value = input();
    value.quantity = 0.0;
    value.duration_ms = 0;
    value.remark = "😀".repeat(2000);
    let id = store.create_manual_entry(value).unwrap();
    assert_eq!(store.record(id).unwrap().quantity, Some(0.0));
    assert_eq!(store.record(id).unwrap().duration_ms, 0);
    assert_eq!(store.record(id).unwrap().remark.chars().count(), 2000);
    // Input rejects fields that might otherwise pretend to create a running or demo task.
    assert!(serde_json::from_str::<ManualEntryInput>(r#"{"request_id":"manual-request-0001","category":"开发","quantity":0,"remark":"","start_time":0,"end_time":1,"duration_ms":0,"status":"WORKING"}"#).is_err());
}
