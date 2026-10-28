use super::{COLUMNS, Result, Store, WorkRecord, db_error, read_record, valid_quantity};
use rusqlite::params;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SettleInput {
    pub id: i64,
    pub expected_revision: i64,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
}

impl Store {
    pub fn pending_records(&self) -> Result<Vec<WorkRecord>> {
        let mut statement = self.connection.prepare(&format!(
            "SELECT {COLUMNS} FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING' AND is_demo=0 ORDER BY id"
        )).map_err(db_error)?;
        statement
            .query_map([], read_record)
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)
    }

    pub fn settle(&mut self, input: SettleInput) -> Result<()> {
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
        let before = self.record(input.id)?;
        if before.status != "FINISHED" {
            return Err("请先结束计时，再保存结算信息。".into());
        }
        // Repeating a successful request is safe; stale edits with different data are rejected.
        if before.settlement_status == "COMPLETE"
            && before.category == input.category
            && before.quantity == Some(input.quantity)
            && before.remark == remark
        {
            return Ok(());
        }
        if before.revision != input.expected_revision {
            return Err("记录已被修改，请重新读取后保存。".into());
        }
        let mut after = before.clone();
        after.category = input.category;
        after.quantity = Some(input.quantity);
        after.remark = remark.into();
        after.settlement_status = "COMPLETE".into();
        after.revision = before.revision.checked_add(1).ok_or("修订次数超出范围。")?;
        let before_json =
            serde_json::to_string(&before).map_err(|e| format!("无法保存原始记录：{e}"))?;
        let after_json =
            serde_json::to_string(&after).map_err(|e| format!("无法保存修订记录：{e}"))?;
        let changed_at = self.clock.now().wall_ms.max(0);
        let tx = self.connection.transaction().map_err(db_error)?;
        let changed = tx.execute("UPDATE work_records SET category=?1,quantity=?2,remark=?3,settlement_status='COMPLETE',revision=?4
            WHERE id=?5 AND status='FINISHED' AND revision=?6",
            params![after.category,after.quantity,after.remark,after.revision,input.id,before.revision]).map_err(db_error)?;
        if changed != 1 {
            return Err("记录状态已变化，请重新读取后保存。".into());
        }
        tx.execute("INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(?1,?2,?3,?4,?5)",
            params![input.id,after.revision,changed_at,before_json,after_json]).map_err(db_error)?;
        tx.execute(
            "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
            [input.id],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(())
    }
}
