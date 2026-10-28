use super::*;
use crate::monitor::*;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, Serialize)]
pub struct Notice {
    pub kind: String,
    pub record: WorkRecord,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
}

impl Store {
    pub fn monitor_config(&self) -> Result<MonitorConfig> {
        let (enabled, revision, times, poll_interval_seconds, auto_resume_manual, browsing_only) = self
            .connection
            .query_row(
                "SELECT enabled,revision,idle_warning_seconds,idle_end_seconds,away_pause_seconds,hold_seconds,poll_interval_seconds,auto_resume_manual,browsing_only FROM monitoring_settings WHERE id=1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, TrackingTimes { idle_warning_seconds: r.get(2)?, idle_end_seconds: r.get(3)?, away_pause_seconds: r.get(4)?, hold_seconds: r.get(5)? }, r.get(6)?, r.get(7)?, r.get(8)?)),
            )
            .map_err(db_error)?;
        let mut statement = self
            .connection
            .prepare("SELECT id,url_prefix,category,match_mode FROM work_urls ORDER BY id")
            .map_err(db_error)?;
        let rules = statement
            .query_map([], |r| {
                Ok(WorkUrl {
                    id: r.get(0)?,
                    url_prefix: r.get(1)?,
                    category: r.get(2)?,
                    match_mode: r.get(3)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        times.validate()?;
        if !(1..=5).contains(&poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        Ok(MonitorConfig {
            browsing_only,
            poll_interval_seconds,
            auto_resume_manual,
            times,
            enabled,
            revision,
            rules,
        })
    }

    pub fn save_monitor_config(&mut self, input: ConfigInput) -> Result<MonitorConfig> {
        input.times.validate()?;
        if !(1..=5).contains(&input.poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        if input.rules.len() > 50 || (input.enabled && input.rules.is_empty()) {
            return Err("请配置 1 到 50 条工作 URL 后启用自动识别。".into());
        }
        let mut seen = HashSet::new();
        let mut rules = Vec::new();
        for rule in input.rules {
            let prefix = normalize_rule(&rule.url_prefix, &rule.match_mode)?;
            if !seen.insert((rule.match_mode.clone(), prefix.clone())) {
                return Err("工作 URL 重复，请合并重复规则。".into());
            }
            if !["评测", "质检", "开发", "文档"].contains(&rule.category.as_str()) {
                return Err("请选择有效的工作类别。".into());
            }
            rules.push((prefix, rule.category, rule.match_mode));
        }
        let current = self.monitor_config()?;
        if input.expected_revision != current.revision {
            return Err("监测配置已变化，请重新读取。".into());
        }
        let now = self.clock.now();
        let active = self.active()?.filter(|r| {
            r.control_mode == "AUTO"
                && !r.recovery_pending
                && r.pause_reason.as_deref() != Some("MANUAL")
        });
        let duration = active.as_ref().map(|r| self.elapsed(r, now)).transpose()?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if let (Some(record), Some(duration)) = (&active, duration) {
            if !record.is_paused {
                write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3,control_mode=?4 WHERE id=?5",
                params![duration,duration/1000,if input.enabled{"MONITOR"}else{"MANUAL"},if input.enabled{"AUTO"}else{"MANUAL"},record.id]).map_err(db_error)?;
        }
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for (prefix, category, mode) in rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
                params![prefix, category, mode],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET enabled=?1,revision=revision+1,idle_warning_seconds=?2,idle_end_seconds=?3,away_pause_seconds=?4,hold_seconds=?5,poll_interval_seconds=?6,auto_resume_manual=?7 WHERE id=1",
            params![input.enabled,input.times.idle_warning_seconds,input.times.idle_end_seconds,input.times.away_pause_seconds,input.times.hold_seconds,input.poll_interval_seconds,input.auto_resume_manual],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        if active.is_some() {
            self.segment = None;
            self.monitor.monitor_pause_since = Some(now.ticks_ms);
        }
        self.monitor.config = self.monitor_config()?;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.away_since = None;
        self.monitor.status.away_pause_remaining_seconds = None;
        self.monitor.input_floor = now.ticks_ms;
        Ok(self.monitor.config.clone())
    }

    pub fn activate_monitoring(&mut self) {
        self.monitor.active = true;
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
    }

    pub fn observe_page(&mut self, page: PageSample) {
        if page.ready && page.revision == self.monitor.config.revision {
            self.monitor.last_trusted_page = Some(page.at.ticks_ms);
        }
        self.monitor.page = Some(page);
    }

    pub fn monitor_sample_due(&self, now: i64) -> bool {
        self.monitor.page_activity_at.is_some()
            || self.monitor.native.is_none_or(|sample| {
                now.saturating_sub(sample.at.ticks_ms)
                    >= self.monitor.config.poll_interval_seconds * 1000
            })
            || self.monitor.last_input.is_some_and(|last| {
                [
                    self.monitor.config.times.idle_warning_seconds * 1000,
                    self.monitor.config.times.idle_end_seconds * 1000,
                ]
                .iter()
                .any(|threshold| {
                    now >= last + threshold
                        && self
                            .monitor
                            .native
                            .is_none_or(|s| s.at.ticks_ms < last + threshold)
                })
            })
    }

    pub fn observe_browser_page(&mut self, client: u64, page: PageSample) {
        // A background Chrome profile cannot overwrite the focused profile.
        if page.focused
            || self.monitor.browser_owner.is_none()
            || self.monitor.browser_owner == Some(client)
        {
            self.monitor.browser_owner = Some(client);
            self.observe_page(page);
        }
    }

    pub fn observe_browser_activity(&mut self, client: u64) {
        if self.monitor.browser_owner == Some(client) {
            if let Some(page) = self.monitor.page.as_ref().filter(|p| {
                p.focused
                    && p.ready
                    && p.rule_id.is_some()
                    && p.revision == self.monitor.config.revision
            }) {
                self.monitor.page_activity_at = Some(page.at.ticks_ms);
            }
        }
    }

    // Close/trim current-process intervals at a trusted monotonic boundary.
    // Old sessions and legacy baselines are never reconstructed from wall time.
    fn close_at(
        &mut self,
        cutoff: i64,
        reason: &str,
        finish: bool,
        confirmed: TimePoint,
    ) -> Result<()> {
        let Some(record) = self.active()? else {
            return Ok(());
        };
        if record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL") {
            return Ok(());
        }
        if finish {
            self.monitor.status.idle_warning = false;
        }
        let duration = self.elapsed(&record, confirmed)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_segments SET duration_ms=MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            checkpoint_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_ticks_ms=start_ticks_ms+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),state='CLOSED'
            WHERE record_id=?2 AND clock_session=?3 AND start_ticks_ms IS NOT NULL",
            params![cutoff, record.id, self.clock_session],
        )
        .map_err(db_error)?;
        let total:i64=tx.query_row("SELECT legacy_duration_ms+COALESCE((SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1),0) FROM work_records WHERE id=?1",[record.id],|r|r.get(0)).map_err(db_error)?;
        tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3 WHERE id=?4",params![total,total/1000,if finish{None}else{Some(reason)},record.id]).map_err(db_error)?;
        if finish {
            finish_row(&tx, record.id, record.start_time, confirmed.wall_ms, reason)?;
        }
        tx.commit().map_err(db_error)?;
        self.segment = None;
        if finish {
            self.monitor.record_ended(confirmed);
            self.monitor.input_floor = cutoff;
        }
        Ok(())
    }

    pub fn system_unavailable(&mut self, at: TimePoint) -> Result<()> {
        self.close_at(at.ticks_ms, "MONITOR", false, self.clock.now())?;
        self.monitor.monitor_pause_since.get_or_insert(at.ticks_ms);
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn monitor_tick(&mut self, sample: NativeSample, now: TimePoint) -> Result<()> {
        if !self.monitor.active {
            return Ok(());
        }
        let last_tick = self.monitor.last_tick.replace(now.ticks_ms);
        if let Some(last) = last_tick.filter(|last| now.ticks_ms.saturating_sub(*last) > 10_000) {
            self.system_unavailable(TimePoint {
                ticks_ms: last,
                wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
            })?;
        }
        self.monitor.native = Some(sample);
        let native_ok = sample.reliable
            && sample.unlocked
            && now.ticks_ms.saturating_sub(sample.at.ticks_ms) <= 10_000
            && sample.last_input_ticks <= now.ticks_ms
            && sample.last_input_ticks >= 0;
        if !native_ok {
            self.system_unavailable(now)?;
        }
        let old_input = self.monitor.last_input;
        let new_input = if native_ok {
            Some(old_input.map_or(sample.last_input_ticks, |old| {
                old.max(sample.last_input_ticks)
            }))
        } else {
            old_input
        };
        let protected = |record: &WorkRecord| {
            record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL")
        };
        // A restored input arriving after an expired idle deadline starts a new
        // record; it must not silently extend the old one.
        if let (Some(old), Some(new)) = (old_input, new_input) {
            if new > old
                && new >= old.saturating_add(self.monitor.config.times.idle_end_seconds * 1000)
                && self.active()?.is_some_and(|r| !protected(&r))
            {
                self.close_at(old, "IDLE", true, now)?;
                self.monitor.input_floor = old
                    .saturating_add(self.monitor.config.times.idle_end_seconds * 1000)
                    .saturating_sub(1);
            }
        }
        self.monitor.last_input = new_input;
        if new_input != old_input {
            self.monitor.warning_dismissed_for = None;
        }
        let connected = self
            .monitor
            .page
            .as_ref()
            .is_some_and(|p| now.ticks_ms.saturating_sub(p.at.ticks_ms) <= BROWSER_TIMEOUT_MS);
        let page_known = connected
            && self
                .monitor
                .page
                .as_ref()
                .is_some_and(|p| p.ready && p.revision == self.monitor.config.revision);
        let rule = self
            .monitor
            .page
            .as_ref()
            .and_then(|page| {
                self.monitor
                    .config
                    .rules
                    .iter()
                    .find(|rule| Some(rule.id) == page.rule_id)
            })
            .cloned();
        let matched = page_known
            && self.monitor.config.enabled
            && sample.chrome_foreground
            && self.monitor.page.as_ref().is_some_and(|p| p.focused)
            && rule.is_some();
        if !page_known
            || !self.monitor.config.enabled
            || self.monitor.config.browsing_only
            || self.active()?.is_some()
            || self
                .monitor
                .candidate
                .as_ref()
                .is_some_and(|c| rule.as_ref().is_none_or(|r| r.id != c.rule_id))
        {
            self.monitor.candidate = None;
        }
        if matched && !self.monitor.page_was_matched {
            self.monitor.entered_at = self.monitor.page.as_ref().map(|page| page.at.ticks_ms);
        }
        if !matched {
            self.monitor.entered_at = None;
        }
        self.monitor.page_was_matched = matched;
        let activity = self.monitor.page_activity_at.take();
        let candidate_input = new_input.map(|last| {
            if matched
                && native_ok
                && last > self.monitor.input_floor
                && now.ticks_ms - last <= RECENT_INPUT_MS
            {
                if let Some(at) = activity.filter(|at| {
                    *at >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                        && *at <= now.ticks_ms
                        && now.ticks_ms - *at <= 2_000
                }) {
                    return last.max(at);
                }
            }
            last
        });

        if !page_known
            || !self.monitor.config.enabled
            || self
                .monitor
                .browse_ready_rule
                .is_some_and(|id| rule.as_ref().is_none_or(|r| r.id != id))
        {
            self.monitor.browse_ready_rule = None;
        }
        if matched
            && native_ok
            && candidate_input.is_some_and(|i| {
                i > self.monitor.input_floor && now.ticks_ms - i <= RECENT_INPUT_MS
            })
        {
            self.monitor.browse_ready_rule = rule.as_ref().map(|r| r.id);
        }
        // Manual pauses remain protected from deadlines. A new input after the pause,
        // on a confirmed matching page, may explicitly resume the same record under
        // automatic monitoring when the user has enabled this behavior.
        if matched
            && native_ok
            && !self.monitor.config.browsing_only
            && self.monitor.config.auto_resume_manual
        {
            if let Some(record) = self.active()?.filter(|r| {
                r.is_paused && !r.recovery_pending && r.pause_reason.as_deref() == Some("MANUAL")
            }) {
                if let (Some(last), Some(entered)) = (candidate_input, self.monitor.entered_at) {
                    if last >= entered
                        && last > self.monitor.input_floor
                        && now.ticks_ms - last <= RECENT_INPUT_MS
                    {
                        self.resume_at(
                            record.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(record.start_time),
                            },
                            "AUTO",
                        )?;
                    }
                }
            }
        }

        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if record.control_mode == "AUTO" && (!page_known || !native_ok) {
                let cutoff = self
                    .monitor
                    .last_trusted_page
                    .unwrap_or(now.ticks_ms)
                    .min(now.ticks_ms);
                if !record.is_paused || record.pause_reason.as_deref() != Some("MONITOR") {
                    self.close_at(cutoff, "MONITOR", false, now)?;
                    self.monitor.monitor_pause_since = Some(cutoff);
                }
            }
            let mut deadlines = Vec::new();
            if let Some(last) = new_input {
                deadlines.push((
                    last.saturating_add(self.monitor.config.times.idle_end_seconds * 1000),
                    0,
                    "IDLE",
                    last,
                ));
            }
            if let Some(away) = self.monitor.away_since {
                deadlines.push((
                    away.saturating_add(
                        self.monitor.config.times.away_pause_seconds * 1000
                            + self.monitor.config.times.hold_seconds * 1000,
                    ),
                    1,
                    "AWAY",
                    away.saturating_add(self.monitor.config.times.away_pause_seconds * 1000),
                ));
            }
            if let Some(pause) = self.monitor.monitor_pause_since {
                deadlines.push((
                    pause.saturating_add(self.monitor.config.times.hold_seconds * 1000),
                    2,
                    "RECOVERY",
                    pause,
                ));
            }
            deadlines.sort_by_key(|d| (d.0, d.1));
            if let Some((deadline, _, reason, cutoff)) =
                deadlines.first().copied().filter(|d| d.0 <= now.ticks_ms)
            {
                self.close_at(cutoff, reason, true, now)?;
                self.monitor.input_floor = deadline;
            } else if record.control_mode == "AUTO" && native_ok && page_known {
                if matched {
                    self.monitor.away_since = None;
                    let fresh = candidate_input.is_some_and(|last| {
                        last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                            && last > self.monitor.input_floor
                            && now.ticks_ms - last <= RECENT_INPUT_MS
                    });
                    if record.is_paused
                        && matches!(record.pause_reason.as_deref(), Some("AWAY" | "MONITOR"))
                        && fresh
                        && !self.monitor.config.browsing_only
                    {
                        let last = candidate_input.unwrap();
                        self.resume_at(
                            record.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(record.start_time),
                            },
                            "AUTO",
                        )?;
                    }
                } else {
                    let away = *self.monitor.away_since.get_or_insert(now.ticks_ms);
                    if now.ticks_ms
                        >= away.saturating_add(self.monitor.config.times.away_pause_seconds * 1000)
                        && !record.is_paused
                    {
                        self.close_at(
                            away.saturating_add(
                                self.monitor.config.times.away_pause_seconds * 1000,
                            ),
                            "AWAY",
                            false,
                            now,
                        )?;
                    }
                }
            }
        }

        if self.active()?.is_none() && matched && native_ok {
            if let (Some(last), Some(entered), Some(rule)) =
                (candidate_input, self.monitor.entered_at, rule)
            {
                if last >= entered
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
                {
                    if !self.monitor.config.browsing_only && self.monitor.candidate.is_none() {
                        self.monitor.candidate_sequence += 1;
                        self.monitor.candidate = Some(StartCandidate {
                            id: self.monitor.candidate_sequence,
                            rule_id: rule.id,
                            category: rule.category.clone(),
                        });
                    }
                }
            }
        }
        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if let Some(last) = self.monitor.last_input {
                let input_wall = now
                    .wall_ms
                    .saturating_sub(now.ticks_ms.saturating_sub(last))
                    .max(record.start_time);
                if new_input != old_input || record.last_input_time.is_none() {
                    self.connection
                        .execute(
                            "UPDATE work_records SET last_input_time=?1 WHERE id=?2",
                            params![input_wall, record.id],
                        )
                        .map_err(db_error)?;
                }
                self.monitor.status.idle_warning = native_ok
                    && now.ticks_ms.saturating_sub(last)
                        >= self.monitor.config.times.idle_warning_seconds * 1000
                    && now.ticks_ms.saturating_sub(last)
                        < self.monitor.config.times.idle_end_seconds * 1000
                    && self.monitor.warning_dismissed_for != Some(last);
            }
        } else {
            self.monitor.status.idle_warning = false;
        }
        self.monitor.status.away_pause_remaining_seconds = if native_ok
            && page_known
            && !matched
            && self
                .active()?
                .is_some_and(|r| r.control_mode == "AUTO" && !r.is_paused && !r.recovery_pending)
        {
            self.monitor.away_since.map(|away| {
                let remaining = away
                    .saturating_add(self.monitor.config.times.away_pause_seconds * 1000)
                    .saturating_sub(now.ticks_ms)
                    .max(0);
                (remaining + 999) / 1000
            })
        } else {
            None
        };
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.status.start_candidate = self.monitor.candidate.clone();
        self.monitor.status.browse_ready = self.monitor.config.enabled
            && page_known
            && native_ok
            && self.monitor.browse_ready_rule.is_some();
        self.monitor.status.browse_category = if self.monitor.status.browse_ready {
            self.monitor
                .config
                .rules
                .iter()
                .find(|r| Some(r.id) == self.monitor.browse_ready_rule)
                .map(|r| r.category.clone())
        } else {
            None
        };
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.revision = self.monitor.config.revision;
        self.monitor.status.native_available = native_ok;
        self.monitor.status.browser_connected = connected;
        self.monitor.status.work_page = matched;
        self.monitor.status.message = if !native_ok {
            "系统状态暂不可确认，已暂停计时"
        } else if !self.monitor.config.enabled {
            "自动页面识别未启用；手动计时仍有空闲保护"
        } else if self.monitor.config.browsing_only {
            if matched {
                "仅浏览 · 工作页面已就绪，点击开始记录"
            } else {
                "仅浏览 · 当前不计时"
            }
        } else if self.monitor.candidate.is_some() {
            "工作页面已就绪，等待确认开始记录"
        } else if self.active()?.is_some_and(|r| r.recovery_pending) {
            "有上次待恢复任务，请先继续或结束"
        } else if self
            .active()?
            .is_some_and(|r| r.pause_reason.as_deref() == Some("MANUAL"))
        {
            if self.monitor.config.auto_resume_manual {
                "已手动暂停，返回工作页面操作后自动继续"
            } else {
                "已手动暂停，等待明确继续"
            }
        } else if !connected {
            "等待 Chrome 扩展连接"
        } else if !page_known {
            "等待扩展同步最新工作页面规则"
        } else if !matched {
            "当前不在配置的工作页面"
        } else if self.active()?.is_none() {
            "已识别工作页面，等待新的鼠标或键盘活动"
        } else {
            "工作监测正常"
        }
        .into();
        self.checkpoint()
    }

    pub fn current_notice(&self) -> Result<Option<Notice>> {
        let id:Option<i64>=self.connection.query_row("SELECT record_id FROM end_reminders JOIN work_records ON work_records.id=end_reminders.record_id WHERE dismissed=0 AND status='FINISHED' AND settlement_status='PENDING' AND is_demo=0 ORDER BY record_id LIMIT 1",[],|r|r.get(0)).optional().map_err(db_error)?;
        if let Some(id) = id {
            return Ok(Some(Notice {
                kind: "ended".into(),
                idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                record: self.record(id)?,
            }));
        }
        if self.monitor.status.idle_warning {
            if let Some(record) = self.active()? {
                return Ok(Some(Notice {
                    kind: "idle".into(),
                    idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                    idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                    record,
                }));
            }
        }
        Ok(None)
    }
    pub fn defer_notice(&mut self, id: i64, kind: &str) -> Result<()> {
        match kind {
            "ended" => {
                self.connection
                    .execute(
                        "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
                        [id],
                    )
                    .map_err(db_error)?;
            }
            "idle" => {
                if self.active()?.is_some_and(|r| r.id == id) {
                    self.monitor.warning_dismissed_for = self.monitor.last_input;
                    self.monitor.status.idle_warning = false;
                }
            }
            _ => return Err("提醒类型无效。".into()),
        }
        Ok(())
    }
}

impl Store {
    pub fn enter_browsing(&mut self) -> Result<()> {
        let active = self.active()?;
        let now = self.clock.now();
        let tx = self.connection.transaction().map_err(db_error)?;
        if let Some(r) = active.as_ref() {
            let duration = match self.segment.as_ref() {
                Some(s) if s.row_id == r.id => {
                    s.base_ms + now.ticks_ms.saturating_sub(s.started_ticks).max(0)
                }
                _ => r.duration_ms,
            };
            if !r.is_paused {
                write_segment(&tx, self.segment.as_ref(), r.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason='MANUAL' WHERE id=?3",params![duration,duration/1000,r.id]).map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.monitor.config.browsing_only = true;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.browse_ready = false;
        self.monitor.candidate = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browsing_only = true;
        self.monitor.status.idle_warning = false;
        self.monitor.status.message = "仅浏览 · 当前不计时".into();
        self.monitor.input_floor = now.ticks_ms;
        Ok(())
    }
    pub fn confirm_work(&mut self, candidate_id: Option<u64>, own_focus: bool) -> Result<()> {
        let now = self.clock.now();
        let native = self
            .monitor
            .native
            .filter(|n| {
                n.reliable
                    && n.unlocked
                    && now.ticks_ms - n.at.ticks_ms <= 5000
                    && (n.chrome_foreground || own_focus)
            })
            .ok_or("无法确认系统状态，请返回工作页面后重试。")?;
        let _ = native;
        let page = self
            .monitor
            .page
            .as_ref()
            .filter(|p| {
                p.ready
                    && p.revision == self.monitor.config.revision
                    && now.ticks_ms - p.at.ticks_ms <= BROWSER_TIMEOUT_MS
            })
            .ok_or("页面连接已变化，请返回工作页面后重试。")?;
        let rule = self
            .monitor
            .config
            .rules
            .iter()
            .find(|r| Some(r.id) == page.rule_id)
            .cloned()
            .ok_or("当前页面未匹配工作规则。")?;
        if !self.monitor.config.enabled {
            return Err("请先启用工作页面识别。".into());
        }
        let active = self.active()?;
        if let Some(c) = candidate_id {
            if self
                .monitor
                .candidate
                .as_ref()
                .is_none_or(|p| p.id != c || p.rule_id != rule.id)
                || active.is_some()
            {
                return Err("开工提示已失效，请重新确认。".into());
            }
        } else if !self.monitor.config.browsing_only
            || self.monitor.browse_ready_rule != Some(rule.id)
        {
            return Err("请返回工作页面操作后，再点击开工入口。".into());
        }
        if let Some(record) = active {
            if record.recovery_pending {
                return Err("请先在主窗口处理上次待恢复的任务。".into());
            }
            if !record.is_paused {
                return Err("当前任务已在计时。".into());
            }
            self.resume_at(record.id, now, "AUTO")?;
        } else {
            self.start_at(
                StartInput {
                    category: rule.category,
                    quantity: None,
                    remark: String::new(),
                },
                "AUTO",
                now,
                false,
            )?;
        }
        Ok(())
    }
}

impl Store {
    pub fn browser_disconnected(&mut self, client: u64) {
        if self.monitor.browser_owner != Some(client) {
            return;
        }
        self.monitor.browser_owner = None;
        self.monitor.page = None;
        self.monitor.candidate = None;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browse_ready = false;
        self.monitor.status.browse_category = None;
        self.monitor.status.browser_connected = false;
    }
}
