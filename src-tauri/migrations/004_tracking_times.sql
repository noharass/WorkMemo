ALTER TABLE monitoring_settings ADD COLUMN idle_warning_seconds INTEGER NOT NULL DEFAULT 300 CHECK(idle_warning_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN idle_end_seconds INTEGER NOT NULL DEFAULT 420 CHECK(idle_end_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN away_pause_seconds INTEGER NOT NULL DEFAULT 120 CHECK(away_pause_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN hold_seconds INTEGER NOT NULL DEFAULT 600 CHECK(hold_seconds BETWEEN 1 AND 86400);
