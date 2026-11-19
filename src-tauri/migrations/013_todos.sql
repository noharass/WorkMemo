CREATE TABLE todos (
    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 80),
    created_at INTEGER NOT NULL CHECK(created_at >= 0),
    completed_at INTEGER CHECK(completed_at >= 0)
);

CREATE TABLE todo_work_records (
    record_id INTEGER PRIMARY KEY REFERENCES work_records(id) ON DELETE CASCADE,
    todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE
);
CREATE INDEX todo_work_records_by_todo ON todo_work_records(todo_id);
