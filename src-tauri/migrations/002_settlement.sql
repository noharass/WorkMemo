-- Preserve the AUTOINCREMENT high-water mark, including deleted record IDs.
CREATE TEMP TABLE old_record_sequence AS SELECT seq FROM sqlite_sequence WHERE name='work_records';
CREATE TABLE work_records_v2 (
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
    pause_reason TEXT CHECK(pause_reason IN ('MANUAL','APP_CLOSE','RECOVERY','AWAY','MONITOR')),
    confirmed_end_time INTEGER CHECK(confirmed_end_time >= 0),
    last_input_time INTEGER CHECK(last_input_time >= 0),
    end_reason TEXT CHECK(end_reason IN ('MANUAL','SWITCH','IDLE','AWAY','RECOVERY')),
    legacy_duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(legacy_duration_ms >= 0),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1 AND settlement_status!='IN_PROGRESS')
       OR (status!='FINISHED' AND end_time IS NULL AND settlement_status='IN_PROGRESS')),
    CHECK(settlement_status!='COMPLETE' OR quantity IS NOT NULL)
);
INSERT INTO work_records_v2(id,category,quantity,remark,start_time,end_time,duration_seconds,duration_ms,status,is_paused,recovery_pending,
    settlement_status,pause_reason,confirmed_end_time,legacy_duration_ms)
SELECT id,category,quantity,remark,start_time,end_time,duration_seconds,duration_ms,status,is_paused,recovery_pending,
    CASE WHEN status='FINISHED' THEN 'COMPLETE' ELSE 'IN_PROGRESS' END,
    CASE WHEN status='WORKING' AND is_paused=1 THEN 'MANUAL' ELSE NULL END,
    end_time,duration_ms FROM work_records;
DROP TABLE work_records;
ALTER TABLE work_records_v2 RENAME TO work_records;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM old_record_sequence),0)) WHERE name='work_records';
INSERT INTO sqlite_sequence(name,seq) SELECT 'work_records',seq FROM old_record_sequence
    WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name='work_records');
DROP TABLE old_record_sequence;
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';
CREATE INDEX pending_settlement ON work_records(id) WHERE status='FINISHED' AND settlement_status='PENDING';

-- Old durations remain a baseline; no synthetic historical intervals are created.
CREATE TABLE work_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL REFERENCES work_records(id) ON DELETE CASCADE,
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    checkpoint_time INTEGER NOT NULL CHECK(checkpoint_time >= start_time),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    state TEXT NOT NULL CHECK(state IN ('OPEN','CLOSED','RECOVERED')),
    CHECK((state='OPEN' AND end_time IS NULL) OR (state!='OPEN' AND end_time=checkpoint_time)),
    CHECK(checkpoint_time-start_time=duration_ms)
);
CREATE UNIQUE INDEX one_open_segment ON work_segments(record_id) WHERE state='OPEN';
CREATE INDEX record_segments ON work_segments(record_id,id);
CREATE TABLE record_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL REFERENCES work_records(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL CHECK(revision > 0),
    changed_at INTEGER NOT NULL CHECK(changed_at >= 0),
    before_json TEXT NOT NULL,
    after_json TEXT NOT NULL,
    UNIQUE(record_id,revision)
);
