-- Persist the time a record stopped so restarts and repeated pauses do not
-- extend its lifetime. This additive migration preserves records and children.
ALTER TABLE work_records ADD COLUMN paused_at INTEGER
    CHECK(paused_at IS NULL OR paused_at >= 0);
CREATE INDEX paused_records_by_day ON work_records(paused_at)
    WHERE status IN ('WORKING','SUSPENDED') AND is_demo=0;
