use super::*;

const DAY_MS: i64 = 86_400_000;
const BEIJING_OFFSET_MS: i64 = 8 * 3_600_000;

// Calendar policy uses fixed UTC+8, independently of the Windows time zone.
fn beijing_day_start(wall_ms: i64) -> i64 {
    wall_ms.max(0).saturating_add(BEIJING_OFFSET_MS) / DAY_MS * DAY_MS - BEIJING_OFFSET_MS
}

#[cfg(test)]
#[path = "day_rollover_tests.rs"]
mod tests;

impl Store {
    pub(crate) fn expire_previous_day_pauses(&mut self) -> Result<usize> {
        let now = self.clock.now();
        let boundary = beijing_day_start(now.wall_ms);
        let ids: Vec<i64> = self
            .connection
            .prepare(
                "SELECT id FROM work_records WHERE status IN ('WORKING','SUSPENDED')
             AND (is_paused=1 OR recovery_pending=1 OR status='SUSPENDED')
             AND is_demo=0 AND paused_at<?1 ORDER BY id",
            )
            .map_err(db_error)?
            .query_map([boundary], |row| row.get(0))
            .map_err(db_error)?
            .collect::<rusqlite::Result<_>>()
            .map_err(db_error)?;
        if ids.is_empty() {
            return Ok(0);
        }
        let active_id = self.active()?.map(|record| record.id);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let mut expired_rules = Vec::<i64>::new();
        for id in &ids {
            expired_rules.extend(
                tx.prepare(
                    "SELECT u.id FROM work_urls u JOIN work_tasks t ON t.id=u.task_id
                 WHERE t.current_record_id=?1",
                )
                .map_err(db_error)?
                .query_map([id], |row| row.get::<_, i64>(0))
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?,
            );
            // Keep the saved duration, quantity, remark and real segment end.
            // IDLE is the existing automatic-inactivity reason; no synthetic work.
            let changed = tx
                .execute(
                    "UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,
                 settlement_status='PENDING',confirmed_end_time=?2,end_reason='IDLE',
                 end_time=MAX(start_time,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments
                    WHERE record_id=?1 AND duration_ms>0),paused_at,last_input_time,start_time)),
                 pause_reason=NULL,paused_at=NULL WHERE id=?1
                 AND status IN ('WORKING','SUSPENDED') AND paused_at<?3
                 AND (is_paused=1 OR recovery_pending=1 OR status='SUSPENDED') AND is_demo=0",
                    params![id, now.wall_ms.max(0), boundary],
                )
                .map_err(db_error)?;
            if changed != 1 {
                return Err("跨日结束时任务状态已变化，未提交本批修改。".into());
            }
            tx.execute(
                "INSERT INTO end_reminders(record_id) VALUES(?1) ON CONFLICT(record_id) DO NOTHING",
                [id],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        if active_id.is_some_and(|id| ids.contains(&id)) {
            self.segment = None;
            self.monitor.record_ended(now);
        }
        if self
            .monitor
            .candidate
            .as_ref()
            .is_some_and(|c| expired_rules.contains(&c.rule_id))
        {
            self.monitor.candidate = None;
            self.monitor.status.start_candidate = None;
        }
        if let Some(rule) = self
            .monitor
            .page
            .as_ref()
            .and_then(|p| p.rule_id)
            .filter(|rule| expired_rules.contains(rule))
        {
            self.monitor.status.finished_page_rule = Some(rule);
        }
        Ok(ids.len())
    }
}
