//! Stable category identities stay in records and URL rules; names are metadata.
use super::*;
use std::collections::{BTreeMap, HashSet};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct CategoryNames {
    pub revision: i64,
    pub names: BTreeMap<String, String>,
}

impl CategoryNames {
    pub fn validate(&self) -> Result<()> {
        if self.revision < 0 || self.names.len() != 4 {
            return Err("工作类别配置不完整。".into());
        }
        let mut seen = HashSet::new();
        for key in crate::presentation::CATEGORIES {
            let name = self.names.get(key).ok_or("工作类别配置不完整。")?;
            if name.is_empty()
                || name.chars().count() > 20
                || name.chars().any(char::is_control)
                || name.trim() != name
                || !seen.insert(name.to_lowercase())
            {
                return Err("工作名称须为 1 至 20 个字符，不能重复或含控制字符。".into());
            }
        }
        Ok(())
    }
}

impl Store {
    pub fn category_names(&self) -> Result<CategoryNames> {
        let mut stmt = self
            .connection
            .prepare("SELECT category,display_name,revision FROM category_names")
            .map_err(db_error)?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                ))
            })
            .map_err(db_error)?;
        let mut names = BTreeMap::new();
        let mut revision = None;
        for row in rows {
            let (key, name, rev) = row.map_err(db_error)?;
            if revision.is_some_and(|old| old != rev) {
                return Err("工作名称版本不一致，未覆盖配置。".into());
            }
            revision = Some(rev);
            names.insert(key, name);
        }
        let result = CategoryNames {
            revision: revision.unwrap_or(0),
            names,
        };
        result.validate()?;
        Ok(result)
    }

    pub fn save_category_names(&mut self, mut input: CategoryNames) -> Result<CategoryNames> {
        for name in input.names.values_mut() {
            *name = name.trim().to_string();
        }
        input.validate()?;
        let current = self.category_names()?;
        if input.revision != current.revision {
            return Err("工作名称已被其他窗口修改，请重新读取后保存。".into());
        }
        if input.names == current.names {
            return Ok(current);
        }
        input.revision = input
            .revision
            .checked_add(1)
            .ok_or("工作名称版本超出范围。")?;
        let tx = self.connection.transaction().map_err(db_error)?;
        // Reserve names outside the user-input alphabet to support name swaps.
        tx.execute(
            "UPDATE category_names SET display_name=category||char(1)",
            [],
        )
        .map_err(db_error)?;
        for (key, name) in &input.names {
            tx.execute(
                "UPDATE category_names SET display_name=?1,revision=?2 WHERE category=?3",
                params![name, input.revision, key],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(input)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};

    fn memory() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn schema_eight(c: &Connection) {
        for sql in [
            include_str!("../migrations/001_initial.sql"),
            include_str!("../migrations/002_settlement.sql"),
            include_str!("../migrations/003_monitoring.sql"),
            include_str!("../migrations/004_tracking_times.sql"),
            include_str!("../migrations/005_monitor_options.sql"),
            include_str!("../migrations/006_import_sources.sql"),
            include_str!("../migrations/007_dashboard_intent.sql"),
            include_str!("../migrations/008_url_matching.sql"),
        ] {
            c.execute_batch(sql).unwrap();
        }
        c.execute_batch("PRAGMA user_version=8;").unwrap();
    }

    #[test]
    fn rename_trims_supports_swaps_and_preserves_records_rules_and_visual_identity() {
        let mut store = memory();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: Some(0.5),
                remark: "保留".into(),
            })
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO work_urls(url_prefix,category) VALUES('https://example.test/','开发')",
                [],
            )
            .unwrap();
        let before = serde_json::to_value(store.active().unwrap()).unwrap();
        let mut config = store.category_names().unwrap();
        config.names.insert("评测".into(), "质检".into());
        config.names.insert("质检".into(), "评测".into());
        config.names.insert("开发".into(), "  编程开发  ".into());
        let saved = store.save_category_names(config).unwrap();
        assert_eq!(saved.revision, 1);
        assert_eq!(saved.names["开发"], "编程开发");
        assert_eq!(
            serde_json::to_value(store.active().unwrap()).unwrap(),
            before
        );
        assert_eq!(store.monitor_config().unwrap().rules[0].category, "开发");
        assert_eq!(
            store.save_category_names(saved.clone()).unwrap().revision,
            1
        );
        assert_eq!(store.category_names().unwrap(), saved);
    }

    #[test]
    fn invalid_and_stale_names_never_replace_saved_config() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        for invalid in [
            "",
            " \t ",
            "质检",
            "a\nb",
            "abcdefghijklmnopqrstu",
            "零\0字",
        ] {
            let mut input = initial.clone();
            input.names.insert("开发".into(), invalid.into());
            assert!(store.save_category_names(input).is_err(), "{invalid:?}");
            assert_eq!(store.category_names().unwrap(), initial);
        }
        let mut missing = initial.clone();
        missing.names.remove("文档");
        assert!(store.save_category_names(missing).is_err());
        let mut extra = initial.clone();
        extra.names.insert("未知".into(), "新类型".into());
        assert!(store.save_category_names(extra).is_err());
        let mut changed = initial.clone();
        changed.names.insert("开发".into(), "程序".into());
        store.save_category_names(changed).unwrap();
        assert!(store.save_category_names(initial).is_err());
        let mut duplicate = store.category_names().unwrap();
        duplicate.names.insert("开发".into(), "code".into());
        duplicate.names.insert("文档".into(), "CODE".into());
        assert!(store.save_category_names(duplicate).is_err());
    }

    #[test]
    fn failed_name_transaction_rolls_back_temporary_names_and_revision() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        let mut input = initial.clone();
        input.names.insert("开发".into(), "新名字".into());
        store.connection.execute_batch("CREATE TRIGGER fail_names BEFORE UPDATE ON category_names WHEN NEW.display_name='新名字' BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.save_category_names(input).is_err());
        assert_eq!(store.category_names().unwrap(), initial);
    }

    #[test]
    fn eight_to_nine_preserves_children_high_water_mark_and_existing_settings() {
        let c = Connection::open_in_memory().unwrap();
        schema_eight(&c);
        c.execute_batch("INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(7,'文档',0.25,'历史',1000,2250,1250,1,'FINISHED',1,'COMPLETE');
            INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(7,1000,2250,2250,1250,'CLOSED');
            INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(7,1,3000,'{}','{}');
            INSERT INTO end_reminders VALUES(7,1);
            INSERT INTO work_urls(id,url_prefix,category,match_mode) VALUES(9,'example.test','文档','domain_suffix');
            UPDATE sqlite_sequence SET seq=99 WHERE name='work_records';
            UPDATE monitoring_settings SET idle_warning_seconds=12,idle_end_seconds=23,hold_seconds=55,revision=17;").unwrap();
        let mut store = Store::initialize(c, Box::new(TestClock::new()), None).unwrap();
        assert_eq!(store.record(7).unwrap().duration_ms, 1250);
        assert_eq!(store.record(7).unwrap().quantity, Some(0.25));
        assert_eq!(store.record(7).unwrap().remark, "历史");
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                1
            );
        }
        assert_eq!(store.monitor_config().unwrap().times.idle_pause_seconds, 22);
        assert_eq!(store.monitor_config().unwrap().times.hold_seconds, 55);
        assert_eq!(store.monitor_config().unwrap().revision, 17);
        assert_eq!(store.monitor_config().unwrap().rules[0].id, 9);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "foreign_keys", |r| r.get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            store
                .connection
                .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "ok"
        );
        store.delete_record(7).unwrap();
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                0
            );
        }
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        assert_eq!(store.active().unwrap().unwrap().id, 100);
    }

    #[test]
    fn migration_failure_rolls_back_rebuild_and_user_version() {
        let d = TestDirectory::new();
        let c = Connection::open(d.db()).unwrap();
        schema_eight(&c);
        // An invalid reference must be detected without deleting the original child.
        c.pragma_update(None, "foreign_keys", false).unwrap();
        c.execute_batch("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state) VALUES(999,0,0,'OPEN');").unwrap();
        drop(c);
        assert!(Store::open(&d.db(), Box::new(TestClock::new())).is_err());
        let c = Connection::open(d.db()).unwrap();
        assert_eq!(
            c.pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            8
        );
        assert_eq!(
            c.query_row("SELECT COUNT(*) FROM work_segments", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(c.query_row("SELECT COUNT(*) FROM sqlite_master WHERE name IN ('category_names','work_records_v9')", [], |r| r.get::<_,i64>(0)).unwrap(), 0);
        assert!(
            c.prepare("SELECT idle_pause_seconds FROM monitoring_settings")
                .is_err()
        );
    }

    #[test]
    fn names_persist_across_restart_without_rerunning_migration() {
        let d = TestDirectory::new();
        let saved = {
            let mut store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
            let mut input = store.category_names().unwrap();
            input.names.insert("开发".into(), "自定义开发".into());
            store.save_category_names(input).unwrap()
        };
        let store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
        assert_eq!(store.category_names().unwrap(), saved);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            9
        );
    }
}
