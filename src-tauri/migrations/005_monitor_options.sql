ALTER TABLE monitoring_settings ADD COLUMN poll_interval_seconds INTEGER NOT NULL DEFAULT 1 CHECK(poll_interval_seconds BETWEEN 1 AND 5);
ALTER TABLE monitoring_settings ADD COLUMN auto_resume_manual INTEGER NOT NULL DEFAULT 1 CHECK(auto_resume_manual IN (0,1));
