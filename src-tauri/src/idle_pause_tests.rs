use super::*;

#[test]
fn threshold_trims_tail_and_fresh_work_resumes_same_auto_record() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(119_999, false);
    assert!(!h.saved(id).is_paused);
    h.step(1, false);
    let paused = h.saved(id);
    assert_eq!(paused.pause_reason.as_deref(), Some("IDLE_PAUSE"));
    assert_eq!(paused.duration_ms, 10_000);
    assert_eq!(paused.status, "WORKING");
    h.advance(20_000, false);
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    h.advance(5_000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_idle_resume_uses_any_input_without_enabling_page_monitoring() {
    let mut h = Harness::new();
    h.store.monitor.config.enabled = false;
    h.matched = false;
    h.store
        .start(StartInput {
            category: "评测".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.advance(5_000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
    assert!(h.store.pending_records().unwrap().is_empty());
}

#[test]
fn auto_idle_pause_does_not_resume_for_other_apps_or_untrusted_pages() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(120_000, false);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.ready = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.ready = true;
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
}

#[test]
fn late_sample_catches_idle_gap_before_accepting_new_input() {
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 2;
    let id = h.start();
    h.step(1_000, true);
    h.step(1_000, false); // Already observed a quiet interval before the delayed sample.
    h.step(5_000, true); // No intermediate sample: gap is longer than pause threshold.
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 1_000);
    h.step(1_000, true);
    assert_eq!(h.saved(id).duration_ms, 2_000);
}

#[test]
fn end_deadline_wins_when_input_arrives_exactly_at_deadline_for_manual_work() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.step(1_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    assert!(h.store.active().unwrap().is_none());
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 1_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_and_recovery_never_use_idle_auto_resume() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(120_000, false);
    h.store.pause(id).unwrap(); // Explicit pause replaces the idle reason.
    h.step(1_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.advance(500_000, false);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store
        .connection
        .execute(
            "UPDATE work_records SET recovery_pending=1,pause_reason='IDLE_PAUSE' WHERE id=?1",
            [id],
        )
        .unwrap();
    h.step(1_000, true);
    assert!(h.saved(id).is_paused && h.saved(id).recovery_pending);
}

#[test]
fn failed_pause_is_atomic_and_retries_trim_once() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(119_000, false);
    h.store.connection.execute_batch("CREATE TRIGGER fail_idle BEFORE UPDATE ON work_records WHEN NEW.pause_reason='IDLE_PAUSE' BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
    h.clock.advance(1_000);
    let now = h.clock.now();
    let result = h.store.monitor_tick(
        NativeSample {
            at: now,
            last_input_ticks: h.input,
            chrome_foreground: true,
            unlocked: true,
            reliable: true,
        },
        now,
    );
    assert!(result.is_err());
    assert!(!h.saved(id).is_paused);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
    h.store
        .connection
        .execute_batch("DROP TRIGGER fail_idle")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn idle_pause_threshold_validation_and_sampling_use_configured_boundary() {
    let mut times = TrackingTimes::default();
    for invalid in [0, -1, 86401, times.idle_end_seconds] {
        times.idle_pause_seconds = invalid;
        assert!(times.validate().is_err());
    }
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 2;
    h.store.monitor.config.poll_interval_seconds = 5;
    h.start();
    assert!(h.store.monitor_sample_due(h.clock.now().ticks_ms + 2_000));
}

#[test]
fn continuous_input_does_not_false_pause_at_a_one_second_threshold() {
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 1;
    let id = h.start();
    for _ in 0..20 {
        h.step(1_000, true);
        assert!(!h.saved(id).is_paused);
    }
    assert_eq!(h.saved(id).duration_ms, 20_000);
}

#[test]
fn scheduler_gap_excludes_downtime_and_needs_input_after_reconfirmation() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    h.step(180_000, true);
    assert!(h.saved(id).is_paused); // System gap raised the input floor to this sample.
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
}
