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
