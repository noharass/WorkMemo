use super::*;
use crate::monitor::{normalize_rule, normalize_url};

#[derive(Clone, Debug, Serialize)]
pub struct PageTask {
    pub id: i64,
    pub name: String,
    pub category: String,
    pub record_id: Option<i64>,
    pub finished: bool,
    pub suspended: bool,
    pub recovery_pending: bool,
}
#[derive(Clone, Debug, Serialize)]
pub struct IgnoredPage {
    pub id: i64,
    pub match_mode: String,
    pub url_prefix: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BindPageInput {
    pub expected_url: String,
    pub expected_revision: i64,
    pub match_mode: String,
    pub pattern: String,
    pub task_id: Option<i64>,
    pub new_name: Option<String>,
    pub category: Option<String>,
    pub ignore: bool,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RebindPageInput {
    pub expected_rule_id: i64,
    pub expected_revision: i64,
    pub task_id: Option<i64>,
    pub new_name: Option<String>,
    pub category: Option<String>,
}

impl Store {
    pub fn confirm_recovery_task(&mut self, task_id: i64) -> Result<()> {
        self.switch_to_named_task(task_id)
    }
    pub fn rule_task_finished(&self, rule_id: i64) -> Result<bool> {
        self.connection.query_row("SELECT COALESCE(r.status='FINISHED',0) FROM work_urls u JOIN work_tasks t ON t.id=u.task_id LEFT JOIN work_records r ON r.id=t.current_record_id WHERE u.id=?1",[rule_id],|r|r.get(0)).optional().map_err(db_error).map(|v|v.unwrap_or(false))
    }
    pub fn rebind_finished_page(&mut self, input: RebindPageInput) -> Result<()> {
        if input.expected_revision != self.monitor.config.revision
            || self.monitor.page.as_ref().is_none_or(|p| {
                !p.ready
                    || p.rule_id != Some(input.expected_rule_id)
                    || p.revision != input.expected_revision
                    || self.clock.now().ticks_ms.saturating_sub(p.at.ticks_ms)
                        > crate::monitor::BROWSER_TIMEOUT_MS
            })
            || !self.rule_task_finished(input.expected_rule_id)?
        {
            return Err("页面或任务已变化，请刷新。".into());
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let task_id = if let Some(id) = input.task_id {
            let status:Option<Option<String>>=tx.query_row("SELECT r.status FROM work_tasks t LEFT JOIN work_records r ON r.id=t.current_record_id WHERE t.id=?1",[id],|r|r.get(0)).optional().map_err(db_error)?;
            if status.is_none() || status.flatten().as_deref() == Some("FINISHED") {
                return Err("请选择未结束的任务。".into());
            }
            id
        } else {
            let name = input.new_name.as_deref().unwrap_or("").trim();
            let category = input.category.as_deref().unwrap_or("");
            if name.is_empty()
                || name.chars().count() > 80
                || !["评测", "质检", "开发", "文档"].contains(&category)
            {
                return Err("请填写有效的任务名称和类别。".into());
            }
            tx.execute(
                "INSERT INTO work_tasks(name,category) VALUES(?1,?2)",
                params![name, category],
            )
            .map_err(db_error)?;
            tx.last_insert_rowid()
        };
        let category: String = tx
            .query_row(
                "SELECT category FROM work_tasks WHERE id=?1",
                [task_id],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        tx.execute(
            "UPDATE work_urls SET task_id=?1,category=?2 WHERE id=?3",
            params![task_id, category, input.expected_rule_id],
        )
        .map_err(db_error)?;
        tx.execute(
            "UPDATE monitoring_settings SET revision=revision+1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.monitor.config = self.monitor_config()?;
        self.monitor.page = None;
        self.monitor.status.finished_page_rule = None;
        Ok(())
    }
    pub fn ignored_pages(&self) -> Result<Vec<IgnoredPage>> {
        let mut stmt = self
            .connection
            .prepare("SELECT id,match_mode,url_prefix FROM ignored_work_urls ORDER BY id")
            .map_err(db_error)?;
        stmt.query_map([], |r| {
            Ok(IgnoredPage {
                id: r.get(0)?,
                match_mode: r.get(1)?,
                url_prefix: r.get(2)?,
            })
        })
        .map_err(db_error)?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(db_error)
    }
    pub fn remove_ignored_page(&mut self, id: i64) -> Result<()> {
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let affected = tx
            .execute("DELETE FROM ignored_work_urls WHERE id=?1", [id])
            .map_err(db_error)?;
        if affected == 0 {
            return Err("忽略规则已变化，请刷新。".into());
        }
        tx.execute(
            "UPDATE monitoring_settings SET revision=revision+1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.monitor.config = self.monitor_config()?;
        Ok(())
    }
    pub fn is_ignored_page(&self, address: &str) -> Result<bool> {
        let page = url::Url::parse(address).map_err(|_| "页面地址无效。")?;
        let mut stmt = self
            .connection
            .prepare("SELECT match_mode,url_prefix FROM ignored_work_urls")
            .map_err(db_error)?;
        let rules = stmt
            .query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
            .map_err(db_error)?;
        for rule in rules {
            let (mode, pattern) = rule.map_err(db_error)?;
            let matched = match mode.as_str() {
                "path_prefix" => url::Url::parse(&pattern).ok().is_some_and(|p| {
                    let prefix = p.path().trim_end_matches('/');
                    p.origin() == page.origin()
                        && (prefix.is_empty()
                            || page.path() == prefix
                            || page.path().starts_with(&format!("{prefix}/")))
                }),
                "origin" => url::Url::parse(&pattern)
                    .ok()
                    .is_some_and(|p| p.origin() == page.origin()),
                "domain_suffix" => page
                    .host_str()
                    .is_some_and(|h| h == pattern || h.ends_with(&format!(".{pattern}"))),
                _ => false,
            };
            if matched {
                return Ok(true);
            }
        }
        Ok(false)
    }
    pub fn page_tasks(&self) -> Result<Vec<PageTask>> {
        let mut statement=self.connection.prepare("SELECT t.id,t.name,t.category,t.current_record_id,COALESCE(r.status='FINISHED',0),COALESCE(r.status='SUSPENDED',0),COALESCE(r.recovery_pending,0) FROM work_tasks t LEFT JOIN work_records r ON r.id=t.current_record_id ORDER BY t.id").map_err(db_error)?;
        statement
            .query_map([], |r| {
                Ok(PageTask {
                    id: r.get(0)?,
                    name: r.get(1)?,
                    category: r.get(2)?,
                    record_id: r.get(3)?,
                    finished: r.get(4)?,
                    suspended: r.get(5)?,
                    recovery_pending: r.get(6)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)
    }

    pub fn bind_page(&mut self, input: BindPageInput) -> Result<()> {
        let current = self
            .monitor
            .unknown_page_url
            .as_deref()
            .ok_or("当前没有待处理的新网页。")?;
        let expected = normalize_url(&input.expected_url)?;
        if current != expected
            || self.monitor.page.as_ref().is_none_or(|p| {
                p.rule_id.is_some()
                    || !p.ready
                    || p.revision != input.expected_revision
                    || self.clock.now().ticks_ms.saturating_sub(p.at.ticks_ms)
                        > crate::monitor::BROWSER_TIMEOUT_MS
            })
            || input.expected_revision != self.monitor.config.revision
        {
            return Err("页面或规则已变化，请重新选择。".into());
        }
        let pattern = normalize_rule(&input.pattern, &input.match_mode)?;
        let page = url::Url::parse(&expected).map_err(|_| "页面地址无效。")?;
        let covers = match input.match_mode.as_str() {
            "path_prefix" => {
                let p = url::Url::parse(&pattern).map_err(|_| "绑定范围无效。")?;
                let prefix = p.path().trim_end_matches('/');
                p.origin() == page.origin()
                    && (prefix.is_empty()
                        || page.path() == prefix
                        || page.path().starts_with(&format!("{prefix}/")))
            }
            "origin" => {
                url::Url::parse(&pattern)
                    .map_err(|_| "绑定范围无效。")?
                    .origin()
                    == page.origin()
            }
            "domain_suffix" => page
                .host_str()
                .is_some_and(|h| h == pattern || h.ends_with(&format!(".{pattern}"))),
            _ => false,
        };
        if !covers {
            return Err("所选绑定范围不包含当前网页。".into());
        }
        if self
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_urls WHERE match_mode=?1 AND url_prefix=?2",
                params![input.match_mode, pattern],
                |r| r.get::<_, i64>(0),
            )
            .map_err(db_error)?
            > 0
        {
            return Err("此绑定范围已有规则。".into());
        }
        if !input.ignore && self.monitor.config.rules.len() >= 50 {
            return Err("工作网址已达到 50 条上限，请先清理旧规则。".into());
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if input.ignore {
            tx.execute(
                "INSERT OR IGNORE INTO ignored_work_urls(match_mode,url_prefix) VALUES(?1,?2)",
                params![input.match_mode, pattern],
            )
            .map_err(db_error)?;
        } else {
            let task_id = if let Some(id) = input.task_id {
                let status:Option<String>=tx.query_row("SELECT r.status FROM work_tasks t LEFT JOIN work_records r ON r.id=t.current_record_id WHERE t.id=?1",[id],|r|r.get(0)).optional().map_err(db_error)?.flatten();
                if status.as_deref() == Some("FINISHED") {
                    return Err("这个任务已结束，请选择其他任务。".into());
                }
                let found: i64 = tx
                    .query_row("SELECT COUNT(*) FROM work_tasks WHERE id=?1", [id], |r| {
                        r.get(0)
                    })
                    .map_err(db_error)?;
                if found == 0 {
                    return Err("找不到所选任务。".into());
                }
                id
            } else {
                let name = input.new_name.as_deref().unwrap_or("").trim();
                let category = input.category.as_deref().unwrap_or("");
                if name.is_empty()
                    || name.chars().count() > 80
                    || !["评测", "质检", "开发", "文档"].contains(&category)
                {
                    return Err("请填写有效的任务名称和类别。".into());
                }
                tx.execute(
                    "INSERT INTO work_tasks(name,category) VALUES(?1,?2)",
                    params![name, category],
                )
                .map_err(db_error)?;
                tx.last_insert_rowid()
            };
            let category: String = tx
                .query_row(
                    "SELECT category FROM work_tasks WHERE id=?1",
                    [task_id],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES(?1,?2,?3,?4)",
                params![pattern, category, input.match_mode, task_id],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET revision=revision+1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.monitor.config = self.monitor_config()?;
        self.monitor.page = None;
        self.monitor.unknown_page_url = None;
        self.monitor.status.unknown_page_url = None;
        Ok(())
    }
}
