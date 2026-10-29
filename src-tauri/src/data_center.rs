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
    value["is_demo"] = row.get::<_, bool>(20)?.into();
    value["demo_batch"] = row.get::<_, Option<String>>(21)?.into();
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
            || !["", "all", "pending", "complete", "working"].contains(&q.status.as_str())
        {
            return Err("数据筛选无效。".into());
        }
        let tx = self.connection.unchecked_transaction().map_err(db_error)?;
        let filter = "(?1='all' OR is_demo=CASE WHEN ?1='demo' THEN 1 ELSE 0 END) AND (?2 IS NULL OR date(start_time/1000,'unixepoch','localtime')>=?2) AND (?3 IS NULL OR date(start_time/1000,'unixepoch','localtime')<=?3) AND (?4 IS NULL OR category=?4) AND (?5='' OR ?5='all' OR (?5='pending' AND settlement_status='PENDING') OR (?5='complete' AND settlement_status='COMPLETE') OR (?5='working' AND status='WORKING'))";
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
        let months = range.period == "custom"
            && first.zip(last).is_some_and(|(a, b)| b - a > 120 * 86400000);
        if months {
            range.trend_unit = "month".into();
        }
        let group = match range.trend_unit.as_str() {
            "hour" => "strftime('%H:00',start_time/1000,'unixepoch','localtime')",
            "month" => "strftime('%Y-%m',start_time/1000,'unixepoch','localtime')",
            _ => "date(start_time/1000,'unixepoch','localtime')",
        };
        let mut trend:Vec<Value>=self.connection.prepare(&format!("SELECT {group} AS period,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*) FROM work_records WHERE {report_filter} GROUP BY period ORDER BY period")).map_err(db_error)?.query_map(args,|r|Ok(json!({"date":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        if range.period != "custom" {
            let mut by_date: std::collections::BTreeMap<String, Value> = trend
                .into_iter()
                .map(|v| (v["date"].as_str().unwrap().to_string(), v))
                .collect();
            trend = range
                .buckets(&self.connection)?
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
