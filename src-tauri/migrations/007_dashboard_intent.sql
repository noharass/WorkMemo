ALTER TABLE work_records ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1));
ALTER TABLE work_records ADD COLUMN demo_batch TEXT;
ALTER TABLE monitoring_settings ADD COLUMN browsing_only INTEGER NOT NULL DEFAULT 0 CHECK(browsing_only IN (0,1));
CREATE INDEX records_demo_date ON work_records(is_demo,start_time);
