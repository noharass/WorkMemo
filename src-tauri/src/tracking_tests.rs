use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

struct Harness {
    store: Store,
    clock: TestClock,
    input: i64,
    connected: bool,
    matched: bool,
    ready: bool,
}
impl Harness {
    fn new() -> Self {
        let clock = TestClock::new();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    url_prefix: "https://work.example.test/tasks?ignored=1#fragment".into(),
                    category: "开发".into(),
                }],
            })
            .unwrap();
        store.activate_monitoring();
        let mut harness = Self {
            store,
            clock,
            input: 0,
            connected: true,
            matched: true,
            ready: true,
        };
        harness.tick();
        harness
    }
    fn tick(&mut self) {
        let now = self.clock.now();
        if self.connected {
            self.store.observe_page(PageSample {
                at: now,
                focused: self.matched,
                rule_id: self
                    .matched
                    .then_some(self.store.monitor.config.rules[0].id),
                revision: self.store.monitor.config.revision,
                ready: self.ready,
            });
        }
        self.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: self.input,
                    chrome_foreground: self.matched,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
    }
    fn step(&mut self, ms: i64, input: bool) {
        self.clock.advance(ms);
        if input {
            self.input = self.clock.now().ticks_ms;
        }
        self.tick();
    }
    fn advance(&mut self, mut ms: i64, input: bool) {
        while ms > 0 {
            let step = ms.min(5000);
            self.step(step, input);
            ms -= step;
        }
    }
    fn start(&mut self) -> i64 {
        self.step(1000, true);
        self.store.active().unwrap().unwrap().id
    }
    fn saved(&self, id: i64) -> WorkRecord {
        self.store.record(id).unwrap()
    }
}

#[test]
fn merely_open_or_background_page_does_not_start_and_new_input_starts_once() {
    let mut h = Harness::new();
    h.advance(30_000, false);
    assert!(h.store.active().unwrap().is_none());
    h.matched = false;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1, false);
    assert!(h.store.active().unwrap().is_none());
    let id = h.start();
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let record = h.saved(id);
    assert_eq!(record.source, "AUTO");
    assert_eq!(record.control_mode, "AUTO");
    assert_eq!(record.quantity, None);
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn idle_thresholds_use_input_time_warning_cancels_and_seven_minutes_are_removed() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(299_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "idle");
    h.store.defer_notice(id, "idle").unwrap();
    h.step(1000, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1000, true);
    assert!(!h.store.monitor.status.idle_warning);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, last.ticks_ms - 1000);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "ended");
    h.step(5000, false);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT count(*) FROM end_reminders WHERE record_id=?1",
                [id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
}

#[test]
fn idle_end_wins_over_away_and_rolls_back_the_two_minute_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(300_000, false);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn other_application_input_cannot_extend_work_beyond_away_grace_or_twelve_minutes() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(119_999, true);
    assert!(!h.saved(id).is_paused);
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(599_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("AWAY"));
    assert_eq!(record.duration_ms, 130_000);
    assert_eq!(
        record.confirmed_end_time.unwrap() - record.end_time.unwrap(),
        600_000
    );
}

#[test]
fn return_inside_hold_needs_new_input_and_resumes_same_record_excluding_pause() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(180_000, true);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    assert!(!h.saved(id).is_paused);
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).duration_ms, 140_000);
}

#[test]
fn equal_idle_and_away_deadlines_produce_one_idle_result() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(300_000, true);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 130_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[test]
fn first_input_at_idle_deadline_starts_new_record_instead_of_merging() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    let current = h.store.active().unwrap().unwrap();
    assert_ne!(current.id, old);
    assert_eq!(current.duration_ms, 0);
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_is_never_ended_resumed_or_bypassed_and_manual_resume_ignores_url() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.advance(900_000, false);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).status, "WORKING");
    h.advance(10_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(180_000, true);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 190_000);
}

#[test]
fn lost_browser_connection_removes_unconfirmed_tail_and_recovers_only_with_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let trusted = h.clock.now();
    h.connected = false;
    h.advance(20_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.monitor.last_trusted_page, Some(trusted.ticks_ms));
    h.connected = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
}

#[test]
fn revoked_permission_is_unknown_not_a_counted_away_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.ready = false;
    h.advance(5000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn lock_or_suspended_scheduler_gap_never_counts_unknown_time() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let lock = h.clock.now();
    h.clock.advance(5000);
    h.store.system_unavailable(lock).unwrap();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.clock.advance(60_000);
    h.tick();
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn deferred_reminder_and_pending_record_survive_restart_without_blocking_new_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(id).unwrap();
        assert!(store.current_notice().unwrap().is_some());
        store.defer_notice(id, "ended").unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
    }
    let store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.current_notice().unwrap().is_none());
    assert_eq!(store.pending_records().unwrap()[0].id, id);
    assert!(store.active().unwrap().unwrap().recovery_pending);
}

#[test]
fn config_validation_conflict_and_storage_failure_keep_previous_rules() {
    let mut h = Harness::new();
    let original = h.store.monitor_config().unwrap();
    for url in [
        "file:///private",
        "https://name:password@work.example.test/",
        "not-a-url",
    ] {
        assert!(
            h.store
                .save_monitor_config(ConfigInput {
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        url_prefix: url.into(),
                        category: "开发".into()
                    }]
                })
                .is_err()
        );
    }
    h.store.connection.execute_batch("CREATE TRIGGER reject_rule BEFORE INSERT ON work_urls BEGIN SELECT RAISE(ABORT,'rule failure'); END;").unwrap();
    assert!(
        h.store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    url_prefix: "https://other.example.test/".into(),
                    category: "开发".into()
                }]
            })
            .is_err()
    );
    let current = h.store.monitor_config().unwrap();
    assert_eq!(current.revision, original.revision);
    assert_eq!(current.rules, original.rules);
}

#[test]
fn delayed_detection_does_not_add_poll_delay_to_effective_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(419_000, false);
    h.step(4_003, false);
    let record = h.saved(id);
    assert_eq!(record.duration_ms, 10_000);
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 423_003));
}

#[test]
fn unconfirmed_browser_outage_cannot_hold_record_forever_while_input_continues() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.connected = false;
    h.advance(615_000, true);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("RECOVERY"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn background_browser_profiles_cannot_override_the_focused_profile() {
    let mut h = Harness::new();
    let at = h.clock.now();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let page = |focused| PageSample {
        at,
        focused,
        rule_id: focused.then_some(rule),
        revision,
        ready: true,
    };
    h.store.observe_browser_page(11, page(true));
    h.store.observe_browser_page(22, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(11));
    h.store.observe_browser_page(22, page(true));
    h.store.observe_browser_page(11, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(22));
}

#[test]
fn last_input_timestamp_does_not_move_when_wall_clock_changes_without_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.saved(id).last_input_time;
    h.clock.jump_wall(3_600_000);
    h.advance(5000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn second_schema_pending_intervals_survive_upgrade_without_an_upgrade_popup() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection
        .execute_batch(include_str!("../migrations/002_settlement.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=2;
        INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time)
        VALUES(10,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);
        INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(10,1000,2250,2250,1250,'CLOSED');").unwrap();
    let mut store = Store::initialize(connection, Box::new(TestClock::new()), None).unwrap();
    let pending = store.pending_records().unwrap();
    assert_eq!(pending[0].id, 10);
    assert_eq!(pending[0].duration_ms, 1250);
    assert_eq!(pending[0].quantity, None);
    assert!(store.current_notice().unwrap().is_none());
    store
        .settle(SettleInput {
            id: 10,
            expected_revision: 0,
            category: "开发".into(),
            quantity: 0.0,
            remark: "".into(),
        })
        .unwrap();
    assert_eq!(store.record(10).unwrap().duration_ms, 1250);
}

#[test]
fn automatic_finish_failure_rolls_back_trim_and_retries_without_duplicate_reminders() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.store.connection.execute_batch("CREATE TRIGGER reject_auto_end BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'auto end failure'); END;").unwrap();
    h.clock.advance(1);
    let now = h.clock.now();
    assert!(
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: h.input,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true
                },
                now
            )
            .is_err()
    );
    assert_eq!(h.saved(id).status, "WORKING");
    assert!(h.store.current_notice().unwrap().is_none());
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_auto_end")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_rejects_bad_auth_and_replay_before_changing_page_state() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    crate::browser_bridge::start(shared.clone(), directory.db().parent().unwrap()).unwrap();
    let endpoint_path = directory
        .db()
        .parent()
        .unwrap()
        .join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let send = |stream: &mut TcpStream, token: String, sequence, focused| {
        let frame = BrowserFrame {
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
        };
        let mut bytes = serde_json::to_vec(&WireRequest { token, frame }).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        stream.flush().unwrap();
    };
    let mut bad = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    bad.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
    send(&mut bad, "invalid".into(), 1, false);
    let mut line = String::new();
    let rejected = |result: std::io::Result<usize>| match result {
        Ok(0) => (),
        Err(error)
            if matches!(
                error.kind(),
                std::io::ErrorKind::ConnectionReset | std::io::ErrorKind::ConnectionAborted
            ) =>
        {
            ()
        }
        other => panic!("expected a rejected connection, got {other:?}"),
    };
    // Windows may close a rejected socket with FIN or RST. Neither may return
    // a successful reply or change the page state.
    rejected(BufReader::new(bad).read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    let mut valid = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    valid
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(valid.try_clone().unwrap());
    send(&mut valid, endpoint.token.clone(), 1, true);
    reader.read_line(&mut line).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&line).unwrap()["connected"],
        true
    );
    line.clear();
    send(&mut valid, endpoint.token, 1, false);
    rejected(reader.read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    drop(reader);
    drop(valid);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn unavailable_native_metadata_blocks_manual_start_and_resume_without_losing_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: h.input,
                chrome_foreground: true,
                unlocked: false,
                reliable: false,
            },
            now,
        )
        .unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into()
            })
            .is_err()
    );
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert!(h.saved(id).is_paused);
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 10000);
}

#[test]
fn already_expired_record_cannot_be_resurrected_by_manual_finish_or_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    h.advance(420_000, false);
    h.store.finish(id).unwrap();
    assert!(h.store.resume(id).is_err());
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
}
