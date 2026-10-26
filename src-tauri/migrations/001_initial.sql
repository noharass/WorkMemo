CREATE TABLE work_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    quantity REAL NOT NULL CHECK(quantity > 0 AND quantity <= 1000000000),
    remark TEXT NOT NULL DEFAULT '' CHECK(length(remark) <= 2000),
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','WORKING','FINISHED')),
    is_paused INTEGER NOT NULL DEFAULT 1 CHECK(is_paused IN (0,1)),
    recovery_pending INTEGER NOT NULL DEFAULT 0 CHECK(recovery_pending IN (0,1)),
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1)
       OR (status!='FINISHED' AND end_time IS NULL))
);
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';
