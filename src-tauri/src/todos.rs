use super::{Result, Store, db_error};
use rusqlite::{OptionalExtension, Transaction, params};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub completed_at: Option<i64>,
    pub open_record_id: Option<i64>,
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

impl Store {
    pub fn list_todos(&self) -> Result<Vec<Todo>> {
        self.connection
            .prepare(&format!(
                "SELECT t.id,t.title,t.completed_at,({OPEN_RECORD}) FROM todos AS t
                 ORDER BY t.completed_at IS NOT NULL,t.completed_at DESC,t.sequence"
            ))
            .map_err(db_error)?
            .query_map([], |row| {
                Ok(Todo {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    completed_at: row.get(2)?,
                    open_record_id: row.get(3)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<_>>()
            .map_err(db_error)
    }

    pub fn create_todo(&self, value: &str) -> Result<()> {
        self.connection
            .execute(
                "INSERT INTO todos(title,created_at) VALUES(?1,?2)",
                params![title(value)?, self.clock.now().wall_ms.max(0)],
            )
            .map_err(db_error)?;
        Ok(())
    }

    pub fn rename_todo(&self, id: &str, value: &str) -> Result<()> {
        self.update_todo(
            "UPDATE todos SET title=?2 WHERE id=?1",
            params![id, title(value)?],
        )
    }

    pub fn set_todo_completed(&self, id: &str, completed: bool) -> Result<()> {
        let at = completed.then(|| self.clock.now().wall_ms.max(0));
        self.update_todo(
            "UPDATE todos SET completed_at=CASE WHEN ?2 IS NULL THEN NULL ELSE COALESCE(completed_at,?2) END WHERE id=?1",
            params![id, at],
        )
    }

    pub fn delete_todo(&self, id: &str) -> Result<()> {
        self.update_todo("DELETE FROM todos WHERE id=?1", [id])
    }

    fn update_todo(&self, sql: &str, values: impl rusqlite::Params) -> Result<()> {
        if self.connection.execute(sql, values).map_err(db_error)? == 0 {
            return Err("待办已删除，请刷新清单。".into());
        }
        Ok(())
    }
}
