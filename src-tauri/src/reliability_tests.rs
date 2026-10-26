use super::*;
use crate::appearance::{self, Appearance, Theme};
use std::{
    path::PathBuf,
    process::Command,
    sync::{Arc, Mutex},
};

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path =
            std::env::temp_dir().join(format!("workmemo-phase7-{}-{nonce}", std::process::id()));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn db(&self) -> PathBuf {
        self.0.join("probe.sqlite3")
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        // Only the exact, freshly created test directory can be recursively removed.
        let temp = std::env::temp_dir().canonicalize().unwrap();
        let path = self.0.canonicalize().unwrap();
        assert_eq!(path.parent(), Some(temp.as_path()));
        assert!(
            path.file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("workmemo-phase7-")
        );
        std::fs::remove_dir_all(path).unwrap();
    }
}

#[derive(Clone)]
struct TestClock(Arc<Mutex<TimePoint>>);
impl TestClock {
    fn new() -> Self {
        Self(Arc::new(Mutex::new(TimePoint {
            wall_ms: 1_792_000_000_000,
            ticks_ms: 0,
        })))
    }
    fn advance(&self, ms: i64) {
        let mut t = self.0.lock().unwrap();
        t.wall_ms += ms;
        t.ticks_ms += ms;
    }
    fn jump_wall(&self, ms: i64) {
        self.0.lock().unwrap().wall_ms += ms;
    }
}
impl Clock for TestClock {
    fn now(&self) -> TimePoint {
        *self.0.lock().unwrap()
    }
}

fn input(category: &str, quantity: f64) -> StartInput {
    StartInput {
        category: category.into(),
        quantity,
        remark: "隔离可靠性测试，非产品数据".into(),
    }
}
fn query() -> HistoryQuery {
    HistoryQuery {
        start_date: "2026-01-01".into(),
        end_date: "2026-12-31".into(),
        category: None,
        page: 1,
    }
}
fn integrity(store: &Store) {
    let value: String = store
        .connection
        .query_row("PRAGMA integrity_check", [], |row| row.get(0))
        .unwrap();
    assert_eq!(value, "ok");
}

#[test]
fn long_workflow_matches_independent_time_model_across_themes_and_deletion() {
    let directory = Directory::new();
    let clock = TestClock::new();
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let mut seed = 0x4d454d4fu64;
    let mut completed = Vec::new();
    let mut expected_theme = Appearance::default();
    for task in 0..64 {
        let quantity = f64::from(task % 4 + 1) / 4.0;
        store
            .start(input(
                ["评测", "质检", "开发", "文档"][(task % 4) as usize],
                quantity,
            ))
            .unwrap();
        let id = store.active().unwrap().unwrap().id;
        let mut paused = false;
        let mut expected_ms = 0;
        for event in 0..24 {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
            let elapsed = ((seed >> 32) % 4097) as i64;
            clock.advance(elapsed);
            if !paused {
                expected_ms += elapsed;
            }
            match (seed >> 16) % 7 {
                0 => {
                    store.pause(id).unwrap();
                    paused = true;
                }
                1 => {
                    store.resume(id).unwrap();
                    paused = false;
                }
                2 => {
                    store.checkpoint().unwrap();
                }
                3 => {
                    store.snapshot().unwrap();
                }
                4 => {
                    clock.jump_wall(if event % 2 == 0 { 600_000 } else { -600_000 });
                }
                5 => {
                    store.pause(id).unwrap();
                    store.pause(id).unwrap();
                    paused = true;
                }
                _ => {
                    expected_theme = Appearance {
                        version: 1,
                        theme: [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon]
                            [(event % 4) as usize],
                        opacity: if event % 2 == 0 { 80 } else { 100 },
                    };
                    appearance::save(&directory.settings(), expected_theme.clone()).unwrap();
                }
            }
            let active = store.snapshot().unwrap().active.unwrap();
            assert_eq!(
                (active.id, active.duration_ms, active.is_paused),
                (id, expected_ms, paused)
            );
            assert_eq!(active.quantity, quantity);
        }
        store.finish(id).unwrap();
        completed.push((id, expected_ms, quantity));
    }
    let summary = store.query_history(query()).unwrap();
    assert_eq!(summary.filtered.records, 64);
    assert_eq!(
        summary.filtered.duration_ms,
        completed.iter().map(|row| row.1).sum::<i64>()
    );
    assert_eq!(
        summary.filtered.quantity,
        completed.iter().map(|row| row.2).sum::<f64>()
    );
    for (index, row) in completed.iter().enumerate() {
        if index % 4 == 0 {
            store.delete_record(row.0).unwrap();
        }
    }
    let remaining = store.query_history(query()).unwrap();
    assert_eq!(remaining.filtered.records, 48);
    let expected: i64 = completed
        .iter()
        .enumerate()
        .filter(|(i, _)| i % 4 != 0)
        .map(|(_, row)| row.1)
        .sum();
    assert_eq!(remaining.filtered.duration_ms, expected);
    assert_eq!(
        remaining
            .daily
            .iter()
            .map(|row| row.totals.duration_ms)
            .sum::<i64>(),
        expected
    );
    assert_eq!(
        remaining
            .categories
            .iter()
            .map(|row| row.totals.records)
            .sum::<i64>(),
        48
    );
    integrity(&store);
    drop(store);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(reopened.active().unwrap().is_none());
    assert_eq!(
        reopened
            .query_history(query())
            .unwrap()
            .filtered
            .duration_ms,
        expected
    );
    assert_eq!(
        appearance::load(&directory.settings()).unwrap(),
        expected_theme
    );
    integrity(&reopened);
}

#[test]
fn abrupt_process_exit_recovers_last_checkpoint_and_independent_appearance() {
    // The same test executable runs a guarded child branch and exits without Drop.
    // It does not launch, terminate, or alter the real WorkMemo application.
    if let Some(value) = std::env::var_os("WORKMEMO_TEST_CRASH_DIRECTORY") {
        let path = PathBuf::from(value).canonicalize().unwrap();
        assert_eq!(
            path.parent(),
            Some(std::env::temp_dir().canonicalize().unwrap().as_path())
        );
        assert!(
            path.file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("workmemo-phase7-")
        );
        assert_eq!(
            std::fs::read(path.join("worker-marker")).unwrap(),
            b"isolated recovery probe"
        );
        let clock = TestClock::new();
        let mut store = Store::open(&path.join("probe.sqlite3"), Box::new(clock.clone())).unwrap();
        store.start(input("文档", 1.0)).unwrap();
        let first = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(first).unwrap();
        store.start(input("开发", 2.5)).unwrap();
        clock.advance(2500);
        store.checkpoint().unwrap();
        appearance::save(
            &path.join("appearance.json"),
            Appearance {
                version: 1,
                theme: Theme::Neon,
                opacity: 83,
            },
        )
        .unwrap();
        clock.advance(800); // Unsaved tail must not be invented on recovery.
        std::process::exit(27);
    }
    let directory = Directory::new();
    std::fs::write(
        directory.0.join("worker-marker"),
        b"isolated recovery probe",
    )
    .unwrap();
    let output = Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "database::reliability_tests::abrupt_process_exit_recovers_last_checkpoint_and_independent_appearance", "--nocapture"])
        .env("WORKMEMO_TEST_CRASH_DIRECTORY", &directory.0)
        .output().unwrap();
    assert_eq!(
        output.status.code(),
        Some(27),
        "child stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        std::fs::metadata(directory.0.join("probe.sqlite3-wal"))
            .unwrap()
            .len()
            > 0
    );
    let clock = TestClock::new();
    clock.advance(86_400_000);
    let mut recovered = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let active = recovered.snapshot().unwrap().active.unwrap();
    assert_eq!(active.id, 2);
    assert_eq!(active.duration_ms, 2500);
    assert!(active.is_paused && active.recovery_pending);
    assert_eq!(
        recovered
            .query_history(query())
            .unwrap()
            .filtered
            .duration_ms,
        1250
    );
    assert_eq!(
        appearance::load(&directory.settings()).unwrap(),
        Appearance {
            version: 1,
            theme: Theme::Neon,
            opacity: 83
        }
    );
    recovered.resume(active.id).unwrap();
    clock.advance(500);
    recovered.finish(active.id).unwrap();
    let summary = recovered.query_history(query()).unwrap();
    assert_eq!(summary.filtered.records, 2);
    assert_eq!(summary.filtered.duration_ms, 4250);
    integrity(&recovered);
}

#[test]
fn failed_close_and_failed_recovery_keep_saved_data_until_storage_is_repaired() {
    let directory = Directory::new();
    let clock = TestClock::new();
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input("质检", 3.0)).unwrap();
        clock.advance(1500);
        store.checkpoint().unwrap();
        store.connection.execute_batch("CREATE TRIGGER reject_save BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'isolated write failure'); END;").unwrap();
        clock.advance(500);
        assert!(store.pause_for_close().is_err());
        let active = store.active().unwrap().unwrap();
        assert!(!active.is_paused);
        assert_eq!(active.duration_ms, 1500);
    }
    assert!(Store::open(&directory.db(), Box::new(clock.clone())).is_err());
    {
        let connection = Connection::open(directory.db()).unwrap();
        let saved: i64 = connection
            .query_row("SELECT duration_ms FROM work_records", [], |row| row.get(0))
            .unwrap();
        assert_eq!(saved, 1500);
        connection
            .execute_batch("DROP TRIGGER reject_save")
            .unwrap();
    }
    let mut repaired = Store::open(&directory.db(), Box::new(clock)).unwrap();
    let active = repaired.snapshot().unwrap().active.unwrap();
    assert_eq!(active.duration_ms, 1500);
    assert!(active.is_paused && active.recovery_pending);
    integrity(&repaired);
}

#[test]
fn ten_thousand_record_history_keeps_paging_and_aggregates_consistent() {
    let directory = Directory::new();
    let mut store = Store::open(&directory.db(), Box::new(TestClock::new())).unwrap();
    {
        let tx = store.connection.transaction().unwrap();
        {
            let mut insert = tx.prepare("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused)
                VALUES(?1,1.25,'隔离容量测试',?2,?2+1250,1250,1,'FINISHED',1)").unwrap();
            for index in 0..10_000i64 {
                insert
                    .execute(params![
                        ["评测", "质检", "开发", "文档"][(index % 4) as usize],
                        1_792_000_000_000i64 + index * 1000
                    ])
                    .unwrap();
            }
        }
        tx.commit().unwrap();
    }
    let started = std::time::Instant::now();
    let first = store.query_history(query()).unwrap();
    assert_eq!(first.filtered.records, 10_000);
    assert_eq!(first.filtered.quantity, 12_500.0);
    assert_eq!(first.filtered.duration_ms, 12_500_000);
    assert_eq!(first.records.len(), 20);
    let mut last_query = query();
    last_query.page = 500;
    let last = store.query_history(last_query).unwrap();
    assert_eq!(last.records.len(), 20);
    assert_eq!(last.records.last().unwrap().id, 1);
    assert_eq!(
        first
            .categories
            .iter()
            .map(|row| row.totals.records)
            .sum::<i64>(),
        10_000
    );
    println!(
        "isolated 10000-record first/last history query elapsed_ms={}",
        started.elapsed().as_millis()
    );
    integrity(&store);
}
