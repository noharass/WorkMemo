-- Store::initialize disables foreign keys before the transaction, validates all
-- references before commit and enables enforcement after commit (SQLite rebuild).
CREATE TABLE work_records_v9 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    quantity REAL CHECK(quantity IS NULL OR (quantity >= 0 AND quantity <= 1000000000)),
    remark TEXT NOT NULL DEFAULT '' CHECK(length(remark) <= 2000),
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','WORKING','FINISHED')),
    is_paused INTEGER NOT NULL DEFAULT 1 CHECK(is_paused IN (0,1)),
    recovery_pending INTEGER NOT NULL DEFAULT 0 CHECK(recovery_pending IN (0,1)),
    settlement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(settlement_status IN ('IN_PROGRESS','PENDING','COMPLETE')),
    source TEXT NOT NULL DEFAULT 'MANUAL_START' CHECK(source IN ('AUTO','MANUAL_START','MANUAL_ENTRY')),
    pause_reason TEXT CHECK(pause_reason IN ('MANUAL','APP_CLOSE','RECOVERY','AWAY','MONITOR','IDLE_PAUSE')),
    confirmed_end_time INTEGER CHECK(confirmed_end_time >= 0),
    last_input_time INTEGER CHECK(last_input_time >= 0),
    end_reason TEXT CHECK(end_reason IN ('MANUAL','SWITCH','IDLE','AWAY','RECOVERY')),
    legacy_duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(legacy_duration_ms >= 0),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
    control_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK(control_mode IN ('AUTO','MANUAL')),
    is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1)),
    demo_batch TEXT,
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1 AND settlement_status!='IN_PROGRESS')
       OR (status!='FINISHED' AND end_time IS NULL AND settlement_status='IN_PROGRESS')),
    CHECK(settlement_status!='COMPLETE' OR quantity IS NOT NULL)
);
INSERT INTO work_records_v9 SELECT * FROM work_records;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM sqlite_sequence WHERE name='work_records'),0)) WHERE name='work_records_v9';
DROP TABLE work_records;
ALTER TABLE work_records_v9 RENAME TO work_records;
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';
CREATE INDEX pending_settlement ON work_records(id) WHERE status='FINISHED' AND settlement_status='PENDING';
CREATE INDEX records_demo_date ON work_records(is_demo,start_time);

ALTER TABLE monitoring_settings ADD COLUMN idle_pause_seconds INTEGER NOT NULL DEFAULT 120 CHECK(idle_pause_seconds BETWEEN 1 AND 86400);
UPDATE monitoring_settings SET idle_pause_seconds=MIN(120,idle_end_seconds-1);
CREATE TABLE category_names (
    category TEXT PRIMARY KEY CHECK(category IN ('评测','质检','开发','文档')),
    display_name TEXT NOT NULL UNIQUE CHECK(length(display_name) BETWEEN 1 AND 20),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision>=0)
);
INSERT INTO category_names(category,display_name) VALUES('评测','评测'),('质检','质检'),('开发','开发'),('文档','文档');
