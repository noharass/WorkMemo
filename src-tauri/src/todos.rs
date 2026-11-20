use super::day_rollover::beijing_day_start;
use super::{Result, Store, db_error};
use rusqlite::{OptionalExtension, Transaction, TransactionBehavior, params};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub completed_at: Option<i64>,
    pub open_record_id: Option<i64>,
    pub duplicate_number: Option<i64>,
    pub planned_today: bool,
    pub finished_count: i64,
    pub finished_duration_ms: i64,
    pub last_category: Option<String>,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct TodoWorkEntry {
    pub id: i64,
    pub start_time: i64,
    pub duration_ms: i64,
    pub category: String,
}

fn title(value: &str) -> Result<&str> {
    let trimmed = value.trim();
    if !(1..=80).contains(&trimmed.chars().count()) || trimmed.chars().any(char::is_control) {
        return Err("请输入 1 到 80 个字符的单行标题。".into());
    }
    Ok(trimmed)
}

const OPEN_RECORD: &str = "SELECT r.id FROM todo_work_records AS link
    JOIN work_records AS r ON r.id=link.record_id
    WHERE link.todo_id=t.id AND r.status IN ('WORKING','SUSPENDED') LIMIT 1";

pub(super) fn title_for_start(tx: &Transaction<'_>, id: &str) -> Result<String> {
    let (title, completed_at, open_record_id): (String, Option<i64>, Option<i64>) = tx
        .query_row(
            &format!("SELECT t.title,t.completed_at,({OPEN_RECORD}) FROM todos AS t WHERE t.id=?1"),
            [id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()
        .map_err(db_error)?
        .ok_or("待办已删除，请刷新清单。")?;
    if completed_at.is_some() {
        return Err("待办已完成，请先取消勾选。".into());
    }
    if open_record_id.is_some() {
        return Err("这项待办已有未结束的工作，请继续原记录。".into());
    }
    Ok(title)
}

fn todo_title_and_completion(tx: &Transaction<'_>, id: &str) -> Result<(String, Option<i64>)> {
    tx.query_row(
        "SELECT title,completed_at FROM todos WHERE id=?1",
        [id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
    .optional()
    .map_err(db_error)?
    .ok_or_else(|| "待办已删除，请刷新清单。".into())
}

fn ensure_pending_title_available(tx: &Transaction<'_>, title: &str, action: &str) -> Result<()> {
    let exists: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM todos WHERE completed_at IS NULL AND title=?1 COLLATE NOCASE)",
            [title],
            |row| row.get(0),
        )
        .map_err(db_error)?;
    if exists {
        return Err(format!("已有同名的未完成待办，{action}。"));
    }
    Ok(())
}

impl Store {
    pub fn list_todos(&self) -> Result<Vec<Todo>> {
        self.connection
            .prepare(&format!(
                "WITH finished AS (
                    SELECT link.todo_id,COUNT(*) AS record_count,SUM(r.duration_ms) AS duration_ms,
                           MAX(r.id) AS last_id
                    FROM todo_work_records AS link JOIN work_records AS r ON r.id=link.record_id
                    WHERE r.status='FINISHED' AND r.is_demo=0
                    GROUP BY link.todo_id
                 )
                 SELECT t.id,t.title,t.completed_at,({OPEN_RECORD}),
                 CASE WHEN COUNT(*) OVER (PARTITION BY t.title COLLATE NOCASE,t.completed_at IS NOT NULL)>1
                      THEN t.sequence END,
                 COALESCE(t.planned_day=?1,0),COALESCE(f.record_count,0),
                 COALESCE(f.duration_ms,0),last_record.category
                 FROM todos AS t
                 LEFT JOIN finished AS f ON f.todo_id=t.id
                 LEFT JOIN work_records AS last_record ON last_record.id=f.last_id
                 ORDER BY t.completed_at IS NOT NULL,t.completed_at DESC,t.sequence"
            ))
            .map_err(db_error)?
            .query_map([beijing_day_start(self.clock.now().wall_ms)], |row| {
                Ok(Todo {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    completed_at: row.get(2)?,
                    open_record_id: row.get(3)?,
                    duplicate_number: row.get(4)?,
                    planned_today: row.get(5)?,
                    finished_count: row.get(6)?,
                    finished_duration_ms: row.get(7)?,
                    last_category: row.get(8)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<_>>()
            .map_err(db_error)
    }

    pub fn todo_work_history(&self, id: &str) -> Result<Vec<TodoWorkEntry>> {
        self.connection
            .prepare(
                "SELECT r.id,r.start_time,r.duration_ms,r.category
                 FROM todo_work_records AS link JOIN work_records AS r ON r.id=link.record_id
                 WHERE link.todo_id=?1 AND r.status='FINISHED' AND r.is_demo=0
                 ORDER BY r.id DESC",
            )
            .map_err(db_error)?
            .query_map([id], |row| {
                Ok(TodoWorkEntry {
                    id: row.get(0)?,
                    start_time: row.get(1)?,
                    duration_ms: row.get(2)?,
                    category: row.get(3)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<_>>()
            .map_err(db_error)
    }

    pub fn set_todo_today(&self, id: &str, today: bool) -> Result<()> {
        let day = today.then(|| beijing_day_start(self.clock.now().wall_ms));
        let changed = self
            .connection
            .execute(
                "UPDATE todos SET planned_day=?2 WHERE id=?1 AND completed_at IS NULL",
                params![id, day],
            )
            .map_err(db_error)?;
        if changed == 0 {
            return Err("这项待办已完成或已删除，请刷新清单。".into());
        }
        Ok(())
    }

    pub fn create_todo(&mut self, value: &str) -> Result<()> {
        let title = title(value)?;
        let now = self.clock.now().wall_ms.max(0);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        ensure_pending_title_available(&tx, title, "请换个标题")?;
        tx.execute(
            "INSERT INTO todos(title,created_at) VALUES(?1,?2)",
            params![title, now],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)
    }

    pub fn rename_todo(&mut self, id: &str, value: &str) -> Result<()> {
        let title = title(value)?;
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let (current_title, completed_at) = todo_title_and_completion(&tx, id)?;
        if completed_at.is_none() && !current_title.eq_ignore_ascii_case(title) {
            ensure_pending_title_available(&tx, title, "请换个标题")?;
        }
        tx.execute("UPDATE todos SET title=?2 WHERE id=?1", params![id, title])
            .map_err(db_error)?;
        tx.commit().map_err(db_error)
    }

    pub fn set_todo_completed(&mut self, id: &str, completed: bool) -> Result<()> {
        let now = self.clock.now().wall_ms.max(0);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let (title, completed_at) = todo_title_and_completion(&tx, id)?;
        if !completed && completed_at.is_some() {
            ensure_pending_title_available(&tx, &title, "请先改名再取消勾选")?;
        }
        let at = completed.then(|| completed_at.unwrap_or(now));
        tx.execute(
            "UPDATE todos SET completed_at=?2 WHERE id=?1",
            params![id, at],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)
    }

    pub fn delete_todo(&self, id: &str) -> Result<()> {
        if self
            .connection
            .execute("DELETE FROM todos WHERE id=?1", [id])
            .map_err(db_error)?
            == 0
        {
            return Err("待办已删除，请刷新清单。".into());
        }
        Ok(())
    }
}
