CREATE TABLE import_sources(source_key TEXT PRIMARY KEY, record_id INTEGER NOT NULL REFERENCES work_records(id) ON DELETE CASCADE, fingerprint TEXT NOT NULL);
