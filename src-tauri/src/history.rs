use super::{COLUMNS, Result, Store, WorkRecord, db_error, read_record};
use rusqlite::{Row, params};
use serde::{Deserialize, Serialize};

const PAGE_SIZE: i64 = 20;
const FILTER: &str = "status='FINISHED'
    AND date(start_time / 1000, 'unixepoch', 'localtime') BETWEEN ?1 AND ?2
    AND (?3 IS NULL OR category=?3)";

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HistoryQuery {
    pub start_date: String,
    pub end_date: String,
    pub category: Option<String>,
    pub page: u32,
}

#[derive(Debug, Serialize)]
pub struct Totals {
    pub records: i64,
    pub quantity: f64,
    pub duration_ms: i64,
    pub pending_records: i64,
}

#[derive(Debug, Serialize)]
pub struct DailyTotal {
    pub date: String,
    pub totals: Totals,
}

#[derive(Debug, Serialize)]
pub struct CategoryTotal {
    pub category: String,
    pub totals: Totals,
}

#[derive(Debug, Serialize)]
pub struct HistoryPage {
    pub records: Vec<WorkRecord>,
    pub page: u32,
    pub page_size: i64,
    pub overview: Totals,
    pub filtered: Totals,
    pub daily: Vec<DailyTotal>,
    pub categories: Vec<CategoryTotal>,
}

fn valid_date(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.len() != 10
        || bytes[4] != b'-'
        || bytes[7] != b'-'
        || !bytes
            .iter()
            .enumerate()
            .all(|(index, c)| index == 4 || index == 7 || c.is_ascii_digit())
    {
        return false;
    }
    let year: u32 = value[..4].parse().unwrap_or(0);
    let month: usize = value[5..7].parse().unwrap_or(0);
    let day: u32 = value[8..].parse().unwrap_or(0);
    let leap = year.is_multiple_of(4) && (!year.is_multiple_of(100) || year.is_multiple_of(400));
    let days = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    (1970..=9999).contains(&year) && (1..=12).contains(&month) && day > 0 && day <= days[month - 1]
}

fn totals(row: &Row<'_>, offset: usize) -> rusqlite::Result<Totals> {
    Ok(Totals {
        records: row.get(offset)?,
        quantity: row.get(offset + 1)?,
        duration_ms: row.get(offset + 2)?,
        pending_records: row.get(offset + 3)?,
    })
}

impl Store {
    pub fn query_history(&mut self, query: HistoryQuery) -> Result<HistoryPage> {
        if !valid_date(&query.start_date)
            || !valid_date(&query.end_date)
            || query.start_date > query.end_date
        {
            return Err("请选择有效的开始和结束日期，开始日期不能晚于结束日期。".into());
        }
        if query.page == 0
            || query.category.as_ref().is_some_and(|category| {
                !["评测", "质检", "开发", "文档"].contains(&category.as_str())
            })
        {
            return Err("历史查询的类别或页码无效。".into());
        }
        let days: i64 = self
            .connection
            .query_row(
                "SELECT CAST(julianday(?2) - julianday(?1) AS INTEGER)",
                params![query.start_date, query.end_date],
                |row| row.get(0),
            )
            .map_err(db_error)?;
        if days > 365 {
            return Err("单次查询最多 366 天，请缩小日期范围后重试。".into());
        }

        // One read transaction makes records, counts and aggregates a consistent snapshot.
        // History excludes active tasks and does not checkpoint or change their timer.
        let tx = self.connection.transaction().map_err(db_error)?;
        let columns = "COUNT(*), COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity END),0.0), COALESCE(SUM(duration_ms),0), COALESCE(SUM(settlement_status='PENDING'),0)";
        let overview = tx
            .query_row(
                &format!("SELECT {columns} FROM work_records WHERE status='FINISHED'"),
                [],
                |row| totals(row, 0),
            )
            .map_err(db_error)?;
        let filtered = tx
            .query_row(
                &format!("SELECT {columns} FROM work_records WHERE {FILTER}"),
                params![query.start_date, query.end_date, query.category],
                |row| totals(row, 0),
            )
            .map_err(db_error)?;
        let page = i64::from(query.page)
            .min(((filtered.records + PAGE_SIZE - 1) / PAGE_SIZE).max(1)) as u32;
        let records = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT {COLUMNS} FROM work_records WHERE {FILTER}
                ORDER BY start_time DESC, id DESC LIMIT ?4 OFFSET ?5"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![
                        query.start_date,
                        query.end_date,
                        query.category,
                        PAGE_SIZE,
                        (i64::from(page) - 1) * PAGE_SIZE
                    ],
                    read_record,
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        let daily = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT date(start_time / 1000, 'unixepoch', 'localtime') AS day,
                {columns} FROM work_records WHERE {FILTER} GROUP BY day ORDER BY day DESC"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![query.start_date, query.end_date, query.category],
                    |row| {
                        Ok(DailyTotal {
                            date: row.get(0)?,
                            totals: totals(row, 1)?,
                        })
                    },
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        let categories = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT category, {columns} FROM work_records
                WHERE {FILTER} GROUP BY category ORDER BY category"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![query.start_date, query.end_date, query.category],
                    |row| {
                        Ok(CategoryTotal {
                            category: row.get(0)?,
                            totals: totals(row, 1)?,
                        })
                    },
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        tx.commit().map_err(db_error)?;
        Ok(HistoryPage {
            records,
            page,
            page_size: PAGE_SIZE,
            overview,
            filtered,
            daily,
            categories,
        })
    }

    pub fn delete_record(&mut self, id: i64) -> Result<()> {
        if id <= 0 {
            return Err("记录编号无效。".into());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        let changed = tx
            .execute(
                "DELETE FROM work_records WHERE id=?1 AND status='FINISHED'",
                [id],
            )
            .map_err(db_error)?;
        if changed != 1 {
            return Err("记录不存在或尚未完成，请刷新后重试。".into());
        }
        tx.commit().map_err(db_error)?;
        Ok(())
    }
}

#[cfg(test)]
#[path = "history_tests.rs"]
mod tests;
