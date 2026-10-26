use super::tests::{TestClock, TestDirectory};
use super::*;

fn start(quantity: Option<f64>) -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity,
        remark: "原始备注".into(),
    }
}
fn settle(id: i64, quantity: f64) -> SettleInput {
    SettleInput {
        id,
        expected_revision: 0,
        category: "文档".into(),
        quantity,
        remark: "  结算备注  ".into(),
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

#[test]
fn empty_quantity_finishes_durably_without_blocking_next_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let first;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        first = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(first).unwrap();
        store.finish(first).unwrap();
        let pending = store.pending_records().unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].quantity, None);
        assert_eq!(pending[0].duration_ms, 1250);
        assert_eq!(pending[0].settlement_status, "PENDING");
        store.start(start(Some(0.0))).unwrap();
        assert_ne!(store.active().unwrap().unwrap().id, first);
        assert_eq!(store.snapshot().unwrap().pending_count, 1);
    }
    clock.advance(86_400_000);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert_eq!(reopened.pending_records().unwrap()[0].id, first);
    reopened.settle(settle(first, 0.0)).unwrap();
    assert_eq!(reopened.pending_records().unwrap().len(), 0);
    let saved = reopened.record(first).unwrap();
    assert_eq!(saved.quantity, Some(0.0));
    assert_eq!(saved.settlement_status, "COMPLETE");
    assert_eq!(saved.duration_ms, 1250);
    assert!(reopened.active().unwrap().is_some());
}

#[test]
fn settlement_audits_original_data_rejects_stale_edits_and_is_idempotent() {
    let (mut store, clock) = memory();
    store.start(start(Some(2.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    assert!(store.settle(settle(id, 3.0)).is_err());
    clock.advance(1000);
    store.finish(id).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    assert!(store.settle(settle(id, 4.0)).is_err());
    let (count, before, after): (i64, String, String) = store
        .connection
        .query_row(
            "SELECT COUNT(*),before_json,after_json FROM record_revisions WHERE record_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .unwrap();
    assert_eq!(count, 1);
    let before: serde_json::Value = serde_json::from_str(&before).unwrap();
    let after: serde_json::Value = serde_json::from_str(&after).unwrap();
    assert_eq!(before["quantity"], 2.0);
    assert_eq!(before["remark"], "原始备注");
    assert_eq!(before["settlement_status"], "PENDING");
    assert_eq!(after["quantity"], 3.0);
    assert_eq!(after["duration_ms"], 1000);
    let mut correction = settle(id, 4.0);
    correction.expected_revision = 1;
    store.settle(correction).unwrap();
    assert_eq!(store.record(id).unwrap().revision, 2);
}

#[test]
fn failed_audit_write_rolls_back_entire_settlement() {
    let (mut store, _) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    store.finish(id).unwrap();
    store.connection.execute_batch("CREATE TRIGGER reject_audit BEFORE INSERT ON record_revisions BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
    assert!(store.settle(settle(id, 0.0)).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.revision, 0);
    assert_eq!(saved.settlement_status, "PENDING");
}

#[test]
fn intervals_and_record_checkpoint_are_atomic_and_recover_at_last_checkpoint() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1500);
        store.checkpoint().unwrap();
        store.connection.execute_batch("CREATE TRIGGER reject_record BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
        clock.advance(500);
        assert!(store.checkpoint().is_err());
        let duration: i64 = store
            .connection
            .query_row("SELECT duration_ms FROM work_segments", [], |r| r.get(0))
            .unwrap();
        assert_eq!(duration, 1500);
        store
            .connection
            .execute_batch("DROP TRIGGER reject_record;")
            .unwrap();
    }
    clock.advance(86_400_000);
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let recovered = store.active().unwrap().unwrap();
    assert_eq!(recovered.duration_ms, 1500);
    assert_eq!(recovered.pause_reason.as_deref(), Some("RECOVERY"));
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "RECOVERED");
    store.resume(id).unwrap();
    clock.advance(750);
    store.pause(id).unwrap();
    clock.advance(30_000);
    store.finish(id).unwrap();
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 2250);
    assert!(saved.confirmed_end_time.unwrap() > saved.end_time.unwrap());
    let sum: i64 = store
        .connection
        .query_row(
            "SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(sum, saved.duration_ms);
}

#[test]
fn migration_preserves_legacy_fields_duration_id_sequence_and_manual_pause() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=1;
        INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused) VALUES(7,'文档',1.25,'保留原文',1000,9000,1234,1,'FINISHED',1);
        INSERT INTO work_records(id,category,quantity,start_time,duration_ms,duration_seconds,status,is_paused) VALUES(9,'开发',2.5,10000,2400,2,'WORKING',1);
        UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';").unwrap();
    let clock = TestClock::new();
    let mut store = Store::initialize(connection, Box::new(clock.clone()), None).unwrap();
    let old = store.record(7).unwrap();
    assert_eq!(
        (
            old.id,
            old.quantity,
            old.duration_ms,
            old.legacy_duration_ms
        ),
        (7, Some(1.25), 1234, 1234)
    );
    assert_eq!(old.remark, "保留原文");
    assert_eq!(old.end_time, Some(9000));
    assert_eq!(old.settlement_status, "COMPLETE");
    let paused = store.active().unwrap().unwrap();
    assert_eq!(paused.pause_reason.as_deref(), Some("MANUAL"));
    assert!(paused.is_paused && paused.recovery_pending);
    let count: i64 = store
        .connection
        .query_row("SELECT COUNT(*) FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(count, 0);
    store.resume(9).unwrap();
    clock.advance(600);
    store.finish(9).unwrap();
    assert_eq!(store.record(9).unwrap().duration_ms, 3000);
    store.start(start(None)).unwrap();
    assert_eq!(store.active().unwrap().unwrap().id, 101);
    assert_eq!(
        store
            .connection
            .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
            .unwrap(),
        "ok"
    );
}

#[test]
fn pending_work_counts_time_but_not_prefilled_quantity() {
    let (mut store, clock) = memory();
    store.start(start(Some(42.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1200);
    store.finish(id).unwrap();
    let query = || HistoryQuery {
        start_date: "1970-01-01".into(),
        end_date: "1970-01-02".into(),
        category: None,
        page: 1,
    };
    let before = store.query_history(query()).unwrap();
    assert_eq!(before.filtered.quantity, 0.0);
    assert_eq!(before.filtered.duration_ms, 1200);
    assert_eq!(before.filtered.pending_records, 1);
    store.settle(settle(id, 0.0)).unwrap();
    let after = store.query_history(query()).unwrap();
    assert_eq!(after.filtered.quantity, 0.0);
    assert_eq!(after.filtered.pending_records, 0);
    assert_eq!(after.filtered.duration_ms, 1200);
}

#[test]
fn failed_finish_does_not_close_interval_or_create_pending_record() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1000);
    store.connection.execute_batch("CREATE TRIGGER reject_finish BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'finish failure'); END;").unwrap();
    assert!(store.finish(id).is_err());
    assert!(!store.active().unwrap().unwrap().is_paused);
    assert!(store.pending_records().unwrap().is_empty());
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "OPEN");
    store
        .connection
        .execute_batch("DROP TRIGGER reject_finish")
        .unwrap();
    clock.advance(500);
    store.finish(id).unwrap();
    assert_eq!(store.record(id).unwrap().duration_ms, 1500);
}

#[test]
fn failed_migration_rolls_back_schema_records_and_sequence() {
    let directory = TestDirectory::new();
    {
        let connection = Connection::open(directory.db()).unwrap();
        connection
            .execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        connection.execute_batch("PRAGMA user_version=1;
            INSERT INTO work_records(id,category,quantity,start_time,end_time,status,is_paused) VALUES(7,'文档',2.5,1000,2000,'FINISHED',1);
            UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';
            CREATE TABLE work_segments(marker TEXT);").unwrap();
    }
    assert!(Store::open(&directory.db(), Box::new(TestClock::new())).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    assert_eq!(
        connection
            .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        1
    );
    assert_eq!(
        connection
            .query_row("SELECT quantity FROM work_records WHERE id=7", [], |r| r
                .get::<_, f64>(0))
            .unwrap(),
        2.5
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_records'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        100
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE name='work_records_v2'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        0
    );
}

#[test]
fn pending_list_includes_older_records_and_delete_cascades_dependent_data() {
    let (mut store, _) = memory();
    for _ in 0..35 {
        store.start(start(None)).unwrap();
        let id = store.active().unwrap().unwrap().id;
        store.finish(id).unwrap();
    }
    assert_eq!(store.snapshot().unwrap().recent_records.len(), 5);
    assert_eq!(store.snapshot().unwrap().pending_count, 35);
    let pending = store.pending_records().unwrap();
    assert_eq!(pending.len(), 35);
    let old = pending[0].id;
    store.settle(settle(old, 0.0)).unwrap();
    store.delete_record(old).unwrap();
    for table in ["work_segments", "record_revisions"] {
        let remaining: i64 = store
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM {table} WHERE record_id=?1"),
                [old],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(remaining, 0);
    }
    assert_eq!(store.pending_records().unwrap().len(), 34);
    assert_eq!(
        store
            .connection
            .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                .get::<_, i64>(
                0
            ))
            .unwrap(),
        0
    );
}

#[test]
fn invalid_settlement_keeps_time_and_pending_status() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(500);
    store.finish(id).unwrap();
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        assert!(store.settle(settle(id, quantity)).is_err());
    }
    let mut invalid = settle(id, 1.0);
    invalid.remark = "字".repeat(2001);
    assert!(store.settle(invalid).is_err());
    let mut invalid = settle(id, 1.0);
    invalid.category = "未知".into();
    assert!(store.settle(invalid).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 500);
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.settlement_status, "PENDING");
    assert_eq!(saved.revision, 0);
}
