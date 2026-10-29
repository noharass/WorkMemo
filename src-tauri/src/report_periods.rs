use super::*;

#[derive(Debug, Serialize)]
pub struct ReportRange {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub trend_unit: String,
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
        })
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
