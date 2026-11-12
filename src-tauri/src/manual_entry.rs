use super::*;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ManualEntryInput {
    pub request_id: String,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
    pub start_time: i64,
    pub end_time: i64,
    pub duration_ms: i64,
}

impl Store {
    pub fn create_manual_entry(&mut self, input: ManualEntryInput) -> Result<i64> {
        if !(16..=80).contains(&input.request_id.len())
            || !input
                .request_id
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
        {
            return Err("补录请求标识无效，请重新打开补记录。".into());
        }
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if !valid_quantity(input.quantity) {
            return Err("请填写 0 到 10 亿之间的有效工作量。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        if input.start_time < 0
            || input.end_time <= input.start_time
            || input.duration_ms < 0
            || input.duration_ms > input.end_time - input.start_time
        {
            return Err("起止时间或有效工时无效；有效工时不能超过起止时间跨度。".into());
        }
        let quantity = if input.quantity == 0.0 {
            0.0
        } else {
            input.quantity
        };
        let fingerprint = serde_json::to_string(&(
            &input.category,
            quantity,
            remark,
            input.start_time,
            input.end_time,
            input.duration_ms,
        ))
        .map_err(|e| format!("补录校验失败：{e}"))?;
        let now = self.clock.now().wall_ms.max(0);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let previous: Option<(Option<i64>, String)> = tx
            .query_row(
                "SELECT record_id,fingerprint FROM manual_entry_requests WHERE request_id=?1",
                [&input.request_id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()
            .map_err(db_error)?;
        if let Some((id, saved)) = previous {
            if saved != fingerprint {
                return Err("该补录请求已保存，内容与本次不同，请刷新明细核对。".into());
            }
            return id.ok_or_else(|| "这条补录已被删除，请重新打开补记录。".into());
        }
        if input.end_time > now {
            return Err("不能补录未来的工作时间。".into());
        }
        // Manually supplied work is a baseline, never a fabricated timer segment.
        tx.execute(
            "INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,
             duration_seconds,status,is_paused,recovery_pending,settlement_status,source,
             confirmed_end_time,end_reason,legacy_duration_ms,control_mode)
             VALUES(?1,?2,?3,?4,?5,?6,?6/1000,'FINISHED',1,0,'COMPLETE','MANUAL_ENTRY',?7,'MANUAL',?6,'MANUAL')",
            params![input.category,quantity,remark,input.start_time,input.end_time,input.duration_ms,now],
        ).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        tx.execute(
            "INSERT INTO manual_entry_requests(request_id,record_id,fingerprint) VALUES(?1,?2,?3)",
            params![input.request_id, id, fingerprint],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(id)
    }
}

#[cfg(test)]
#[path = "manual_entry_tests.rs"]
mod tests;
