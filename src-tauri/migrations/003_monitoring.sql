ALTER TABLE work_records ADD COLUMN control_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK(control_mode IN ('AUTO','MANUAL'));
ALTER TABLE work_segments ADD COLUMN clock_session TEXT;
ALTER TABLE work_segments ADD COLUMN start_ticks_ms INTEGER;
ALTER TABLE work_segments ADD COLUMN end_ticks_ms INTEGER;

CREATE TABLE monitoring_settings (
    id INTEGER PRIMARY KEY CHECK(id=1),
    enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
    revision INTEGER NOT NULL CHECK(revision>=0)
);
INSERT INTO monitoring_settings VALUES(1,0,0);
CREATE TABLE work_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_prefix TEXT NOT NULL UNIQUE CHECK(length(url_prefix)<=2048),
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档'))
);
CREATE TABLE end_reminders (
    record_id INTEGER PRIMARY KEY REFERENCES work_records(id) ON DELETE CASCADE,
    dismissed INTEGER NOT NULL DEFAULT 0 CHECK(dismissed IN (0,1))
);
-- Existing pending work remains in the list without a burst of upgrade popups.
INSERT INTO end_reminders(record_id,dismissed) SELECT id,1 FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING';
