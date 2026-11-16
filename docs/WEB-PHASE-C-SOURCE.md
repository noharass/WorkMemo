# 网页阶段 C 完整源码

2026-11-16。15 个实现/测试文件的完整内容，无省略；交付记录见 WEB-PHASE-C.md。

## E:\WorkMemo\src-tauri\src\data_center.rs

```rust
//! Authenticated dashboard queries share Store, transactions and revision checks.
use super::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Debug, Deserialize, Default)]
#[serde(default, deny_unknown_fields)]
pub struct DashboardQuery {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub category: Option<String>,
    pub scope: String,
    pub status: String,
    pub page: u32,
}
#[path = "report_periods.rs"]
mod periods;

fn tagged(row: &rusqlite::Row<'_>) -> rusqlite::Result<Value> {
    let record = read_record(row)?;
    let mut value = serde_json::to_value(record)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    value["is_demo"] = row.get::<_, bool>(21)?.into();
    value["demo_batch"] = row.get::<_, Option<String>>(22)?.into();
    Ok(value)
}
#[derive(Serialize)]
pub struct TodayWorkload {
    pub category: String,
    pub quantity: f64,
    pub pending: i64,
    pub records: i64,
    pub complete: i64,
}
impl Store {
    pub fn today_workload(&self) -> Result<Vec<TodayWorkload>> {
        self.connection.prepare("SELECT category,COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),SUM(settlement_status!='COMPLETE'),COUNT(*),SUM(settlement_status='COMPLETE') FROM work_records WHERE is_demo=0 AND date(start_time/1000,'unixepoch','localtime')=date('now','localtime') GROUP BY category ORDER BY MIN(id)").map_err(db_error)?
            .query_map([],|r|Ok(TodayWorkload{category:r.get(0)?,quantity:r.get(1)?,pending:r.get(2)?,records:r.get(3)?,complete:r.get(4)?})).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)
    }
    pub fn dashboard_query(&self, mut q: DashboardQuery) -> Result<Value> {
        let mut range = periods::ReportRange::resolve(&self.connection, &q)?;
        q.start_date = range.start_date.clone();
        q.end_date = range.end_date.clone();
        if q.category
            .as_ref()
            .is_some_and(|s| !crate::presentation::CATEGORIES.contains(&s.as_str()))
        {
            return Err("工作类别无效。".into());
        }
        let scope = if q.scope.is_empty() { "real" } else { &q.scope };
        if !["real", "demo", "all"].contains(&scope)
            || !["", "all", "pending", "complete", "working", "unfinished"]
                .contains(&q.status.as_str())
        {
            return Err("数据筛选无效。".into());
        }
        let tx = self.connection.unchecked_transaction().map_err(db_error)?;
        let filter = "(?1='all' OR is_demo=CASE WHEN ?1='demo' THEN 1 ELSE 0 END) AND (?2 IS NULL OR date(start_time/1000,'unixepoch','localtime')>=?2) AND (?3 IS NULL OR date(start_time/1000,'unixepoch','localtime')<=?3) AND (?4 IS NULL OR category=?4) AND (?5='' OR ?5='all' OR (?5='pending' AND settlement_status='PENDING') OR (?5='complete' AND settlement_status='COMPLETE') OR (?5='working' AND status='WORKING') OR (?5='unfinished' AND status IN ('WORKING','SUSPENDED')))";
        let args = params![scope, q.start_date, q.end_date, q.category, q.status];
        let record_count: i64 = self
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM work_records WHERE {filter}"),
                args,
                |r| r.get(0),
            )
            .map_err(db_error)?;
        // Report aggregates always describe ended work, independently of list paging.
        let report_filter = format!("{filter} AND status='FINISHED'");
        let (count,duration,quantity,pending,first,last):(i64,i64,f64,i64,Option<i64>,Option<i64>) = self.connection.query_row(
            &format!("SELECT COUNT(*),COALESCE(SUM(duration_ms),0),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COALESCE(SUM(settlement_status='PENDING'),0),MIN(start_time),MAX(start_time) FROM work_records WHERE {report_filter}"),args,
            |r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?,r.get(5)?))
        ).map_err(db_error)?;
        let buckets = range.trend_buckets(&self.connection, first.zip(last))?;
        let months = range.trend_unit == "month";
        let group = range.trend_group();
        let mut trend:Vec<Value>=self.connection.prepare(&format!("SELECT {group} AS period,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*) FROM work_records WHERE {report_filter} GROUP BY period ORDER BY period")).map_err(db_error)?.query_map(args,|r|Ok(json!({"date":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        if !buckets.is_empty() {
            let mut by_date: std::collections::BTreeMap<String, Value> = trend
                .into_iter()
                .map(|v| (v["date"].as_str().unwrap().to_string(), v))
                .collect();
            trend = buckets
                .into_iter()
                .map(|date| {
                    by_date.remove(&date).unwrap_or_else(
                        || json!({"date":date,"duration_ms":0,"quantity":0,"records":0}),
                    )
                })
                .collect();
        }
        let aggregated:Vec<Value>=self.connection.prepare(&format!("SELECT category,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*),SUM(settlement_status='PENDING'),SUM(settlement_status='COMPLETE') FROM work_records WHERE {report_filter} GROUP BY category")).map_err(db_error)?.query_map(args,|r|Ok(json!({"category":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?,"pending":r.get::<_,i64>(4)?,"complete":r.get::<_,i64>(5)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let categories:Vec<Value>=crate::presentation::CATEGORIES.into_iter().filter(|key|q.category.as_deref().is_none_or(|selected|selected==*key)).map(|key|aggregated.iter().find(|v|v["category"]==key).cloned().unwrap_or_else(||json!({"category":key,"duration_ms":0,"quantity":0,"records":0,"pending":0,"complete":0}))).collect();
        let calendar:Vec<Value>=self.connection.prepare(&format!("SELECT date(start_time/1000,'unixepoch','localtime') AS day,SUM(duration_ms) FROM work_records WHERE {report_filter} AND date(start_time/1000,'unixepoch','localtime')>=date(COALESCE(?3,date('now','localtime')),'-89 days') GROUP BY day ORDER BY day")).map_err(db_error)?.query_map(args,|r|Ok(json!([r.get::<_,String>(0)?,r.get::<_,i64>(1)?]))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let page = i64::from(q.page.max(1)).min(((record_count + 49) / 50).max(1));
        let rows:Vec<Value>=self.connection.prepare(&format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE {filter} ORDER BY start_time DESC,id DESC LIMIT 50 OFFSET ?6")).map_err(db_error)?.query_map(params![scope,q.start_date,q.end_date,q.category,q.status,(page-1)*50],tagged).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(
            json!({"range":range,"totals":{"records":count,"duration_ms":duration,"quantity":quantity,"pending":pending},"record_count":record_count,"trend":trend,"monthly":months,"categories":categories,"calendar":calendar,"records":rows,"page":page,"pages":((record_count+49)/50).max(1),"scope":scope}),
        )
    }
    pub fn dashboard_detail(&self, id: i64) -> Result<Value> {
        let record = self
            .connection
            .query_row(
                &format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE id=?1"),
                [id],
                tagged,
            )
            .optional()
            .map_err(db_error)?
            .ok_or("记录已不存在。")?;
        let segments:Vec<Value>=self.connection.prepare("SELECT id,start_time,end_time,duration_ms,state FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|Ok(json!({"id":r.get::<_,i64>(0)?,"start_time":r.get::<_,i64>(1)?,"end_time":r.get::<_,Option<i64>>(2)?,"duration_ms":r.get::<_,i64>(3)?,"state":r.get::<_,String>(4)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let revisions:Vec<Value>=self.connection.prepare("SELECT revision,changed_at,before_json,after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|Ok(json!({"revision":r.get::<_,i64>(0)?,"changed_at":r.get::<_,i64>(1)?,"before":serde_json::from_str::<Value>(&r.get::<_,String>(2)?).unwrap_or(Value::Null),"after":serde_json::from_str::<Value>(&r.get::<_,String>(3)?).unwrap_or(Value::Null)}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        Ok(json!({"record":record,"segments":segments,"revisions":revisions}))
    }
    pub fn dashboard_delete(&mut self, id: i64, expected_revision: i64) -> Result<()> {
        if self.record(id)?.revision != expected_revision {
            return Err("记录已被修改，请重新读取后删除。".into());
        }
        self.delete_record(id)
    }
    pub fn seed_demo(&mut self) -> Result<i64> {
        let batch = "workmemo-v021-demo-1";
        let existing: i64 = self
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_records WHERE is_demo=1 AND demo_batch=?1",
                [batch],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        if existing > 0 {
            return Ok(existing);
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let now: i64 = tx
            .query_row("SELECT unixepoch('now')*1000", [], |r| r.get(0))
            .map_err(db_error)?;
        let categories = ["评测", "质检", "开发", "文档"];
        let mut count = 0;
        for day in 0..90_i64 {
            let modifier = format!("-{day} days");
            let weekday: String = tx
                .query_row(
                    "SELECT strftime('%w','now','localtime',?1)",
                    [&modifier],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            if day > 0 && (weekday == "0" || weekday == "6") {
                continue;
            }
            for slot in 0..3_i64 {
                let start: i64 = if day == 0 {
                    now - 3 * 3600000 + slot * 50 * 60000
                } else {
                    tx.query_row(
                        "SELECT unixepoch(date('now','localtime',?1)||' 09:00:00','utc')*1000",
                        [&modifier],
                        |r| r.get::<_, i64>(0),
                    )
                    .map_err(db_error)?
                        + slot * 3 * 3600000
                };
                let duration = if day == 0 {
                    35 * 60000
                } else {
                    (25 + (day * 17 + slot * 19) % 80) * 60000
                };
                let half = duration / 2;
                let end = start + duration + 5 * 60000;
                let pending = (day + slot) % 9 == 0;
                let quantity = if pending {
                    None
                } else {
                    Some(((day * 11 + slot * 13) % 80 + 1) as f64)
                };
                let category = categories[((day + slot) % 4) as usize];
                let revised = !pending && (day + slot) % 13 == 0;
                tx.execute("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,recovery_pending,settlement_status,source,confirmed_end_time,end_reason,revision,is_demo,demo_batch,control_mode) VALUES(?1,?2,'演示数据 · 用于查看图表效果',?3,?4,?5,?6,'FINISHED',1,0,?7,'MANUAL_ENTRY',?4,'MANUAL',?8,1,?9,'MANUAL')",params![category,quantity,start,end,duration,duration/1000,if pending{"PENDING"}else{"COMPLETE"},if revised{1}else{0},batch]).map_err(db_error)?;
                let id = tx.last_insert_rowid();
                for (a, b) in [(start, start + half), (start + half + 5 * 60000, end)] {
                    tx.execute("INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(?1,?2,?3,?3,?4,'CLOSED')",params![id,a,b,b-a]).map_err(db_error)?;
                }
                if revised {
                    let after = tx
                        .query_row(
                            &format!("SELECT {COLUMNS} FROM work_records WHERE id=?1"),
                            [id],
                            read_record,
                        )
                        .map_err(db_error)?;
                    let mut before = after.clone();
                    before.revision = 0;
                    before.quantity = quantity.map(|v| v - 1.0);
                    before.remark = "演示：初次填写".into();
                    tx.execute("INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(?1,1,?2,?3,?4)",params![id,end+60000,serde_json::to_string(&before).map_err(|e|e.to_string())?,serde_json::to_string(&after).map_err(|e|e.to_string())?]).map_err(db_error)?;
                }
                count += 1;
            }
        }
        tx.commit().map_err(db_error)?;
        Ok(count)
    }
    pub fn clear_demo(&mut self) -> Result<usize> {
        let tx = self.connection.transaction().map_err(db_error)?;
        let n = tx
            .execute(
                "DELETE FROM work_records WHERE is_demo=1 AND status='FINISHED'",
                [],
            )
            .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(n)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::TestClock;
    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    #[test]
    fn demo_generation_is_idempotent_and_never_changes_real_totals_or_active_work() {
        let mut s = empty();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "real".into(),
        })
        .unwrap();
        let before = s.active().unwrap().unwrap();
        let n = s.seed_demo().unwrap();
        assert!(n > 100);
        assert_eq!(s.seed_demo().unwrap(), n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(s.active().unwrap().unwrap().duration_ms, before.duration_ms);
        assert_eq!(s.snapshot().unwrap().pending_count, 0);
        assert!(s.snapshot().unwrap().recent_records.is_empty());
        let demo = s
            .dashboard_query(DashboardQuery {
                scope: "demo".into(),
                ..Default::default()
            })
            .unwrap();
        assert_eq!(demo["totals"]["records"], n);
        assert!(demo["totals"]["pending"].as_i64().unwrap() > 0);
        let real = s.dashboard_query(DashboardQuery::default()).unwrap();
        assert_eq!(real["totals"]["records"], 0);
        assert_eq!(real["record_count"], 1);
        assert_eq!(real["totals"]["quantity"], 0.0);
        let history = s
            .query_history(super::super::HistoryQuery {
                start_date: "1970-01-01".into(),
                end_date: "1970-12-31".into(),
                category: None,
                page: 1,
            })
            .unwrap();
        assert_eq!(history.overview.records, 0);
        assert_eq!(s.clear_demo().unwrap() as i64, n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                    .get::<_, i64>(
                    0
                ))
                .unwrap(),
            0
        );
    }
    #[test]
    fn today_uses_confirmed_quantity_and_distinguishes_missing_from_zero() {
        let s = empty();
        for (qty, state, demo) in [
            (None, "PENDING", 0),
            (Some(0.0), "COMPLETE", 0),
            (Some(50.5), "COMPLETE", 0),
            (Some(999.0), "COMPLETE", 1),
        ] {
            s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES('评测',?1,unixepoch('now')*1000-60000,unixepoch('now')*1000,60000,60,'FINISHED',1,?2,?3)",params![qty,state,demo]).unwrap();
        }
        let rows = s.today_workload().unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].quantity, 50.5);
        assert_eq!(rows[0].records, 3);
        assert_eq!(rows[0].pending, 1);
        assert_eq!(rows[0].complete, 2);
    }
    #[test]
    fn browser_edits_and_deletes_enforce_revision_and_preserve_intervals() {
        let mut s = empty();
        s.seed_demo().unwrap();
        let id = s
            .connection
            .query_row(
                "SELECT id FROM work_records WHERE settlement_status='PENDING' LIMIT 1",
                [],
                |r| r.get::<_, i64>(0),
            )
            .unwrap();
        let before = s.record(id).unwrap();
        s.settle(SettleInput {
            id,
            expected_revision: before.revision,
            category: "文档".into(),
            quantity: 0.0,
            remark: "reviewed demo".into(),
        })
        .unwrap();
        let after = s.record(id).unwrap();
        assert_eq!(after.duration_ms, before.duration_ms);
        assert_eq!(after.end_time, before.end_time);
        assert!(
            s.settle(SettleInput {
                id,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 2.0,
                remark: "stale".into()
            })
            .is_err()
        );
        assert!(s.dashboard_delete(id, before.revision).is_err());
        let detail = s.dashboard_detail(id).unwrap();
        assert_eq!(detail["segments"].as_array().unwrap().len(), 2);
        assert_eq!(detail["revisions"].as_array().unwrap().len(), 1);
        assert_eq!(detail["record"]["is_demo"], true);
        s.dashboard_delete(id, after.revision).unwrap();
        assert!(s.dashboard_detail(id).is_err());
        assert!(
            s.dashboard_query(DashboardQuery {
                scope: "invalid".into(),
                ..Default::default()
            })
            .is_err()
        );
        assert!(
            s.dashboard_query(DashboardQuery {
                start_date: Some("2026-02-31".into()),
                ..Default::default()
            })
            .is_err()
        );
    }
}

#[cfg(test)]
#[path = "report_tests.rs"]
mod report_tests;
```

## E:\WorkMemo\src-tauri\src\report_periods.rs

```rust
use super::*;

#[derive(Debug, Serialize)]
pub struct ReportRange {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub trend_unit: String,
    pub trend_step: u32,
    #[serde(skip)]
    month_origin: i64,
}

impl ReportRange {
    pub fn resolve(c: &Connection, q: &DashboardQuery) -> Result<Self> {
        let period = if q.period.is_empty() {
            "custom"
        } else {
            &q.period
        };
        if !["day", "week", "month", "custom"].contains(&period) {
            return Err("统计周期无效。".into());
        }
        if period == "custom" {
            if q.start_date
                .as_ref()
                .is_some_and(|v| !super::super::history::valid_date(v))
                || q.end_date
                    .as_ref()
                    .is_some_and(|v| !super::super::history::valid_date(v))
                || matches!((&q.start_date,&q.end_date),(Some(a),Some(b)) if a>b)
            {
                return Err("请选择有效的日期范围。".into());
            }
            return Ok(Self {
                period: period.into(),
                anchor_date: None,
                start_date: q.start_date.clone(),
                end_date: q.end_date.clone(),
                trend_unit: "day".into(),
                trend_step: 1,
                month_origin: 0,
            });
        }
        let anchor = match &q.anchor_date {
            Some(value) if super::super::history::valid_date(value) => value.clone(),
            Some(_) => return Err("请选择有效的统计日期。".into()),
            None => c
                .query_row("SELECT date('now','localtime')", [], |r| r.get(0))
                .map_err(db_error)?,
        };
        let (start, end): (String, String) = match period {
            "day" => (anchor.clone(), anchor.clone()),
            "week" => c.query_row("SELECT MAX('1970-01-01',date(?1,'-'||((CAST(strftime('%w',?1) AS INTEGER)+6)%7)||' days')),MIN('9999-12-31',COALESCE(date(?1,'+'||(6-((CAST(strftime('%w',?1) AS INTEGER)+6)%7))||' days'),'9999-12-31'))", [&anchor], |r| Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?,
            _ => c.query_row("SELECT date(?1,'start of month'),COALESCE(date(?1,'start of month','+1 month','-1 day'),'9999-12-31')", [&anchor], |r| Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?,
        };
        Ok(Self {
            period: period.into(),
            anchor_date: Some(anchor),
            start_date: Some(start),
            end_date: Some(end),
            trend_unit: if period == "day" { "hour" } else { "day" }.into(),
            trend_step: 1,
            month_origin: 0,
        })
    }

    /// Empty custom reports remain empty; missing days in complete local history are zero.
    /// Explicit boundaries win, otherwise use the filtered ended records' local dates.
    pub fn trend_buckets(
        &mut self,
        c: &Connection,
        extent: Option<(i64, i64)>,
    ) -> Result<Vec<String>> {
        if self.period != "custom" {
            return self.buckets(c);
        }
        let Some((first, last)) = extent else {
            return Ok(Vec::new());
        };
        let (start, end): (String, String) = c.query_row(
            "SELECT COALESCE(?1,date(?3/1000,'unixepoch','localtime')),COALESCE(?2,date(?4/1000,'unixepoch','localtime'))",
            params![self.start_date,self.end_date,first,last], |r| Ok((r.get(0)?,r.get(1)?)),
        ).map_err(db_error)?;
        let days: i64 = c
            .query_row(
                "SELECT CAST(julianday(?2)-julianday(?1) AS INTEGER)",
                params![start, end],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        if days <= 120 {
            return c.prepare("WITH RECURSIVE days(day) AS (SELECT ?1 UNION ALL SELECT date(day,'+1 day') FROM days WHERE day<?2 LIMIT 121) SELECT day FROM days")
                .map_err(db_error)?.query_map(params![start,end], |r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<Vec<String>>>().map_err(db_error);
        }
        self.trend_unit = "month".into();
        let index = |date: &str| -> i64 {
            date[..4].parse::<i64>().unwrap() * 12 + date[5..7].parse::<i64>().unwrap() - 1
        };
        let first_month = index(&start);
        let last_month = index(&end);
        // A year-9999 boundary must not allocate tens of thousands of monthly points.
        self.trend_step = ((last_month - first_month + 1 + 1199) / 1200) as u32;
        self.month_origin = first_month;
        Ok((first_month..=last_month)
            .step_by(self.trend_step as usize)
            .map(|month| format!("{:04}-{:02}", month / 12, month % 12 + 1))
            .collect())
    }

    pub fn trend_group(&self) -> String {
        match self.trend_unit.as_str() {
            "hour" => "strftime('%H:00',start_time/1000,'unixepoch','localtime')".into(),
            "month" if self.trend_step > 1 => {
                let month = "(CAST(strftime('%Y',start_time/1000,'unixepoch','localtime') AS INTEGER)*12+CAST(strftime('%m',start_time/1000,'unixepoch','localtime') AS INTEGER)-1)";
                let bucket = format!(
                    "({0}+(({month}-{0})/{1})*{1})",
                    self.month_origin, self.trend_step
                );
                format!("printf('%04d-%02d',{bucket}/12,{bucket}%12+1)")
            }
            "month" => "strftime('%Y-%m',start_time/1000,'unixepoch','localtime')".into(),
            _ => "date(start_time/1000,'unixepoch','localtime')".into(),
        }
    }

    pub fn buckets(&self, c: &Connection) -> Result<Vec<String>> {
        if self.period == "day" {
            return Ok((0..24).map(|h| format!("{h:02}:00")).collect());
        }
        if self.period == "custom" {
            return Ok(Vec::new());
        }
        c.prepare("WITH RECURSIVE days(day) AS (SELECT ?1 UNION ALL SELECT date(day,'+1 day') FROM days WHERE day<?2 LIMIT 32) SELECT day FROM days")
            .map_err(db_error)?.query_map(params![self.start_date,self.end_date], |r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<Vec<String>>>().map_err(db_error)
    }
}
```

## E:\WorkMemo\src-tauri\src\report_tests.rs

```rust
use super::super::tests::TestClock;
use super::*;
fn store() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(TestClock::new()),
        None,
    )
    .unwrap()
}
fn query(period: &str, date: &str) -> DashboardQuery {
    DashboardQuery {
        period: period.into(),
        anchor_date: Some(date.into()),
        ..Default::default()
    }
}
fn ended(
    s: &Store,
    date: &str,
    category: &str,
    quantity: Option<f64>,
    complete: bool,
    duration: i64,
    demo: bool,
) -> i64 {
    s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES(?1,?2,unixepoch(?3,'utc')*1000,unixepoch(?3,'utc')*1000+?4,?4,?4/1000,'FINISHED',1,?5,?6)",params![category,quantity,date,duration,if complete{"COMPLETE"}else{"PENDING"},demo]).unwrap();
    s.connection.last_insert_rowid()
}
#[test]
fn canonical_periods_cover_leap_month_sunday_and_cross_year_weeks() {
    let s = store();
    for (period, date, start, end, buckets) in [
        ("day", "2026-10-29", "2026-10-29", "2026-10-29", 24),
        ("week", "2027-01-01", "2026-12-28", "2027-01-03", 7),
        ("week", "2026-11-01", "2026-10-26", "2026-11-01", 7),
        ("month", "2024-02-29", "2024-02-01", "2024-02-29", 29),
        ("month", "2026-02-28", "2026-02-01", "2026-02-28", 28),
        ("month", "9999-12-31", "9999-12-01", "9999-12-31", 31),
        ("week", "1970-01-01", "1970-01-01", "1970-01-04", 4),
    ] {
        let mut q = query(period, date);
        q.start_date = Some("invalid ignored natural boundary".into());
        let result = s.dashboard_query(q).unwrap();
        assert_eq!(result["range"]["start_date"], start);
        assert_eq!(result["range"]["end_date"], end);
        assert_eq!(result["trend"].as_array().unwrap().len(), buckets);
        assert_eq!(result["categories"].as_array().unwrap().len(), 4);
        assert_eq!(result["totals"]["records"], 0);
    }
}
#[test]
fn period_reports_count_ended_work_and_keep_zero_pending_decimal_and_demo_separate() {
    let mut s = store();
    ended(
        &s,
        "2026-10-29 00:00:00",
        "评测",
        Some(0.0),
        true,
        1234,
        false,
    );
    ended(
        &s,
        "2026-10-29 23:59:59",
        "评测",
        Some(2.5),
        true,
        2000,
        false,
    );
    ended(&s, "2026-10-29 10:00:00", "评测", None, false, 3000, false);
    ended(
        &s,
        "2026-10-29 10:00:00",
        "开发",
        Some(999.0),
        false,
        4000,
        false,
    );
    ended(
        &s,
        "2026-10-29 10:00:00",
        "质检",
        Some(500.0),
        true,
        1000,
        true,
    );
    ended(
        &s,
        "2026-10-28 23:59:59",
        "评测",
        Some(200.0),
        true,
        5000,
        false,
    );
    ended(
        &s,
        "2026-10-30 00:00:00",
        "评测",
        Some(300.0),
        true,
        6000,
        false,
    );
    s.start(StartInput {
        category: "文档".into(),
        quantity: Some(55.0),
        remark: String::new(),
    })
    .unwrap();
    s.connection.execute("UPDATE work_records SET start_time=unixepoch('2026-10-29 12:00:00','utc')*1000 WHERE status='WORKING'",[]).unwrap();
    let result = s.dashboard_query(query("day", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 4);
    assert_eq!(result["record_count"], 5);
    assert_eq!(result["totals"]["duration_ms"], 10234);
    assert_eq!(result["totals"]["quantity"], 2.5);
    assert_eq!(result["categories"][0]["complete"], 2);
    assert_eq!(result["categories"][0]["pending"], 1);
    assert_eq!(result["categories"][2]["quantity"], 0.0);
    assert_eq!(result["categories"][2]["complete"], 0);
    assert_eq!(result["categories"][3]["records"], 0);
    assert_eq!(result["trend"][0]["duration_ms"], 1234);
    assert_eq!(result["trend"][23]["duration_ms"], 2000);
    let mut q = query("day", "2026-10-29");
    q.category = Some("开发".into());
    q.status = "pending".into();
    let one = s.dashboard_query(q).unwrap();
    assert_eq!(one["categories"].as_array().unwrap().len(), 1);
    assert_eq!(one["totals"]["pending"], 1);
    let mut q = query("day", "2026-10-29");
    q.status = "working".into();
    let working = s.dashboard_query(q).unwrap();
    assert_eq!(working["totals"]["records"], 0);
    assert_eq!(working["record_count"], 1);
}
#[test]
fn weekly_and_monthly_totals_refresh_after_settlement_edit_delete_and_use_all_pages() {
    let mut s = store();
    for _ in 0..61 {
        ended(
            &s,
            "2026-10-26 09:00:00",
            "评测",
            Some(0.25),
            true,
            1000,
            false,
        );
    }
    let id = ended(&s, "2026-11-01 09:00:00", "评测", None, false, 2500, false);
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 62);
    assert_eq!(result["totals"]["quantity"], 15.25);
    assert_eq!(result["pages"], 2);
    assert_eq!(result["records"].as_array().unwrap().len(), 50);
    s.settle(SettleInput {
        id,
        expected_revision: 0,
        category: "开发".into(),
        quantity: 2.5,
        remark: "confirmed".into(),
    })
    .unwrap();
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["pending"], 0);
    assert_eq!(result["categories"][2]["quantity"], 2.5);
    s.settle(SettleInput {
        id,
        expected_revision: 1,
        category: "开发".into(),
        quantity: 0.0,
        remark: "edited".into(),
    })
    .unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["categories"][2]["quantity"],
        0.0
    );
    s.dashboard_delete(id, 2).unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-11-01")).unwrap()["totals"]["records"],
        0
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
}
#[test]
fn period_validation_rejects_bad_dates_and_legacy_custom_ranges_still_work() {
    let s = store();
    for (period, date) in [
        ("year", "2026-10-29"),
        ("month", "2026-02-29"),
        ("day", ""),
        ("week", "1969-12-31"),
    ] {
        assert!(s.dashboard_query(query(period, date)).is_err());
    }
    let q = DashboardQuery {
        start_date: Some("2026-10-30".into()),
        end_date: Some("2026-10-01".into()),
        ..Default::default()
    };
    assert!(s.dashboard_query(q).is_err());
    ended(
        &s,
        "2025-01-01 00:00:00",
        "评测",
        Some(1.0),
        true,
        1000,
        false,
    );
    ended(
        &s,
        "2026-01-01 00:00:00",
        "评测",
        Some(2.0),
        true,
        2000,
        false,
    );
    let result = s.dashboard_query(DashboardQuery::default()).unwrap();
    assert_eq!(result["range"]["period"], "custom");
    assert_eq!(result["range"]["trend_unit"], "month");
    assert_eq!(result["totals"]["records"], 2);
}

#[test]
fn unfinished_status_matches_browser_contract_and_preserves_legacy_working_filter() {
    let s = store();
    let contract: Value = serde_json::from_str(include_str!(
        "../../tests/fixtures/dashboard-status-contract.json"
    ))
    .unwrap();
    for row in contract["records"].as_array().unwrap() {
        let status = row["status"].as_str().unwrap();
        let settlement = row["settlement_status"].as_str().unwrap();
        s.connection.execute(
            "INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status)
             VALUES(?1,'开发',?2,0,?3,1000,1,?4,?5,?6)",
            params![row["id"].as_i64().unwrap(),if settlement == "COMPLETE" {Some(0.0)} else {None},
                if status == "FINISHED" {Some(1000)} else {None},status,status != "WORKING",settlement],
        ).unwrap();
    }
    for paused in [false, true] {
        s.connection
            .execute(
                "UPDATE work_records SET is_paused=?1 WHERE status='WORKING'",
                [paused],
            )
            .unwrap();
        for (status, expected) in contract["expected"].as_object().unwrap() {
            let value = s
                .dashboard_query(DashboardQuery {
                    status: status.clone(),
                    ..Default::default()
                })
                .unwrap();
            let mut ids: Vec<i64> = value["records"]
                .as_array()
                .unwrap()
                .iter()
                .map(|row| row["id"].as_i64().unwrap())
                .collect();
            ids.sort_unstable();
            assert_eq!(json!(ids), *expected, "{status}, paused={paused}");
            if status == "unfinished" {
                assert_eq!(value["totals"]["records"], 0);
            }
        }
    }
}

#[test]
fn custom_trend_fills_leap_day_and_selected_edges_without_inventing_records() {
    let s = store();
    ended(&s, "2024-02-28 12:00:00", "评测", Some(0.0), true, 1, false);
    ended(&s, "2024-03-01 12:00:00", "评测", None, false, 2000, false);
    let q = || DashboardQuery {
        period: "custom".into(),
        start_date: Some("2024-02-27".into()),
        end_date: Some("2024-03-02".into()),
        ..Default::default()
    };
    let r = s.dashboard_query(q()).unwrap();
    let rows = r["trend"].as_array().unwrap();
    assert_eq!(rows.len(), 5);
    assert_eq!(rows[0]["date"], "2024-02-27");
    assert_eq!(
        rows[2],
        json!({"date":"2024-02-29","duration_ms":0,"quantity":0,"records":0})
    );
    assert_eq!(rows[1]["duration_ms"], 1);
    assert_eq!(rows[1]["records"], 1);
    assert_eq!(rows[3]["records"], 1);
    assert_eq!(r["totals"]["records"], 2);
    assert_eq!(r["totals"]["pending"], 1);
    let mut empty = q();
    empty.category = Some("文档".into());
    assert!(
        s.dashboard_query(empty).unwrap()["trend"]
            .as_array()
            .unwrap()
            .is_empty()
    );
}

#[test]
fn custom_trend_uses_selected_span_and_bounds_extreme_month_buckets() {
    let s = store();
    ended(
        &s,
        "2026-10-29 12:00:00",
        "评测",
        Some(2.5),
        true,
        1234,
        false,
    );
    for (start, end, expected, step) in [
        ("2026-01-01", "2026-12-31", 12, 1),
        ("1970-01-01", "9999-12-31", 1190, 81),
    ] {
        let r = s
            .dashboard_query(DashboardQuery {
                period: "custom".into(),
                start_date: Some(start.into()),
                end_date: Some(end.into()),
                ..Default::default()
            })
            .unwrap();
        assert_eq!(r["range"]["trend_unit"], "month");
        assert_eq!(r["range"]["trend_step"], step);
        let rows = r["trend"].as_array().unwrap();
        assert_eq!(rows.len(), expected);
        assert!(rows.len() <= 1200);
        assert_eq!(
            rows.iter()
                .map(|v| v["duration_ms"].as_i64().unwrap())
                .sum::<i64>(),
            1234
        );
        assert_eq!(
            rows.iter()
                .map(|v| v["records"].as_i64().unwrap())
                .sum::<i64>(),
            1
        );
        assert_eq!(
            rows.iter()
                .map(|v| v["quantity"].as_f64().unwrap())
                .sum::<f64>(),
            2.5
        );
    }
    ended(&s, "9999-12-31 12:00:00", "评测", Some(1.0), true, 7, false);
    let r = s
        .dashboard_query(DashboardQuery {
            period: "custom".into(),
            start_date: Some("1970-01-01".into()),
            end_date: Some("9999-12-31".into()),
            ..Default::default()
        })
        .unwrap();
    let last = r["trend"].as_array().unwrap().last().unwrap();
    assert_eq!(last["date"], "9995-10");
    assert_eq!(last["duration_ms"], 7);
    assert_eq!(last["records"], 1);
}

#[test]
fn custom_trend_matches_shared_browser_contract() {
    let s = store();
    let contract: Value = serde_json::from_str(include_str!(
        "../../tests/fixtures/dashboard-trend-contract.json"
    ))
    .unwrap();
    for row in contract["records"].as_array().unwrap() {
        let quantity = row["quantity"].as_f64();
        ended(
            &s,
            &format!("{} 12:00:00", row["date"].as_str().unwrap()),
            row["category"].as_str().unwrap(),
            quantity,
            quantity.is_some(),
            row["duration_ms"].as_i64().unwrap(),
            false,
        );
    }
    for case in contract["cases"].as_array().unwrap() {
        let q: DashboardQuery = serde_json::from_value(case["query"].clone()).unwrap();
        let r = s.dashboard_query(q).unwrap();
        let e = &case["expected"];
        let rows = r["trend"].as_array().unwrap();
        assert_eq!(r["range"]["trend_unit"], e["unit"], "{}", case["name"]);
        assert_eq!(r["range"]["trend_step"], e["step"]);
        assert_eq!(rows.len(), e["count"].as_u64().unwrap() as usize);
        assert_eq!(
            rows.first().map(|r| &r["date"]).unwrap_or(&Value::Null),
            &e["first"]
        );
        assert_eq!(
            rows.last().map(|r| &r["date"]).unwrap_or(&Value::Null),
            &e["last"]
        );
        assert_eq!(
            rows.iter()
                .map(|r| r["duration_ms"].as_i64().unwrap())
                .sum::<i64>(),
            e["duration_ms"].as_i64().unwrap()
        );
        assert_eq!(
            rows.iter()
                .map(|r| r["records"].as_i64().unwrap())
                .sum::<i64>(),
            e["records"].as_i64().unwrap()
        );
        assert_eq!(r["totals"]["records"], e["records"]);
        let actual: serde_json::Map<String, Value> = rows
            .iter()
            .filter(|r| r["duration_ms"] != 0)
            .map(|r| {
                (
                    r["date"].as_str().unwrap().to_string(),
                    r["duration_ms"].clone(),
                )
            })
            .collect();
        assert_eq!(Value::Object(actual), e["nonzero"]);
    }
}
```

## E:\WorkMemo\src\main.tsx

```tsx
import React,{lazy,Suspense} from "react";
import ReactDOM from "react-dom/client";
import { CategoryProvider } from "./categoryNames";

const Dashboard=lazy(()=>import("./Dashboard"));
const App=lazy(()=>import("./App"));
const PanelApp=lazy(()=>import("./PanelApp").then(module=>({default:module.PanelApp})));
const NotificationApp=lazy(()=>import("./NotificationApp").then(module=>({default:module.NotificationApp})));
const params=new URLSearchParams(window.location.search);
const dashboard=window.location.pathname==="/dashboard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode><CategoryProvider>
    <Suspense fallback={<p>{dashboard?"正在打开工作数据中心…":"正在打开 WorkMemo…"}</p>}>
      {dashboard?<Dashboard/>:params.has("notice")?<NotificationApp/>:params.has("panel")?<PanelApp panel={params.get("panel")!}/>:<App/>}
    </Suspense>
  </CategoryProvider></React.StrictMode>,
);
```

## E:\WorkMemo\src\PanelApp.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { DraftContext, Surface, type Draft, useDraft } from "./Drafts";
import { AppearanceSettings } from "./AppearanceSettings";
import { MonitoringSettings } from "./MonitoringSettings";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { DraftController } from "./draftController";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  layoutStyle,
  useDashboard,
} from "./desktopPreferences";
import { VisualSettings, LayoutPanel } from "./SettingsExtras";

type Report = {
  source: string | null;
  conflict_ids: number[];
  skipped_active_ids: number[];
  records: number;
  pending: number;
  active: number;
  imported: number;
  duplicates: number;
  conflicts: number;
  skipped_active: number;
  backup: string | null;
};
function DataPanel({ onClose }: { onClose: () => void }) {
  const dashboard = useDashboard();
  const [demoConfirm, setDemoConfirm] = useState(false);
  async function demo(command: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const count = await invoke<number>(command);
      setMessage(
        command === "seed_demo_data"
          ? `演示数据已准备：${count}条。真实统计仍与演示分开。`
          : `已清理${count}条演示记录，真实记录保留。`,
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const [report, setReport] = useState<Report | null>(null);
  const [restoreInfo, setRestoreInfo] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [include, setInclude] = useState(false);
  const [action, setAction] = useState<"import" | "restore" | null>(null);
  useDraft(
    "data-operation",
    false,
    busy,
    async () => false,
    () => {},
  );
  async function run(command: string, args?: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<Report | string | null>(command, args);
      if (command === "preview_migration") {
        setReport(result as Report | null);
        setMessage(result ? "请核对预览记录后确认导入。" : "未发现预览数据。");
      } else if (command === "inspect_backup") {
        if (result) {
          setRestoreInfo(result as Report);
          setAction("restore");
        }
      } else if (command === "import_preview") {
        const r = result as Report;
        setMessage(
          `导入 ${r.imported}，重复跳过 ${r.duplicates}，冲突 ${r.conflicts}，未结束冲突 ${r.skipped_active}（${r.skipped_active_ids.join(",")}），冲突记录 ${r.conflict_ids.join(",")}。备份：${r.backup}`,
        );
      } else if (result) setMessage(String(result));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (isTauri()) void run("preview_migration");
  }, []);
  return (
    <Surface title="数据管理" onClose={onClose}>
      <h3>演示数据</h3>
      <p className="hint">
        用于查看图表效果，明确标记并与真实统计分开。重复生成不会增加重复记录。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void demo("seed_demo_data");
          }}
        >
          生成演示数据
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void dashboard.open("all", "demo");
          }}
        >
          查看演示效果
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => setDemoConfirm(true)}
        >
          清理演示数据…
        </button>
      </div>
      {dashboard.fallback}
      <UiDialog
        open={demoConfirm}
        onClose={() => setDemoConfirm(false)}
        title="清理演示数据"
        id="clear-demo"
      >
        <p>只删除标记为演示的已结束记录。真实工作记录和当前任务保留。</p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setDemoConfirm(false)}>
            取消
          </button>
          <button
            onClick={() => {
              setDemoConfirm(false);
              void demo("clear_demo_data");
            }}
          >
            清理演示记录
          </button>
        </div>
      </UiDialog>
      <h3>从预览版迁移</h3>
      <p className="hint">
        先从托盘退出预览版。正式版原记录保留，重复导入会跳过；已导入记录有变化时列为冲突。两边都有未结束任务时，冲突任务留在原处。
      </p>
      {report && (
        <p>
          来源：{report.source}
          <br />
          记录 {report.records} · 待补全 {report.pending} · 未结束{" "}
          {report.active}
        </p>
      )}
      <label>
        <input
          type="checkbox"
          checked={include}
          disabled={busy}
          onChange={(e) => setInclude(e.target.checked)}
        />
        同时导入预览监测配置（默认保留正式配置；导入后先保持监测关闭）
      </label>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("preview_migration");
          }}
        >
          重新检查
        </button>
        <button disabled={busy || !report} onClick={() => setAction("import")}>
          备份并合并预览记录
        </button>
      </div>
      <h3>备份与恢复</h3>
      <p className="hint">
        完整备份包含工作数据库、监测配置、外观及布局，不含连接令牌和浏览器注册。恢复会整体替换当前快照，恢复前自动备份原数据；正在计时时请先暂停。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("create_backup");
          }}
        >
          创建备份…
        </button>
        <button
          disabled={busy}
          className="secondary"
          onClick={() => {
            void run("inspect_backup");
          }}
        >
          从备份恢复…
        </button>
      </div>
      {busy && <p role="status">正在处理，请勿退出…</p>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <UiDialog
        open={action !== null}
        onClose={() => setAction(null)}
        title="确认数据操作"
        id="confirm-data"
      >
        <p>
          {action === "import"
            ? "先备份当前数据，再合并预览记录；不会覆盖正式记录。"
            : `将从 ${restoreInfo?.backup} 恢复记录 ${restoreInfo?.records} 条（待补全 ${restoreInfo?.pending}，未结束 ${restoreInfo?.active}），替换当前数据。原数据会先自动备份。`}
        </p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setAction(null)}>
            取消
          </button>
          <button
            onClick={() => {
              const a = action;
              setAction(null);
              void run(
                a === "import" ? "import_preview" : "restore_backup",
                a === "import" ? { includeConfig: include } : undefined,
              );
            }}
          >
            确认并{action === "import" ? "导入" : "恢复备份"}
          </button>
        </div>
      </UiDialog>
    </Surface>
  );
}
export function PanelApp({ panel }: { panel: string }) {
  const layout = useLayout();
  const presentation = usePresentation();
  const appearance = useAppearance();

  const [section, setSection] = useState(
    new URLSearchParams(window.location.search).get("section") ?? "monitor",
  );
  const [version, setVersion] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(false);
  const [saving, setSaving] = useState(false);
  const drafts = useRef(new DraftController());
  const registry = { current: drafts.current.entries };
  const next = useRef<(() => void) | null>(null);
  const register = useCallback((id: string, d: Draft | null) => {
    if (d) registry.current.set(id, d);
    else registry.current.delete(id);
    const dirty = [...registry.current.values()].some((x) => x.dirty || x.busy);
    setHasDraft(dirty);
    if (isTauri())
      void invoke("set_window_dirty", { dirty }).catch((e) =>
        setError(String(e)),
      );
  }, []);
  const change = useCallback((action: () => void) => {
    if (drafts.current.busy) {
      return;
    }
    if (next.current) return;
    if ([...registry.current.values()].some((d) => d.dirty)) {
      next.current = action;
      setDecision(true);
    } else action();
  }, []);
  const close = useCallback(
    () =>
      change(() => {
        void invoke("close_panel").catch((e) => setError(String(e)));
      }),
    [change],
  );
  async function saveAll() {
    if (drafts.current.busy) return;
    if (!drafts.current.dirty) {
      const action = next.current; next.current = null; setDecision(false); action?.();
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (!(await drafts.current.save())) { setError("保存未完成，请继续编辑并查看表单错误。"); return; }
      setDecision(false);
      const action = next.current;
      next.current = null;
      action?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.querySelector("dialog[open]")) return;
        e.preventDefault();
        close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!e.repeat) void saveAll();
      }
    };
    window.addEventListener("keydown", key);
    const unsubs: Promise<() => void>[] = [];
    if (isTauri()) {
      unsubs.push(listen("workmemo:request-close", close));
      unsubs.push(
        listen<string>("workmemo:settings-section", (e) =>
          change(() =>
            setSection(
              ["appearance", "layout", "data", "visuals"].includes(e.payload)
                ? e.payload
                : "monitor",
            ),
          ),
        ),
      );
      unsubs.push(
        listen<{ source?: string } | null>("workmemo:data-changed", ({ payload }) => {
          if (payload?.source === "monitor-settings") return;
          if (!drafts.current.dirty && !drafts.current.busy && !next.current)
            setVersion((v) => v + 1);
        }),
      );
      unsubs.push(
        listen("workmemo:appearance-changed", () => {
          if (!drafts.current.dirty && !drafts.current.busy && !next.current)
            void appearance.reload();
        }),
      );
    }
    return () => {
      window.removeEventListener("keydown", key);
      for (const p of unsubs) void p.then((f) => f());
    };
  }, [change, close]);
  return (
    <DraftContext.Provider value={register}>
      <DesktopWindow
        density={layout.current.density}
        background={presentation.current.background}
        appearanceStyle={{
          ...themeStyle(appearance.current),
          ...layoutStyle(layout.current),
        }}
        navigation={
          <nav aria-label="二级窗口">
            <strong>
              {panel === "settings"
                ? "设置"
                : panel === "history"
                  ? "历史与统计"
                  : "待补全"}
            </strong>
          </nav>
        }
      >
        <div className="panel-app">
          {panel === "settings" && (
            <nav className="settings-tabs">
              {[
                ["appearance", "外观"],
                ["visuals", "工作名称与外观"],
                ["monitor", "监测"],
                ["layout", "布局"],
                ["data", "数据管理"],
              ].map(([id, label]) => (
                <button
                  className="secondary"
                  aria-pressed={section === id}
                  key={id}
                  onClick={() => change(() => setSection(id))}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          {hasDraft && (
            <p className="draft-indicator">有未保存修改 · Ctrl+S 保存</p>
          )}
          {section === "appearance" ? (
            <AppearanceSettings
              appearance={appearance}
              presentation={presentation}
              onClose={close}
            />
          ) : section === "visuals" ? (
            <VisualSettings presentation={presentation} />
          ) : section === "monitor" ? (
            <MonitoringSettings
              refreshVersion={version}
              open
              onClose={close}
            />
          ) : section === "layout" ? (
            <LayoutPanel />
          ) : (
            <DataPanel onClose={close} />
          )}
          <UiDialog
            open={decision}
            closeDisabled={saving}
            onClose={() => {
              if (drafts.current.busy) return;
              next.current = null;
              setDecision(false);
            }}
            title="保留未保存的修改？"
            id="draft-decision"
          >
            <p>保存成功后再离开；放弃只撤销本次输入，不删除已保存记录。</p>
            {error && <p className="error-banner" role="alert">{error}</p>}
            <div className="settings-actions">
              <button
                disabled={saving}
                onClick={() => {
                  void saveAll();
                }}
              >
                保存并继续
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  if (!drafts.current.discard()) return;
                  setDecision(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  next.current = null;
                  setDecision(false);
                }}
              >
                继续编辑
              </button>
            </div>
          </UiDialog>
        </div>
      </DesktopWindow>
    </DraftContext.Provider>
  );
}
```

## E:\WorkMemo\src\Dashboard.css

```css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #edf2ee;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.dc-manual-entry .wm-picker-clear {
  width: auto;
}
.dc-manual-entry-picker button {
  width: auto;
}
@media (max-width: 640px) {
  .dc-manual-entry-picker .wm-picker-datetime-panel {
    flex-direction: column;
  }
  .dc-manual-entry-picker .wm-picker-panel-container {
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
  }
  .dc-manual-entry-picker.wm-picker-dropdown .wm-picker-time-panel .wm-picker-content {
    height: 112px;
  }
}
.data-center {
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  color: #243c33;
  background: #edf2ee;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--work-color);
  background: color-mix(in srgb, var(--work-color) 12%, transparent);
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: rgb(255 255 255 / 60%);
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #52685b;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #52685b;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #52685b;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #52685b;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #52685b;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #52685b;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #52685b;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #52685b;
}
.dc-kpi p {
  font-size: 11px;
  color: #52685b;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #52685b;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #52685b;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #52685b;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #52685b;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #52685b;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #52685b;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #52685b;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #52685b;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #52685b;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #52685b;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}

/* Local browser translucency: the page canvas stays a normal browser surface. */
.data-center { background: linear-gradient(145deg, #f3f2eb, #e7efea 52%, #edf0f5); }
.data-center .wm-card { backdrop-filter: blur(12px); }
.dc-pending-list { display: grid; gap: 16px; min-width: 0; }
.dc-pending-list > p { color: #536b5b; }
.dc-pending-list .wm-table-cell { overflow-wrap: anywhere; }
.dc-pending-refresh { justify-self: start; }

.dc-pie .dc-chart { height:190px; }
.dc-pie-legend { list-style:none; margin:0; padding:0 4px 4px; display:grid; gap:2px; }
.dc-pie-legend .wm-btn { display:flex; align-items:center; width:100%; height:auto; min-height:30px; padding:4px 7px; gap:7px; }
.dc-pie-legend i { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.dc-pie-name { flex:1; min-width:0; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-pie-value { flex-shrink:0; font-size:12px; font-variant-numeric:tabular-nums; }
@media (min-width:760px) and (max-width:1199px) {
  .dc-auxiliary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .dc-auxiliary-grid .dc-calendar { grid-column:1/-1; }
}
@media (max-width:759px) { .dc-auxiliary-grid { grid-template-columns:minmax(0,1fr); } }

.dc-announcer {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
.dc-chart-hint { color: #52685b; font-size: 12px; padding: 8px 12px; }
.dc-chart-data { margin: 0 8px 8px; }
.dc-error-summary { scroll-margin-block: 20px; }
.data-center :is(button, a, [role="button"]):focus-visible,
.dc-sheet-root button:focus-visible,
.wm-modal button:focus-visible,
.dc-error-summary:focus {
  outline: 2px solid #287b63; outline-offset: 3px;
}
@media (forced-colors: active) {
  .data-center, .dc-sheet-root .wm-drawer-section, .wm-modal .wm-modal-container {
    background: Canvas !important; color: CanvasText !important; backdrop-filter: none !important;
  }
  .data-center :is(button, a, [role="button"], input, textarea, [role="combobox"]):focus-visible,
  .dc-sheet-root :is(button, input, textarea, [role="combobox"]):focus-visible,
  .wm-modal :is(button, input, textarea, [role="combobox"]):focus-visible,
  .dc-error-summary:focus {
    outline: 2px solid Highlight !important; outline-offset: 3px;
  }
  .data-center .wm-card, .dc-chart-data, .dc-record-summary { border: 1px solid CanvasText; }
}
.dc-required-mark { color: #b74251; margin-inline-end: 4px; }
```

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { loopTabWithin } from "./ui/loopTabWithin";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  trendAggregationLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { ManualEntryModal } from "./dashboard/ManualEntryModal";
import { recordStatusLabel } from "./dashboard/recordStatus";
import { CalendarChart, CategoryChart, DurationPieChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Space size={4} wrap>
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {recordStatusLabel(row)}
    </Tag>
    {row.source === "MANUAL_ENTRY" && !row.is_demo && <Tag color="blue">人工补录</Tag>}
    </Space>
  );
}
function Title({ title, description }: { title: string; description?: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<InputErrors>({});
  const [filterError, setFilterError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const requestedRefresh = useRef(false);
  const previousOnline = useRef<boolean | null>(null);
  const editorSummary = useRef<HTMLDivElement>(null);
  const confirmSummary = useRef<HTMLDivElement>(null);
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingData, setPendingData] = useState<Data | null>(null);
  const [pendingError, setPendingError] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const selectedPending = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const [hideNavHints, setHideNavHints] = useState(false);
  const [navHint, setNavHint] = useState<string | null>(null);
  const navScrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(navScrollFrame.current), []);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;
  const overlayOpen = sheetOpen || !!detail || !!confirmation || manualOpen;

  useEffect(() => {
    if (overlayOpen) {
      requestedRefresh.current = false; setAnnouncement("");
    } else if (requestedRefresh.current && !refreshing) {
      requestedRefresh.current = false;
      setAnnouncement(online && !error ? "工作数据已刷新。" : "");
    } else if (online && previousOnline.current === false) {
      setAnnouncement("与 WorkMemo 的连接正常。");
    }
    previousOnline.current = online;
  }, [online, refreshing, overlayOpen, error]);

  useEffect(() => {
    if (!editorError || busy) return;
    const frame = requestAnimationFrame(() => {
      if (confirmation) { confirmSummary.current?.focus(); return; }
      const field = Object.keys(fieldErrors)[0];
      if (field && editing) document.getElementById(`dc-${field}`)?.focus();
      else editorSummary.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [editorError, busy, confirmation, fieldErrors, editing]);
  function editField(field: keyof typeof fields, value: string) {
    setFields(previous => ({...previous,[field]:value}));
    setFieldErrors(previous => {const next = {...previous};delete next[field];return next;});
    setEditorError("");
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    if (value.period === "custom" && value.start_date && value.end_date && value.start_date > value.end_date) {
      setFilterError("开始日期不能晚于结束日期。");
      requestAnimationFrame(() => document.getElementById("dc-filter-date-end")?.focus());
      return;
    }
    setFilterError("");
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setFieldErrors({});
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const readPending = useCallback(async (criteria: Query) => {
    let list = await api<Data>("query", criteria);
    if (criteria.page > list.pages && list.pages > 0)
      list = await api<Data>("query", { ...criteria, page: list.pages });
    setPendingQuery({ ...criteria, page: list.page });
    setPendingData(list);
    setPendingError("");
  }, []);
  async function refreshPending(criteria: Query) {
    if (busyRef.current || !online) return;
    busyRef.current = true; setBusy(true);
    try { await readPending(criteria); }
    catch (e) { setPendingError(String(e instanceof Error ? e.message : e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function returnToPending() {
    if (!pendingQuery) return;
    setDetail(null); setEditing(false); setEditorError("");
    void refreshPending(pendingQuery);
  }
  useEffect(() => {
    if (!sheetOpen || detail || !pendingData) return;
    const frame = requestAnimationFrame(() => {
      const id = selectedPending.current;
      const button = document.querySelector<HTMLElement>(`[data-pending-id="${id}"]`)
        ?? document.querySelector<HTMLElement>("[data-pending-id]")
        ?? document.querySelector<HTMLElement>(".dc-pending-refresh");
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sheetOpen, detail, pendingData]);
  async function selectPending(row: Row) {
    if (!pendingQuery || !pendingData || busyRef.current || !online) return;
    selectedPending.current = row.id;
    busyRef.current = true; setBusy(true); setPendingError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      const record = value.record;
      const date = localDate(new Date(record.start_time));
      if (record.status !== "FINISHED" || record.settlement_status !== "PENDING"
        || record.category !== pendingQuery.category
        || (pendingQuery.scope !== "all" && record.is_demo !== (pendingQuery.scope === "demo"))
        || (pendingData.range.start_date && date < pendingData.range.start_date)
        || (pendingData.range.end_date && date > pendingData.range.end_date)) {
        setPendingStatus("这条记录已变化，请重新选择。");
        await readPending(pendingQuery);
        return;
      }
      showDetail(value, true); setEditorError("");
    } catch (e) {
      // A removed row must not silently open a different record.
      try { await readPending(pendingQuery); }
      catch { /* Preserve the original error and offer an explicit retry. */ }
      setPendingError(e instanceof Error ? e.message : String(e));
    } finally { busyRef.current = false; setBusy(false); }
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || sheetOpen || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    setPendingQuery(criteria); setPendingData(null); setPendingError(""); setPendingStatus("");
    selectedPending.current = null; setSheetOpen(true);
    setActionError("");
    await refreshPending(criteria);
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setFieldErrors(result.errors);
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setFieldErrors({});
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      if (pendingQuery) {
        setDetail(null); setEditing(false); setEditorError("");
        setPendingStatus("工作量已保存，请选择下一条记录。");
        // A committed write stays committed even when refreshing the list fails.
        setPendingData(null);
        try { await readPending(pendingQuery); }
        catch (e) { setPendingError(`已保存，列表刷新失败：${e instanceof Error ? e.message : String(e)}`); }
        return true;
      }
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message, pendingQuery, readPending]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || sheetOpen}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.task_name && row.task_name !== value && row.task_name !== name(value) && <span className="dc-muted">{row.task_name}</span>}
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "未结算"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label} htmlFor={`dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`} validateStatus={filterError && !required ? "error" : undefined}>
      <DatePicker
        id={`dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`}
        aria-required={required}
        aria-invalid={!!filterError && !required}
        aria-describedby={filterError && !required ? "dc-filter-error" : undefined}
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => {setFilterError("");change(date?.format("YYYY-MM-DD") ?? null);}}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <div className="dc-announcer" role="status" aria-atomic="true">{announcement}</div>
      <aside className="dc-sidebar" inert={overlayOpen}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          tooltip={false}
          onMouseLeave={() => { setHideNavHints(false); setNavHint(null); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHideNavHints(false); }}
          items={[
            {
              key: "overview",
              icon: <Tooltip title="工作总览" placement="right" trigger={[]} open={!hideNavHints && navHint === "overview"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="chart" /></span>
              </Tooltip>,
              label: "工作总览",
              onMouseEnter: () => setNavHint("overview"),
              onMouseLeave: () => setNavHint(null),
            },
            {
              key: "records",
              icon: <Tooltip title="工作明细" placement="right" trigger={[]} open={!hideNavHints && navHint === "records"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="list" /></span>
              </Tooltip>,
              label: "工作明细",
              onMouseEnter: () => setNavHint("records"),
              onMouseLeave: () => setNavHint(null),
            },
          ]}
          onClick={({ key, domEvent }) => {
            setHideNavHints(domEvent.type !== "keydown");
            setNavHint(null);
            cancelAnimationFrame(navScrollFrame.current);
            navScrollFrame.current = requestAnimationFrame(() => {
              // Commit the closed tooltip first, and cancel an older smooth scroll.
              window.scrollTo({ top: window.scrollY, behavior: "instant" });
              if (key === "records")
                recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
              else window.scrollTo({ top: 0, behavior: scrollBehavior });
            });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={overlayOpen}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button type="primary" disabled={blocked || !online || !meta?.manual_entry || query.scope === "demo"}
              onClick={() => setManualOpen(true)}>补记录</Button>
            <Button
              icon={<Icon name="refresh" />}
              disabled={refreshing}
              onClick={() => {requestedRefresh.current = true;setAnnouncement("");setRefresh((value) => value + 1);}}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              aria-label="工作报表筛选"
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别" htmlFor="dc-filter-category">
                <Select
                  id="dc-filter-category"
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态" htmlFor="dc-filter-status">
                <Select
                  id="dc-filter-status"
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "unfinished", label: "未结束" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围" htmlFor="dc-filter-scope">
                <Select
                  id="dc-filter-scope"
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            {filterError && <Alert id="dc-filter-error" type="error" showIcon title={filterError} className="dc-notice" />}
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", unfinished: "未结束", working: "活动任务" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${trendAggregationLabel(data?.range)} · 已结束记录的有效工时`}
              />
            }
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: "辅助分析",
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card className="dc-pie" title={<Title title="工时占比" />} styles={{ body: { padding: 8 } }}>
                      <DurationPieChart categories={data.categories} presentation={presentation}
                        onCategory={category => applyQuery({ ...query, category, page: 1 })} />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {pendingQuery && !detail ? "选择待补填记录" : editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingData(null); setPendingError(""); setPendingStatus("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && detail && <Button disabled={blocked} onClick={() => leave(returnToPending)}>
                返回列表
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : detail ? (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              ) : null}
            </Space>
          </div>
        }
      >
        {pendingQuery && !detail && <section className="dc-pending-list" aria-label="待补填记录列表">
          <p>{name(pendingQuery.category ?? "")} · {pendingData ? reportRangeLabel(pendingData.range) : "当前已应用周期"} · 请选择具体记录</p>
          {pendingStatus && <Alert type={pendingStatus.startsWith("工作量已保存") ? "success" : "info"} title={pendingStatus} role="status" />}
          {pendingError && <Alert type="error" title={pendingError} showIcon />}
          <Button className="dc-pending-refresh" disabled={blocked || !online} loading={busy} onClick={() => { void refreshPending(pendingQuery); }}>刷新待补填列表</Button>
          {busy && !pendingData ? <Skeleton active /> : pendingData && <>
            <Table<Row> rowKey="id" pagination={false} dataSource={pendingData.records} scroll={{ x: 550 }}
              locale={{ emptyText: "当前分类在这个范围已没有待补填记录。" }} columns={[
                { title: "记录", key: "record", render: (_, row) => <><strong>#{row.id}</strong><div>{formatTime(row.start_time)}</div><div>至 {row.end_time ? formatTime(row.end_time) : "—"}</div></> },
                { title: "有效工时", key: "duration", render: (_, row) => formatDuration(row.duration_ms / 1000) },
                { title: "备注", dataIndex: "remark", render: (value: string) => value || "无备注" },
                { title: "操作", key: "action", render: (_, row) => <Button data-pending-id={row.id} aria-label={`补填记录${row.id}`} disabled={blocked || !online || !!pendingError} onClick={() => { void selectPending(row); }}>补填</Button> },
              ]} />
            <Pagination current={pendingData.page} total={pendingData.record_count} pageSize={50} showSizeChanger={false} disabled={blocked || !online}
              onChange={page => { void refreshPending({ ...pendingQuery, page }); }} />
          </>}
        </section>}
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                aria-label="工作量编辑"
                noValidate
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category" required help={fieldErrors.category && <span id="dc-category-error">{fieldErrors.category}</span>} validateStatus={fieldErrors.category ? "error" : undefined}>
                  <Select
                    id="dc-category"
                    aria-required
                    aria-invalid={!!fieldErrors.category}
                    aria-describedby={fieldErrors.category ? "dc-category-error" : undefined}
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) => editField("category", value)}
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  required
                  help={fieldErrors.quantity && <span id="dc-quantity-error">{fieldErrors.quantity}</span>}
                  validateStatus={fieldErrors.quantity ? "error" : undefined}
                  extra={<span id="dc-quantity-hint">0 表示已确认无产出；支持小数和科学计数，最大 10 亿。</span>}
                >
                  <Input
                    id="dc-quantity"
                    required
                    aria-invalid={!!fieldErrors.quantity}
                    aria-describedby={`dc-quantity-hint${fieldErrors.quantity ? " dc-quantity-error" : ""}`}
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) => editField("quantity", event.target.value)}
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark" help={fieldErrors.remark && <span id="dc-remark-error">{fieldErrors.remark}</span>} validateStatus={fieldErrors.remark ? "error" : undefined} extra={<span id="dc-remark-hint">最多 2000 个字符。</span>}>
                  <Input.TextArea
                    id="dc-remark"
                    aria-invalid={!!fieldErrors.remark}
                    aria-describedby={`dc-remark-hint${fieldErrors.remark ? " dc-remark-error" : ""}`}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) => editField("remark", event.target.value)}
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <div ref={editorSummary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="工作记录操作错误"><Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              /></div>
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      {detail.record.source === "MANUAL_ENTRY" && !detail.record.is_demo
                        ? "人工补录的有效工时，没有自动计时区间。"
                        : "旧记录仅保留累计工时，没有可展示的区间。"}
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      {manualOpen && <ManualEntryModal online={online} onClose={() => setManualOpen(false)} onSaved={saved => {
        setManualOpen(false);
        applyQuery({ ...query, period: "day", anchor_date: localDate(new Date(saved.record.start_time)),
          start_date: null, end_date: null, category: null, scope: "real", status: "all", page: 1 });
        setRefresh(value => value + 1);
        void message.success("补记录已保存，可在工作明细中查看。");
      }} />}
      <Modal
        modalRender={node => <div onKeyDown={loopTabWithin} style={{display:"contents"}}>{node}</div>}
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <div ref={confirmSummary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="确认操作错误"><Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          /></div>
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
```

## E:\WorkMemo\src\reportPeriod.ts

```ts
import { localDate } from "./history.ts";

export type ReportPeriod = "day" | "week" | "month" | "custom";
export interface ReportRange {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  trend_unit: "hour" | "day" | "month";
  // Optional so a new web build can still read an older backend's unit-sized buckets.
  trend_step?: number;
}
export function trendAggregationLabel(range?: ReportRange): string {
  if (range?.trend_unit === "hour") return "按开始小时汇总";
  if (range?.trend_unit === "month") return (range.trend_step ?? 1) > 1
    ? `每 ${range.trend_step} 个月汇总（标签为起始月份）` : "按开始月份汇总";
  return "按开始日期汇总";
}
export function shiftPeriod(period: ReportPeriod, anchor: string, direction: number): string | null {
  const date = new Date(`${anchor}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || period === "custom") return null;
  if (period === "month") { date.setDate(1); date.setMonth(date.getMonth() + direction); }
  else date.setDate(date.getDate() + direction * (period === "week" ? 7 : 1));
  return date.getFullYear() >= 1970 && date.getFullYear() <= 9999 ? localDate(date) : null;
}
export function reportRangeLabel(range: ReportRange): string {
  if (range.period === "day") return range.start_date?.replace(/-/g, ".") ?? "今天";
  if (range.period === "month") return range.start_date ? range.start_date.slice(0, 7).replace("-", " 年 ") + " 月" : "本月";
  return `${range.start_date ?? "最早记录"} — ${range.end_date ?? "至今"}`;
}
```

## E:\WorkMemo\src\dashboard\Charts.tsx

```tsx
import { memo, useEffect, useId, useMemo, useRef } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { init, use as registerCharts, type ECharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart, PieChart } from "echarts/charts";
import { Button, Empty } from "antd";
import { durationSlices } from "./durationPie";
import { formatDuration } from "../types";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { Data } from "./api";
import type { Presentation } from "../desktopPreferences";
import { formatQuantity, localDate } from "../history";
import { useCategoryNames } from "../categoryNames";
import { useMediaQuery } from "../ui/UiProvider";

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#fff",
  borderColor: "#dce6df",
  textStyle: { color: "#243c33" },
};

const Chart = memo(function Chart({
  option,
  label,
  descriptionId,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  descriptionId?: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = node.current;
        if (
          host &&
          (instance.getWidth() !== host.clientWidth ||
            instance.getHeight() !== host.clientHeight)
        )
          instance.resize();
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    // Merge named series; a poll must not replace the whole chart or replay its entrance.
    chart.current?.setOption(option, {
      replaceMerge: ["series"],
      lazyUpdate: true,
    });
  }, [option]);
  return <div ref={node} className="dc-chart" role="img" aria-label={label} aria-describedby={descriptionId} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const descriptionId = useId();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) =>
          `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`,
      },
      legend: { top: 0, right: 16, data: ["有效工时"] },
      grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.map((x) => x.date),
        axisLine: { lineStyle: { color: "#dce7e0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#52685b",
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          // Backend buckets already contain canonical HH:mm, YYYY-MM-DD or YYYY-MM.
          // Keep the year so different years cannot collapse to the same axis label.
        },
      },
      yAxis: {
        type: "value",
        name: "小时",
        min: 0,
        axisLabel: { color: "#52685b" },
        splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } },
      },
      series: [
        {
          id: "work-duration",
          name: "有效工时",
          type: "line",
          smooth: false,
          symbolSize: 5,
          data: trend.map((x) => x.duration_ms / 3600000),
          lineStyle: { width: 2.5, color: "#287b63" },
          itemStyle: { color: "#287b63" },
          areaStyle: { color: "#eaf3ee", opacity: 0.7 },
        },
      ],
    }),
    [trend, range, reduced],
  );
  if (!trend.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="当前范围没有已结束记录。" />;
  return <>
    <Chart option={option} label="有效工时趋势" descriptionId={descriptionId} />
    <p id={descriptionId} className="dc-chart-hint">展开数据表可读取各周期工时，按秒显示。</p>
    <ChartDataTable title="趋势" rows={trend.map(row => ({label:row.date,duration_ms:row.duration_ms}))} />
  </>;
}

export function CategoryChart({
  categories,
  presentation,
  metric,
  onCategory,
}: {
  categories: Data["categories"];
  presentation: Presentation;
  metric: string;
  onCategory: (name: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) => {
          const amount = Number(value);
          if (metric !== "duration") return formatQuantity(amount);
          return amount > 0 && amount < 0.01
            ? `${(amount * 3600).toLocaleString("zh-CN", { maximumFractionDigits: 3 })} 秒（不足 0.01 小时）`
            : `${amount.toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`;
        },
      },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f0" } } },
      yAxis: {
        type: "category",
        data: categories.map((x) => name(x.category)),
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          id: "category-total",
          type: "bar",
          barMaxWidth: 24,
          data: categories.map((x) => ({
            name: name(x.category),
            value:
              metric === "duration"
                ? x.duration_ms / 3600000
                : x.quantity,
            itemStyle: {
              color: presentation.categories[x.category]?.color,
              borderRadius: [0, 5, 5, 0],
            },
          })),
        },
      ],
    }),
    [categories, presentation, metric, name, reduced],
  );
  return (
    <Chart
      option={option}
      label="按类别汇总的工作分布"
      onCategory={onCategory}
    />
  );
}

export function DurationPieChart({ categories, presentation, onCategory }: {
  categories: Data["categories"];
  presentation: Presentation;
  onCategory: (category: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const slices = useMemo(() => durationSlices(categories), [categories]);
  const option = useMemo<EChartsOption>(() => ({
    animation: !reduced,
    animationDuration: 240,
    animationDurationUpdate: 160,
    tooltip: {
      ...tooltip, trigger: "item",
      formatter: params => {
        const point = Array.isArray(params) ? params[0] : params;
        const slice = slices.find(row => row.category === point.name);
        return slice ? `${name(slice.category)}\n${formatDuration(slice.value / 1000)} · ${slice.percentLabel}` : "";
      },
    },
    series: [{
      id: "category-duration-share", type: "pie", radius: "78%", center: ["50%", "50%"],
      stillShowZeroSum: false,
      label: { show: false },
      emphasis: { scaleSize: 4 },
      data: slices.map(slice => ({
        name: slice.category, value: slice.value,
        itemStyle: { color: presentation.categories[slice.category]?.color },
      })),
    }],
  }), [slices, name, presentation, reduced]);
  if (!slices.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无有效工时" />;
  return <>
    <Chart option={option} label="按类别汇总的工时占比" onCategory={onCategory} />
    <ul className="dc-pie-legend" aria-label="工时占比明细">
      {slices.map(slice => <li key={slice.category}>
        <Button type="text" style={{ width: "100%" }} onClick={() => onCategory(slice.category)} aria-label={`${name(slice.category)} ${slice.percentLabel}，工时 ${formatDuration(slice.value / 1000)}，筛选此类别`}>
          <i aria-hidden="true" style={{ background: presentation.categories[slice.category]?.color }} />
          <span className="dc-pie-name" title={name(slice.category)}>{name(slice.category)}</span>
          <span className="dc-pie-value">{slice.percentLabel}</span>
        </Button>
      </li>)}
    </ul>
  </>;
}

export function CalendarChart({
  calendar,
  range,
}: Pick<Data, "calendar" | "range">) {
  const descriptionId = useId();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(() => {
    const end = range.end_date ?? localDate(new Date());
    const start = new Date(`${end}T12:00:00`);
    start.setDate(start.getDate() - 89);
    const startDate =
      range.start_date && range.start_date > localDate(start)
        ? range.start_date
        : localDate(start);
    const max = Math.max(1, ...calendar.map((v) => v[1]));
    return {
      animation: !reduced,
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise",
        show: false,
        pieces: [
          { value: 0, color: "#ebedf0" },
          ...["#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => ({
            gt: (i * max) / 4,
            lte: ((i + 1) * max) / 4,
            color,
          })),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#52685b" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#52685b" },
        splitLine: { lineStyle: { color: "#dce6df" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          id: "work-calendar",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendar,
        },
      ],
    };
  }, [calendar, range, reduced]);
  return <>
    <Chart option={option} label="筛选范围内的有效工时工作日历" descriptionId={descriptionId} />
    <p id={descriptionId} className="dc-chart-hint">展开数据表可读取日历中的日期及工时，按秒显示。</p>
    <ChartDataTable title="工作日历" rows={calendar.map(([label,duration_ms]) => ({label,duration_ms}))} />
  </>;
}
```

## E:\WorkMemo\scripts\dashboard-fixture.mjs

```javascript
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
    manualCapability: true,
    manualSaves: 0,
    manualFailure: false,
    manualDelay: 0,
    manualLoseResponse: false,
    manualEntries: new Map(),
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
      trend_step: 1,
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status === "WORKING") ||
          (query.status === "unfinished" && ["WORKING", "SUSPENDED"].includes(row.status)) ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const dayKey = row => iso(new Date(row.start_time + 8 * 3600000));
    const monthIndex = date => Number(date.slice(0,4))*12+Number(date.slice(5,7))-1;
    const monthKey = index => `${Math.floor(index/12).toString().padStart(4,"0")}-${String(index%12+1).padStart(2,"0")}`;
    let customBuckets=[], origin=0;
    if(query.period === "custom" && ended.length) {
      const dates=ended.map(dayKey).sort();
      const start=resolved.start_date||dates[0],end=resolved.end_date||dates.at(-1);
      const days=(Date.parse(end+"T12:00:00Z")-Date.parse(start+"T12:00:00Z"))/86400000;
      if(days<=120)customBuckets=Array.from({length:days+1},(_,i)=>iso(new Date(Date.parse(start+"T12:00:00Z")+i*86400000)));
      else {
        resolved.trend_unit="month";origin=monthIndex(start);
        const months=monthIndex(end)-origin+1;
        resolved.trend_step=Math.ceil(months/1200);
        customBuckets=Array.from({length:Math.ceil(months/resolved.trend_step)},(_,i)=>monthKey(origin+i*resolved.trend_step));
      }
    }
    const bucketKey = row => resolved.trend_unit === "month"
      ? monthKey(origin+Math.floor((monthIndex(dayKey(row))-origin)/resolved.trend_step)*resolved.trend_step) : dayKey(row);
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? customBuckets
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : bucketKey(row) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: resolved.trend_unit === "month",
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          manual_entry: state.manualCapability,
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      if (!record) return route.fulfill({ status: 404, json: { error: "记录已删除，请刷新列表" } });
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "manual-entry") {
      state.manualSaves++;
      if (state.manualDelay) await new Promise(resolve => setTimeout(resolve, state.manualDelay));
      if (state.manualFailure) return route.fulfill({ status: 500, json: { error: "隔离补录保存失败" } });
      let record = state.manualEntries.get(body.request_id);
      if (!record) {
        record = { ...state.records[0], ...body, id: 1000 + state.manualEntries.size,
          duration_seconds: Math.floor(body.duration_ms / 1000), legacy_duration_ms: body.duration_ms,
          source: "MANUAL_ENTRY", status: "FINISHED", settlement_status: "COMPLETE", is_demo: false, revision: 0 };
        state.manualEntries.set(body.request_id, record);
        state.records.push(record);
      }
      if (state.manualLoseResponse) { state.manualLoseResponse = false; return route.abort('connectionreset'); }
      return route.fulfill({ json: { record, segments: [], revisions: [] } });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
```

## E:\WorkMemo\tests\report-period.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftPeriod, reportRangeLabel, trendAggregationLabel} from '../src/reportPeriod.ts';

test('自然周期切换跨年、闰月与长短月不跳过月份',()=>{
  assert.equal(shiftPeriod('month','2024-01-31',1),'2024-02-01');
  assert.equal(shiftPeriod('month','2026-12-31',1),'2027-01-01');
  assert.equal(shiftPeriod('day','2024-02-28',1),'2024-02-29');
  assert.equal(shiftPeriod('day','2024-02-29',1),'2024-03-01');
  assert.equal(shiftPeriod('week','2026-12-28',1),'2027-01-04');
  assert.equal(shiftPeriod('week','2027-01-04',-1),'2026-12-28');
});
test('周期导航拒绝越过数据日期边界，自定义范围不假装自然周期',()=>{
  assert.equal(shiftPeriod('day','1970-01-01',-1),null);
  assert.equal(shiftPeriod('month','9999-12-01',1),null);
  assert.equal(shiftPeriod('custom','2026-10-29',1),null);
  assert.equal(shiftPeriod('day','invalid',1),null);
  assert.equal(reportRangeLabel({period:'custom',start_date:null,end_date:null}),'最早记录 — 至今');
  assert.equal(reportRangeLabel({period:'month',start_date:'2026-10-01'}),'2026 年 10 月');
});

test('合并月份的标签说明聚合宽度，并兼容旧后端缺少步长',()=>{
  assert.equal(trendAggregationLabel({trend_unit:'month',trend_step:81}),'每 81 个月汇总（标签为起始月份）');
  assert.equal(trendAggregationLabel({trend_unit:'month'}),'按开始月份汇总');
  assert.equal(trendAggregationLabel({trend_unit:'hour'}),'按开始小时汇总');
});
```

## E:\WorkMemo\tests\dashboard-trend.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dashboardFixture} from '../scripts/dashboard-fixture.mjs';

test('browser trend fixtures obey the real SQLite query contract',async()=>{
 const contract=JSON.parse(await readFile(new URL('./fixtures/dashboard-trend-contract.json',import.meta.url),'utf8'));
 const state=await dashboardFixture({route:async()=>{}}),base=state.records[0];
 state.active=null;
 state.records=contract.records.map((r,index)=>({...base,...r,id:index+1,
  start_time:Date.parse(r.date+'T12:00:00+08:00'),status:'FINISHED',
  settlement_status:r.quantity===null?'PENDING':'COMPLETE'}));
 for(const {name,query,expected:e} of contract.cases){
  const r=state.data({anchor_date:null,scope:'real',status:'all',page:1,...query});
  assert.equal(r.range.trend_unit,e.unit,name);assert.equal(r.range.trend_step,e.step,name);
  assert.equal(r.trend.length,e.count,name);
  assert.equal(r.trend[0]?.date??null,e.first,name);assert.equal(r.trend.at(-1)?.date??null,e.last,name);
  assert.equal(r.trend.reduce((n,r)=>n+r.duration_ms,0),e.duration_ms,name);
  assert.equal(r.trend.reduce((n,r)=>n+r.records,0),e.records,name);
  assert.equal(r.totals.records,e.records,name);
  assert.deepEqual(Object.fromEntries(r.trend.filter(r=>r.duration_ms!==0).map(r=>[r.date,r.duration_ms])),e.nonzero,name);
 }
});
```

## E:\WorkMemo\tests\fixtures\dashboard-trend-contract.json

```json
{
  "records": [
    {
      "date": "2024-02-28",
      "category": "评测",
      "quantity": 0,
      "duration_ms": 1
    },
    {
      "date": "2024-03-01",
      "category": "评测",
      "quantity": null,
      "duration_ms": 2000
    },
    {
      "date": "2026-10-29",
      "category": "评测",
      "quantity": 2.5,
      "duration_ms": 1234
    },
    {
      "date": "2026-10-30",
      "category": "质检",
      "quantity": 0,
      "duration_ms": 0
    }
  ],
  "cases": [
    {
      "name": "leap gap and explicit edges",
      "query": {
        "period": "custom",
        "start_date": "2024-02-27",
        "end_date": "2024-03-02",
        "category": null
      },
      "expected": {
        "unit": "day",
        "step": 1,
        "count": 5,
        "first": "2024-02-27",
        "last": "2024-03-02",
        "duration_ms": 2001,
        "records": 2,
        "nonzero": {
          "2024-02-28": 1,
          "2024-03-01": 2000
        }
      }
    },
    {
      "name": "whole year despite concentrated records",
      "query": {
        "period": "custom",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "category": null
      },
      "expected": {
        "unit": "month",
        "step": 1,
        "count": 12,
        "first": "2026-01",
        "last": "2026-12",
        "duration_ms": 1234,
        "records": 2,
        "nonzero": {
          "2026-10": 1234
        }
      }
    },
    {
      "name": "extreme bounded aggregation",
      "query": {
        "period": "custom",
        "start_date": "1970-01-01",
        "end_date": "9999-12-31",
        "category": null
      },
      "expected": {
        "unit": "month",
        "step": 81,
        "count": 1190,
        "first": "1970-01",
        "last": "9995-10",
        "duration_ms": 3235,
        "records": 4,
        "nonzero": {
          "2024-01": 3235
        }
      }
    },
    {
      "name": "empty selection remains empty",
      "query": {
        "period": "custom",
        "start_date": "1970-01-01",
        "end_date": "9999-12-31",
        "category": "文档"
      },
      "expected": {
        "unit": "day",
        "step": 1,
        "count": 0,
        "first": null,
        "last": null,
        "duration_ms": 0,
        "records": 0,
        "nonzero": {}
      }
    },
    {
      "name": "unbounded history infers data dates",
      "query": {
        "period": "custom",
        "start_date": null,
        "end_date": null,
        "category": null
      },
      "expected": {
        "unit": "month",
        "step": 1,
        "count": 33,
        "first": "2024-02",
        "last": "2026-10",
        "duration_ms": 3235,
        "records": 4,
        "nonzero": {
          "2024-02": 1,
          "2024-03": 2000,
          "2026-10": 1234
        }
      }
    },
    {
      "name": "open end inferred from selected records",
      "query": {
        "period": "custom",
        "start_date": "2026-10-01",
        "end_date": null,
        "category": null
      },
      "expected": {
        "unit": "day",
        "step": 1,
        "count": 30,
        "first": "2026-10-01",
        "last": "2026-10-30",
        "duration_ms": 1234,
        "records": 2,
        "nonzero": {
          "2026-10-29": 1234
        }
      }
    },
    {
      "name": "open start inferred from selected records",
      "query": {
        "period": "custom",
        "start_date": null,
        "end_date": "2024-03-01",
        "category": null
      },
      "expected": {
        "unit": "day",
        "step": 1,
        "count": 3,
        "first": "2024-02-28",
        "last": "2024-03-01",
        "duration_ms": 2001,
        "records": 2,
        "nonzero": {
          "2024-02-28": 1,
          "2024-03-01": 2000
        }
      }
    },
    {
      "name": "real zero remains a record",
      "query": {
        "period": "custom",
        "start_date": "2026-10-30",
        "end_date": "2026-10-30",
        "category": null
      },
      "expected": {
        "unit": "day",
        "step": 1,
        "count": 1,
        "first": "2026-10-30",
        "last": "2026-10-30",
        "duration_ms": 0,
        "records": 1,
        "nonzero": {}
      }
    }
  ]
}
```

## E:\WorkMemo\scripts\verify-web-phase-c.mjs

```javascript
// Verify trend contracts and route loading using isolated HTTP/IPC fixtures only.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dashboardFixture} from './dashboard-fixture.mjs';
import {desktopFixture} from './desktop-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-c/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const contract=JSON.parse(await readFile(new URL('../tests/fixtures/dashboard-trend-contract.json',import.meta.url),'utf8'));
const result={passed:[],errors:[],routes:[]};
let context,page;
function chartOption(el){
 let fiber=el[Object.keys(el).find(key=>key.startsWith('__reactFiber'))];
 while(fiber&&!fiber.memoizedProps?.option)fiber=fiber.return;
 let hook=fiber?.memoizedState;while(hook&&typeof hook.memoizedState?.current?.getOption!=='function')hook=hook.next;
 const option=hook.memoizedState.current.getOption();return {axis:option.xAxis[0].data,values:option.series[0].data};
}
async function setup(){
 await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>result.errors.push(e.message));
 return page;
}
async function date(name,value){const field=page.getByRole('textbox',{name,exact:true});await field.fill(value||'');await field.press('Enter');await page.locator('.wm-picker-dropdown:visible').waitFor({state:'hidden'});}
try{
 for(const index of [0,1,2,3,7]){
  await setup();const state=await dashboardFixture(page),row=state.records[0];state.active=null;
  state.records=contract.records.map((r,i)=>({...row,...r,id:i+1,start_time:Date.parse(r.date+'T12:00:00+08:00'),status:'FINISHED',settlement_status:r.quantity===null?'PENDING':'COMPLETE'}));
  const test=contract.cases[index];
  await page.goto(base+'/dashboard#token=isolated-phase-c');await page.getByRole('button',{name:'应用筛选',exact:true}).waitFor();
  await page.locator('.dc-period-bar').getByText('自定义',{exact:true}).click();
  await date('开始日期',test.query.start_date);await date('结束日期',test.query.end_date);
  if(test.query.category){await page.getByRole('combobox',{name:'筛选工作类别',exact:true}).click();await page.locator('.wm-select-dropdown:visible').getByText(test.query.category,{exact:true}).click();}
  const response=page.waitForResponse(r=>r.url().endsWith('/api/query')&&r.request().postDataJSON()?.start_date===test.query.start_date&&r.request().postDataJSON()?.category===test.query.category);
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();await response;
  await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
  if(!test.expected.count){await page.locator('.dc-trend').getByText('当前范围没有已结束记录。',{exact:true}).waitFor();assert.equal(await page.locator('.dc-trend canvas').count(),0);}
  else{
   await page.locator('.dc-trend canvas').first().waitFor();await page.waitForTimeout(250);
   const option=await page.locator('.dc-trend .dc-chart').evaluate(chartOption);
   assert.equal(option.axis.length,test.expected.count);assert.equal(option.axis[0],test.expected.first);assert.equal(option.axis.at(-1),test.expected.last);
   assert.ok(Math.abs(option.values.reduce((n,v)=>n+v,0)*3600000-test.expected.duration_ms)<0.000001);
   assert.deepEqual(Object.fromEntries(option.axis.flatMap((date,i)=>option.values[i]===0?[]:[[date,Math.round(option.values[i]*3600000)]])),test.expected.nonzero);
   await page.getByRole('button',{name:'查看趋势数据',exact:true}).click();
   const table=page.getByRole('table',{name:'趋势数据',exact:true});await table.getByText(test.expected.first,{exact:true}).waitFor();
   if(index===0)await table.getByRole('row').filter({hasText:'2024-02-29'}).getByRole('cell',{name:'0',exact:true}).waitFor();
   if(index===2){await page.locator('.dc-trend').getByText('每 81 个月汇总（标签为起始月份）',{exact:false}).waitFor();await page.locator('.dc-trend .wm-pagination-item-100').click();await table.getByText(test.expected.last,{exact:true}).waitFor();}
   if(index===0||index===2)await page.locator('.dc-trend').screenshot({path:fileURLToPath(new URL(index===0?'trend-leap-day.png':'trend-bounded.png',output))});
  }
  result.passed.push(test.name);
 }
 await setup();await dashboardFixture(page);const resources=[];page.on('request',r=>{if(/\.(js|css)(?:\?|$)/.test(r.url()))resources.push(r.url().split('/').at(-1));});
 await page.goto(base+'/dashboard#token=isolated-route-loading');await page.locator('.dc-records tr[data-row-key="1"]').waitFor();await page.waitForTimeout(500);
 assert.ok(!resources.some(n=>/^(App-|PanelApp-|NotificationApp-|TaskList-)/.test(n)),JSON.stringify(resources));
 result.routes.push({route:'dashboard',resources});result.passed.push('dashboard avoids desktop-only JavaScript and CSS');
 for(const [query,route] of [['?state=empty','main'],['?panel=settings','panel'],['?notice=1&candidate=1&state=empty','notice']]){
  await setup();await desktopFixture(page);await page.goto(base+'/'+query);await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(200);assert.equal(await page.locator('.data-center').count(),0);
  assert.equal(await page.locator('.desktop-frame').evaluate(el=>getComputedStyle(el).position),'relative',route);
  result.routes.push({route,loaded:true});
 }
 result.passed.push('main, panel and notice routes load their own components and desktop styles');
 assert.deepEqual(result.errors,[]);await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(e){await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});throw e;}
finally{await browser.close();}
```

## E:\WorkMemo\scripts\measure-web-phase-c.mjs

```javascript
// Local lab measurements only: production assets, isolated HTTP data, no telemetry.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {dashboardFixture} from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const label=process.env.WORKMEMO_MEASUREMENT||'after';
assert.match(label,/^[a-z0-9-]+$/);
const output=new URL(`../artifacts/web-phase-c/${label}/`,import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={label,browser:browser.version(),cpu:4,viewport:[1440,1000],samples:[]};
try{
 for(let sample=1;sample<=3;sample++){
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await dashboardFixture(page);
  await page.route('**/dashboard',async route=>{const r=await route.fetch();await route.fulfill({response:r,headers:{...r.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});});
  await context.addInitScript(()=>{
   window.lab={longTasks:[],frames:[],events:[],lcp:0,cls:0};
   const observe=(type,callback,extra={})=>{if(PerformanceObserver.supportedEntryTypes.includes(type))new PerformanceObserver(callback).observe({type,buffered:true,...extra});};
   observe('longtask',list=>window.lab.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));
   observe('largest-contentful-paint',list=>window.lab.lcp=list.getEntries().at(-1)?.startTime||0);
   observe('layout-shift',list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value;});
   observe('long-animation-frame',list=>window.lab.frames.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration,scripts:e.scripts.map(s=>({source:s.sourceURL.split('/').at(-1),duration:s.duration,invoker:s.invoker,function:s.sourceFunctionName}))}))));
   observe('event',list=>window.lab.events.push(...list.getEntries().filter(e=>e.interactionId).map(e=>({name:e.name,duration:e.duration,interactionId:e.interactionId}))),{durationThreshold:16});
  });
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,loading,blink.user_timing',transferMode:'ReturnAsStream'});
  await page.goto(base+'/dashboard#token=isolated-phase-c-performance');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.locator('.dc-trend canvas').waitFor();
  await page.waitForTimeout(1000);
  const cold=await page.evaluate(()=>({...window.lab,ready:performance.now(),resources:performance.getEntriesByType('resource').filter(e=>/\.js(?:\?|$)/.test(e.name)).map(e=>({name:e.name.split('/').at(-1),bytes:e.decodedBodySize}))}));
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
  await cdp.send('Tracing.end');const {stream}=await complete;
  let traceText='';while(true){const chunk=await cdp.send('IO.read',{handle:stream});traceText+=chunk.data;if(chunk.eof)break;}
  await cdp.send('IO.close',{handle:stream});
  await writeFile(new URL(`cold-${sample}.trace.json`,output),traceText);
  const events=JSON.parse(traceText).traceEvents;
  const timeline={};for(const e of events)if(e.ph==='X'&&e.dur&&['EvaluateScript','v8.compile','v8.compileModule','v8.evaluateModule','FunctionCall','Layout','UpdateLayoutTree','Paint','RunTask'].includes(e.name))timeline[e.name]=(timeline[e.name]||0)+e.dur/1000;
  const scriptEvents=events.filter(e=>e.ph==='X'&&['EvaluateScript','v8.compile','v8.compileModule','v8.evaluateModule'].includes(e.name)).map(e=>({name:e.name,duration:e.dur/1000,url:e.args?.data?.url||e.args?.data?.fileName})).sort((a,b)=>b.duration-a.duration).slice(0,12);
  const interactions=[];
  for(const value of ['周','日','月']){
   const period=({'周':'week','日':'day','月':'month'})[value];
   const response=page.waitForResponse(r=>r.url().endsWith('/api/query')&&r.request().postDataJSON()?.period===period);
   const start=performance.now();await page.locator('.dc-period-bar').getByText(value,{exact:true}).click();
   await response;
   await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   interactions.push({action:`period-${value}`,clickToSettledMs:performance.now()-start});
  }
  const start=performance.now();await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  await page.locator('.dc-calendar canvas').first().waitFor();
  await page.waitForTimeout(350);
  interactions.push({action:'expand-charts',clickToSettledMs:performance.now()-start});
  const eventTiming=await page.evaluate(()=>window.lab.events);
  assert.deepEqual(errors,[]);
  const entry={cold,timeline,scriptEvents,interactions,eventTiming,errors};report.samples.push(entry);
  console.log(JSON.stringify({sample,jsBytes:cold.resources.reduce((sum,r)=>sum+r.bytes,0),maxLongTask:Math.max(0,...cold.longTasks.map(x=>x.duration)),lcp:cold.lcp,cls:cold.cls,timeline,interactions}));
  await context.close();
 }
 await writeFile(new URL('result.json',output),JSON.stringify(report,null,2));
}finally{await browser.close();}
```
