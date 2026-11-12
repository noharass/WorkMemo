-- Keep creation request IDs durable so a lost HTTP response cannot duplicate work.
CREATE TABLE manual_entry_requests (
    request_id TEXT PRIMARY KEY CHECK(length(request_id) BETWEEN 16 AND 80),
    record_id INTEGER UNIQUE REFERENCES work_records(id) ON DELETE SET NULL,
    fingerprint TEXT NOT NULL
);
