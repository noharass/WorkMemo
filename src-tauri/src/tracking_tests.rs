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
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
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
    fn tick_unconfirmed(&mut self) {
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
    fn tick(&mut self) {
        self.tick_unconfirmed();
        self.accept();
    }
    // Existing timer scenarios model a user accepting the initial prompt immediately.
    // Dedicated confirmation tests below leave candidates unanswered explicitly.
    fn accept(&mut self) {
        if let Some(c) = self.store.monitor.candidate.clone() {
            self.store.confirm_work(Some(c.id), false).unwrap();
        }
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
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, 20_000);
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
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
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
fn manual_pause_remains_protected_when_auto_resume_disabled() {
    let mut h = Harness::new();
    h.store.monitor.config.auto_resume_manual = false;
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
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 135_000);
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
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    times: TrackingTimes::default(),
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        match_mode: "path_prefix".into(),
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
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
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
            match_modes: true,
            page_activity: false,
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
    // Rejecting a replay may already have cleared the disconnected page.
    // A replay must never publish the supplied focused=false state.
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .is_none_or(|page| page.focused)
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

#[cfg(windows)]
#[test]
fn real_loopback_bridge_keeps_one_connection_between_heartbeats() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    let folder = directory.db().parent().unwrap().to_path_buf();
    crate::browser_bridge::start(shared.clone(), &folder).unwrap();
    let endpoint_path = folder.join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let mut stream = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    for sequence in 1..=3 {
        if sequence > 1 {
            // A real browser waits between heartbeats. Windows accepted sockets
            // inherit the listener's nonblocking mode unless explicitly reset.
            std::thread::sleep(Duration::from_millis(120));
        }
        let request = WireRequest {
            token: endpoint.token.clone(),
            frame: BrowserFrame {
                match_modes: true,
                page_activity: false,
                version: 1,
                sequence,
                config_revision: revision,
                focused: false,
                ready: true,
                rule_id: None,
            },
        };
        let mut bytes = serde_json::to_vec(&request).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        let mut reply = String::new();
        let length = reader.read_line(&mut reply).unwrap();
        assert!(length > 0, "connection closed before heartbeat {sequence}");
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&reply).unwrap()["connected"],
            true
        );
    }
    drop(reader);
    drop(stream);
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

#[test]
fn configured_deadlines_control_work_and_status() {
    let mut h = Harness::new();
    let mut cfg = h.store.monitor_config().unwrap();
    cfg.times = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 20,
        idle_end_seconds: 30,
        away_pause_seconds: 4,
        hold_seconds: 6,
    };
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times.clone(),
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.matched = false;
    h.tick();
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(4));
    h.advance(3_999, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(1));
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, None);
    h.advance(5_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 4_000);
}

#[test]
fn configured_idle_deadline_and_notice_are_consistent() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: TrackingTimes {
                idle_pause_seconds: 1,
                idle_warning_seconds: 2,
                idle_end_seconds: 4,
                ..TrackingTimes::default()
            },
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(1_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    let notice = h.store.current_notice().unwrap().unwrap();
    assert_eq!(
        (notice.idle_warning_seconds, notice.idle_end_seconds),
        (2, 4)
    );
    h.advance(2_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 0);
}

#[test]
fn schema_three_migrates_defaults_and_settings_persist_with_validation() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=3; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=8 WHERE id=1;").unwrap();
    }
    let chosen = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 12,
        idle_end_seconds: 23,
        away_pause_seconds: 34,
        hold_seconds: 45,
    };
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let old = store.monitor_config().unwrap();
        assert_eq!(old.times, TrackingTimes::default());
        assert_eq!(old.revision, 8);
        let rule = || {
            vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }]
        };
        let invalid = TrackingTimes {
            idle_warning_seconds: 24,
            idle_end_seconds: 23,
            ..chosen.clone()
        };
        assert!(
            store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    enabled: true,
                    expected_revision: 8,
                    times: invalid,
                    rules: rule()
                })
                .is_err()
        );
        assert_eq!(store.monitor_config().unwrap().revision, 8);
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                enabled: true,
                expected_revision: 8,
                times: chosen.clone(),
                rules: rule(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    assert_eq!(store.monitor_config().unwrap().times, chosen);
    assert_eq!(store.monitor_config().unwrap().rules.len(), 1);
}

#[test]
fn saving_settings_clears_old_away_deadline_and_requires_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.tick();
    h.advance(5_000, true);
    assert!(h.store.monitor.away_since.is_some());
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    assert!(h.store.monitor.away_since.is_none());
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    h.matched = true;
    h.tick();
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_pause_auto_resumes_same_record_only_after_fresh_matching_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.advance(121_000, true);
    assert!(!h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    h.advance(120_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
}

#[test]
fn manual_started_active_is_not_replaced_and_automatic_resume_switches_same_record_to_auto() {
    let mut h = Harness::new();
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: "".into(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.store.pause(id).unwrap();
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
}

#[test]
fn checked_start_rejects_stale_or_missing_confirmation_without_modifying_task() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.pause(id).unwrap();
    let input = || StartInput {
        category: "文档".into(),
        quantity: None,
        remark: "".into(),
    };
    assert!(h.store.start_checked(input(), None).is_err());
    assert!(h.store.start_checked(input(), Some(id + 1)).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store.start_checked(input(), Some(id)).unwrap();
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("SWITCH"));
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn browser_evidence_time_allows_first_input_before_next_state_machine_tick() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1_000, true);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(100);
    let input = h.clock.now();
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: input.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let active = h
        .store
        .active()
        .unwrap()
        .expect("first input after confirmed page should start");
    assert_eq!(active.control_mode, "AUTO");
    assert_eq!(active.duration_ms, 0);
}

#[test]
fn monitor_interval_is_validated_persisted_and_changes_sample_due() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 1);
    assert!(cfg.auto_resume_manual);
    let input = |seconds| ConfigInput {
        enabled: true,
        expected_revision: cfg.revision,
        times: cfg.times.clone(),
        poll_interval_seconds: seconds,
        auto_resume_manual: false,
        rules: cfg
            .rules
            .iter()
            .map(|r| RuleInput {
                match_mode: r.match_mode.clone(),
                url_prefix: r.url_prefix.clone(),
                category: r.category.clone(),
            })
            .collect(),
    };
    assert!(h.store.save_monitor_config(input(0)).is_err());
    assert!(h.store.save_monitor_config(input(6)).is_err());
    h.store.save_monitor_config(input(5)).unwrap();
    let saved = h.store.monitor_config().unwrap();
    assert_eq!(saved.poll_interval_seconds, 5);
    assert!(!saved.auto_resume_manual);
    let now = h.clock.now();
    h.store.monitor.native = Some(NativeSample {
        at: now,
        last_input_ticks: 0,
        chrome_foreground: true,
        unlocked: true,
        reliable: true,
    });
    assert!(!h.store.monitor_sample_due(now.ticks_ms + 4_999));
    assert!(h.store.monitor_sample_due(now.ticks_ms + 5_000));
}

#[test]
fn schema_four_migrates_options_without_changing_records_or_existing_thresholds() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=4; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=9,idle_warning_seconds=12,idle_end_seconds=23,away_pause_seconds=34,hold_seconds=45 WHERE id=1; INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time) VALUES(17,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);").unwrap();
    }
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let cfg = store.monitor_config().unwrap();
        assert_eq!(cfg.revision, 9);
        assert_eq!(cfg.poll_interval_seconds, 1);
        assert!(cfg.auto_resume_manual);
        assert_eq!(
            cfg.times,
            TrackingTimes {
                idle_pause_seconds: 22,
                idle_warning_seconds: 12,
                idle_end_seconds: 23,
                away_pause_seconds: 34,
                hold_seconds: 45
            }
        );
        assert_eq!(store.record(17).unwrap().duration_ms, 1250);
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 9,
                times: cfg.times,
                poll_interval_seconds: 5,
                auto_resume_manual: false,
                rules: cfg
                    .rules
                    .into_iter()
                    .map(|r| RuleInput {
                        match_mode: r.match_mode.clone(),
                        url_prefix: r.url_prefix,
                        category: r.category,
                    })
                    .collect(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    let cfg = store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 5);
    assert!(!cfg.auto_resume_manual);
    assert_eq!(store.record(17).unwrap().duration_ms, 1250);
}

#[test]
fn manually_paused_task_is_not_auto_resumed_after_restart() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        store.pause(id).unwrap();
    }
    let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
    let cfg = store.monitor_config().unwrap();
    store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }],
        })
        .unwrap();
    store.activate_monitoring();
    clock.advance(1000);
    let now = clock.now();
    store.observe_page(PageSample {
        at: now,
        focused: true,
        rule_id: Some(store.monitor.config.rules[0].id),
        revision: store.monitor.config.revision,
        ready: true,
    });
    store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    let record = store.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
}

#[test]
fn input_before_page_evidence_does_not_start_or_backfill_unknown_time() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1000, true);
    let before_evidence = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: before_evidence,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_some());
}

#[test]
fn page_activity_starts_at_confirmation_without_backfilling_earlier_input() {
    let mut h = Harness::new();
    h.step(1000, false);
    let input = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let confirmed = h.clock.now();
    h.store.observe_browser_page(
        99,
        PageSample {
            at: confirmed,
            focused: true,
            rule_id: Some(h.store.monitor.config.rules[0].id),
            revision: h.store.monitor.config.revision,
            ready: true,
        },
    );
    h.store.observe_browser_activity(99);
    h.store.monitor.page_was_matched = false;
    h.store
        .monitor_tick(
            NativeSample {
                at: confirmed,
                last_input_ticks: input,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            confirmed,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn confirmation_deduplicates_and_counts_only_after_acceptance() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let candidate = h.store.monitor.candidate.clone().unwrap();
    for _ in 0..4 {
        h.clock.advance(1000);
        h.input = h.clock.now().ticks_ms;
        h.tick_unconfirmed();
        assert_eq!(h.store.monitor.candidate.as_ref().unwrap().id, candidate.id);
        assert!(h.store.active().unwrap().is_none());
    }
    let confirmed = h.clock.now();
    h.store.confirm_work(Some(candidate.id), false).unwrap();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
    assert!(h.store.confirm_work(Some(candidate.id), false).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, record.id);
}
#[test]
fn confirmation_survives_own_window_focus_but_rejects_stale_page() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.clock.advance(3000);
    let now = h.clock.now();
    h.store.observe_page(PageSample {
        at: now,
        focused: false,
        rule_id: Some(c.rule_id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: false,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.confirm_work(Some(c.id), false).is_err());
    h.store.confirm_work(Some(c.id), true).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().start_time, now.wall_ms);
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.connected = false;
    h.clock.advance(16000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.confirm_work(Some(c.id), true).is_err());
    assert!(h.store.active().unwrap().is_none());
}
#[test]
fn browsing_blocks_new_work_and_protects_a_paused_task_until_explicit_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.step(1, false);
    h.advance(120000, false);
    assert!(h.saved(id).is_paused);
    h.store.enter_browsing().unwrap();
    h.advance(3600000, true);
    assert_eq!(h.saved(id).status, "WORKING");
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.matched = true;
    h.step(1000, true);
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.status.browse_ready);
    h.store.confirm_work(None, false).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor.config.browsing_only);
    h.store.finish(id).unwrap();
    h.store.enter_browsing().unwrap();
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.monitor.status.browse_ready);
}
#[test]
fn browsing_intent_persists_across_restart_without_ending_work() {
    let d = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut s = Store::open(&d.db(), Box::new(clock.clone())).unwrap();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
        id = s.active().unwrap().unwrap().id;
        s.enter_browsing().unwrap();
    }
    clock.advance(600000);
    let mut s = Store::open(&d.db(), Box::new(clock)).unwrap();
    s.activate_monitoring();
    assert!(s.monitor.config.browsing_only);
    assert!(s.monitor.status.browsing_only);
    let record = s.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn leaving_browse_mode_commits_atomically_with_start_or_resume() {
    let mut h = Harness::new();
    h.store.enter_browsing().unwrap();
    let trigger = "CREATE TRIGGER refuse_work_intent BEFORE UPDATE OF browsing_only ON monitoring_settings WHEN NEW.browsing_only=0 BEGIN SELECT RAISE(ABORT,'injected intent failure'); END;";
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: String::new()
            })
            .is_err()
    );
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.config.browsing_only);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.store.enter_browsing().unwrap();
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.config.browsing_only);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 0);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store.resume(id).unwrap();
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor_config().unwrap().browsing_only);
}

#[test]
fn schema_seven_rules_migrate_and_modes_round_trip_without_touching_active_work() {
    let h = Harness::new();
    h.store
        .connection
        .execute_batch("ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; UPDATE sqlite_sequence SET seq=99 WHERE name='work_urls'; ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;")
        .unwrap();
    let c = h.store.connection;
    let mut store = Store::initialize(c, Box::new(h.clock), None).unwrap();
    let config = store.monitor_config().unwrap();
    assert_eq!(config.rules[0].match_mode, "path_prefix");
    assert_eq!(
        store
            .connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_urls'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        99
    );
    store
        .connection
        .execute(
            "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
            params![config.rules[0].url_prefix, "开发", "origin"],
        )
        .unwrap();
    let saved = store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: false,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/sheets/a".into(),
                    category: "开发".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    assert_eq!(saved.rules[0].url_prefix, "https://moonshot.feishu.cn/");
    assert_eq!(saved.rules[1].url_prefix, "cn-beijing-vpc.fcapp.run");
    assert_eq!(store.monitor_config().unwrap().rules, saved.rules);
}

#[test]
fn multiple_sites_for_one_work_keep_one_record_and_continuous_time() {
    let mut h = Harness::new();
    let config = h.store.monitor_config().unwrap();
    let config = h
        .store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/".into(),
                    category: "评测".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(5_000, true);
    for index in 0..6 {
        h.clock.advance(1_000);
        let now = h.clock.now();
        h.input = now.ticks_ms;
        h.store.observe_page(PageSample {
            at: now,
            focused: true,
            ready: true,
            revision: config.revision,
            rule_id: Some(config.rules[(index + 1) % 2].id),
        });
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: now.ticks_ms,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
        let snapshot = h.store.snapshot().unwrap();
        let record = snapshot.active.unwrap();
        assert_eq!(record.id, id);
        assert_eq!(record.category, "评测");
        assert!(!record.is_paused);
        assert!(snapshot.monitoring.start_candidate.is_none());
        assert!(snapshot.monitoring.away_pause_remaining_seconds.is_none());
        assert_eq!(snapshot.pending_count, 0);
    }
    h.store.finish(id).unwrap();
    assert_eq!(h.saved(id).duration_ms, 11_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[path = "idle_pause_tests.rs"]
mod idle_pause_tests;
