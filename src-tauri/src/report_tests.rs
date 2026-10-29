use super::super::tests::TestClock;
use super::*;
fn store() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(TestClock::new()),
        None,
    )
    .unwrap()
}
fn query(period: &str, date: &str) -> DashboardQuery {
    DashboardQuery {
        period: period.into(),
        anchor_date: Some(date.into()),
        ..Default::default()
    }
}
fn ended(
    s: &Store,
    date: &str,
    category: &str,
    quantity: Option<f64>,
    complete: bool,
    duration: i64,
    demo: bool,
) -> i64 {
    s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES(?1,?2,unixepoch(?3,'utc')*1000,unixepoch(?3,'utc')*1000+?4,?4,?4/1000,'FINISHED',1,?5,?6)",params![category,quantity,date,duration,if complete{"COMPLETE"}else{"PENDING"},demo]).unwrap();
    s.connection.last_insert_rowid()
}
#[test]
fn canonical_periods_cover_leap_month_sunday_and_cross_year_weeks() {
    let s = store();
    for (period, date, start, end, buckets) in [
        ("day", "2026-10-29", "2026-10-29", "2026-10-29", 24),
        ("week", "2027-01-01", "2026-12-28", "2027-01-03", 7),
        ("week", "2026-11-01", "2026-10-26", "2026-11-01", 7),
        ("month", "2024-02-29", "2024-02-01", "2024-02-29", 29),
        ("month", "2026-02-28", "2026-02-01", "2026-02-28", 28),
        ("month", "9999-12-31", "9999-12-01", "9999-12-31", 31),
        ("week", "1970-01-01", "1970-01-01", "1970-01-04", 4),
    ] {
        let mut q = query(period, date);
        q.start_date = Some("invalid ignored natural boundary".into());
        let result = s.dashboard_query(q).unwrap();
        assert_eq!(result["range"]["start_date"], start);
        assert_eq!(result["range"]["end_date"], end);
        assert_eq!(result["trend"].as_array().unwrap().len(), buckets);
        assert_eq!(result["categories"].as_array().unwrap().len(), 4);
        assert_eq!(result["totals"]["records"], 0);
    }
}
#[test]
fn period_reports_count_ended_work_and_keep_zero_pending_decimal_and_demo_separate() {
    let mut s = store();
    ended(
        &s,
        "2026-10-29 00:00:00",
        "评测",
        Some(0.0),
        true,
        1234,
        false,
    );
    ended(
        &s,
        "2026-10-29 23:59:59",
        "评测",
        Some(2.5),
        true,
        2000,
        false,
    );
    ended(&s, "2026-10-29 10:00:00", "评测", None, false, 3000, false);
    ended(
        &s,
        "2026-10-29 10:00:00",
        "开发",
        Some(999.0),
        false,
        4000,
        false,
    );
    ended(
        &s,
        "2026-10-29 10:00:00",
        "质检",
        Some(500.0),
        true,
        1000,
        true,
    );
    ended(
        &s,
        "2026-10-28 23:59:59",
        "评测",
        Some(200.0),
        true,
        5000,
        false,
    );
    ended(
        &s,
        "2026-10-30 00:00:00",
        "评测",
        Some(300.0),
        true,
        6000,
        false,
    );
    s.start(StartInput {
        category: "文档".into(),
        quantity: Some(55.0),
        remark: String::new(),
    })
    .unwrap();
    s.connection.execute("UPDATE work_records SET start_time=unixepoch('2026-10-29 12:00:00','utc')*1000 WHERE status='WORKING'",[]).unwrap();
    let result = s.dashboard_query(query("day", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 4);
    assert_eq!(result["record_count"], 5);
    assert_eq!(result["totals"]["duration_ms"], 10234);
    assert_eq!(result["totals"]["quantity"], 2.5);
    assert_eq!(result["categories"][0]["complete"], 2);
    assert_eq!(result["categories"][0]["pending"], 1);
    assert_eq!(result["categories"][2]["quantity"], 0.0);
    assert_eq!(result["categories"][2]["complete"], 0);
    assert_eq!(result["categories"][3]["records"], 0);
    assert_eq!(result["trend"][0]["duration_ms"], 1234);
    assert_eq!(result["trend"][23]["duration_ms"], 2000);
    let mut q = query("day", "2026-10-29");
    q.category = Some("开发".into());
    q.status = "pending".into();
    let one = s.dashboard_query(q).unwrap();
    assert_eq!(one["categories"].as_array().unwrap().len(), 1);
    assert_eq!(one["totals"]["pending"], 1);
    let mut q = query("day", "2026-10-29");
    q.status = "working".into();
    let working = s.dashboard_query(q).unwrap();
    assert_eq!(working["totals"]["records"], 0);
    assert_eq!(working["record_count"], 1);
}
#[test]
fn weekly_and_monthly_totals_refresh_after_settlement_edit_delete_and_use_all_pages() {
    let mut s = store();
    for _ in 0..61 {
        ended(
            &s,
            "2026-10-26 09:00:00",
            "评测",
            Some(0.25),
            true,
            1000,
            false,
        );
    }
    let id = ended(&s, "2026-11-01 09:00:00", "评测", None, false, 2500, false);
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 62);
    assert_eq!(result["totals"]["quantity"], 15.25);
    assert_eq!(result["pages"], 2);
    assert_eq!(result["records"].as_array().unwrap().len(), 50);
    s.settle(SettleInput {
        id,
        expected_revision: 0,
        category: "开发".into(),
        quantity: 2.5,
        remark: "confirmed".into(),
    })
    .unwrap();
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["pending"], 0);
    assert_eq!(result["categories"][2]["quantity"], 2.5);
    s.settle(SettleInput {
        id,
        expected_revision: 1,
        category: "开发".into(),
        quantity: 0.0,
        remark: "edited".into(),
    })
    .unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["categories"][2]["quantity"],
        0.0
    );
    s.dashboard_delete(id, 2).unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-11-01")).unwrap()["totals"]["records"],
        0
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
}
#[test]
fn period_validation_rejects_bad_dates_and_legacy_custom_ranges_still_work() {
    let s = store();
    for (period, date) in [
        ("year", "2026-10-29"),
        ("month", "2026-02-29"),
        ("day", ""),
        ("week", "1969-12-31"),
    ] {
        assert!(s.dashboard_query(query(period, date)).is_err());
    }
    let q = DashboardQuery {
        start_date: Some("2026-10-30".into()),
        end_date: Some("2026-10-01".into()),
        ..Default::default()
    };
    assert!(s.dashboard_query(q).is_err());
    ended(
        &s,
        "2025-01-01 00:00:00",
        "评测",
        Some(1.0),
        true,
        1000,
        false,
    );
    ended(
        &s,
        "2026-01-01 00:00:00",
        "评测",
        Some(2.0),
        true,
        2000,
        false,
    );
    let result = s.dashboard_query(DashboardQuery::default()).unwrap();
    assert_eq!(result["range"]["period"], "custom");
    assert_eq!(result["range"]["trend_unit"], "month");
    assert_eq!(result["totals"]["records"], 2);
}
