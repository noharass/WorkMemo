use super::*;
use crate::{
    clock::SystemClock,
    service::{self, Backend},
};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf};
use tauri::{Emitter, Manager};
const FILES: [&str; 4] = [
    "appearance.json",
    "window-layout.json",
    "island.json",
    "presentation.json",
];
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Archive {
    version: u32,
    database: Vec<u8>,
    settings: BTreeMap<String, Vec<u8>>,
}
#[derive(Serialize, Default)]
pub struct ImportReport {
    pub source: Option<String>,
    pub conflict_ids: Vec<i64>,
    pub skipped_active_ids: Vec<i64>,
    pub records: usize,
    pub pending: usize,
    pub active: usize,
    pub imported: usize,
    pub duplicates: usize,
    pub conflicts: usize,
    pub skipped_active: usize,
    pub backup: Option<String>,
}
struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(self.0.with_extension("lock"));
        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{suffix}", self.0.display()));
        }
    }
}
fn scratch(dir: &Path) -> Result<Scratch> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    Ok(Scratch(dir.join(format!(
        "snapshot-{}-{n}.sqlite3",
        std::process::id()
    ))))
}
fn configs(dir: &Path) -> Result<BTreeMap<String, Vec<u8>>> {
    let mut m = BTreeMap::new();
    for name in FILES {
        match std::fs::read(dir.join(name)) {
            Ok(b) => {
                m.insert(name.into(), b);
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    if let Some(bytes) = m.get("presentation.json") {
        let p: crate::presentation::Presentation =
            serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
        p.validate()?;
        if let Some(bg) = p.background {
            let bytes =
                std::fs::read(dir.join("backgrounds").join(&bg.file)).map_err(|e| e.to_string())?;
            m.insert(format!("backgrounds/{}", bg.file), bytes);
        }
    }
    Ok(m)
}
fn validate_settings(settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    for (name, b) in settings {
        if let Some(file) = name.strip_prefix("backgrounds/") {
            if !crate::presentation::image_name(file) {
                return Err("备份图片路径无效".into());
            }
            crate::presentation::validate_image(b)?;
            continue;
        }
        if !FILES.contains(&name.as_str()) || b.len() > 65536 {
            return Err("备份设置无效。".into());
        }
        let v: serde_json::Value = serde_json::from_slice(b).map_err(|e| e.to_string())?;
        match name.as_str() {
            "presentation.json" => {
                let p: crate::presentation::Presentation =
                    serde_json::from_slice(b).map_err(|e| e.to_string())?;
                p.validate()?;
                if let Some(bg) = p.background {
                    if !settings.contains_key(&format!("backgrounds/{}", bg.file)) {
                        return Err("备份缺少背景图片".into());
                    }
                }
            }
            "appearance.json" => {
                let a: crate::appearance::Appearance =
                    serde_json::from_value(v).map_err(|e| e.to_string())?;
                if ![1, 2].contains(&a.version) || !(80..=100).contains(&a.opacity) {
                    return Err("备份外观无效。".into());
                }
            }
            "island.json" => {
                crate::desktop::validate_island(b)?;
            }
            "window-layout.json" => {
                crate::windows::decode_layout(b)?;
                if !["compact", "comfortable"].contains(&v["density"].as_str().unwrap_or("")) {
                    return Err("备份布局无效。".into());
                }
            }
            _ => unreachable!(),
        }
    }
    Ok(())
}
fn write_configs(dir: &Path, settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    validate_settings(settings)?;
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    for (name, bytes) in settings
        .iter()
        .filter(|(n, _)| n.starts_with("backgrounds/"))
    {
        let path = dir.join(name);
        std::fs::create_dir_all(path.parent().ok_or("图片目录无效")?).map_err(|e| e.to_string())?;
        let pending = path.with_extension("restore-pending");
        std::fs::write(&pending, bytes).map_err(|e| e.to_string())?;
        std::fs::rename(pending, path).map_err(|e| e.to_string())?;
    }
    for name in FILES {
        let path = dir.join(name);
        if let Some(b) = settings.get(name) {
            let temp = path.with_extension("restore-pending");
            std::fs::write(&temp, b).map_err(|e| e.to_string())?;
            std::fs::rename(temp, path).map_err(|e| e.to_string())?;
        } else if path.exists() {
            std::fs::remove_file(path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
impl Store {
    fn archive(&mut self, dir: &Path) -> Result<Archive> {
        self.checkpoint()?;
        let t = scratch(dir)?;
        self.connection
            .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
            .map_err(db_error)?;
        Ok(Archive {
            version: 2,
            database: std::fs::read(&t.0).map_err(|e| e.to_string())?,
            settings: configs(dir)?,
        })
    }
    fn apply_image(&mut self, image: &Path) -> Result<()> {
        self.connection
            .execute(
                "ATTACH DATABASE ?1 AS restore_source",
                [image.to_string_lossy().as_ref()],
            )
            .map_err(db_error)?;
        let result = (|| {
            let tx = self
                .connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(db_error)?;
            let tables = [
                "import_sources",
                "end_reminders",
                "record_revisions",
                "work_segments",
                "work_urls",
                "monitoring_settings",
                "work_records",
            ];
            for table in tables {
                tx.execute(&format!("DELETE FROM main.{table}"), [])
                    .map_err(db_error)?;
            }
            for table in tables.into_iter().rev() {
                tx.execute(
                    &format!("INSERT INTO main.{table} SELECT * FROM restore_source.{table}"),
                    [],
                )
                .map_err(db_error)?;
            }
            tx.execute("DELETE FROM main.sqlite_sequence", [])
                .map_err(db_error)?;
            tx.execute(
                "INSERT INTO main.sqlite_sequence SELECT * FROM restore_source.sqlite_sequence",
                [],
            )
            .map_err(db_error)?;
            let invalid: Option<String> = tx
                .query_row(
                    "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
                    [],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if invalid.is_some() {
                return Err("备份关联数据无效。".into());
            }
            tx.commit().map_err(db_error)
        })();
        let _ = self
            .connection
            .execute("DETACH DATABASE restore_source", []);
        result?;
        self.segment = None;
        self.monitor = Runtime::default();
        self.monitor.config = self.monitor_config()?;
        self.activate_monitoring();
        Ok(())
    }
}
fn read_archive(path: &Path) -> Result<Archive> {
    if std::fs::metadata(path).map_err(|e| e.to_string())?.len() > 256 * 1024 * 1024 {
        return Err("备份文件超过256MB限制。".into());
    }
    let a: Archive = serde_json::from_slice(&std::fs::read(path).map_err(|e| e.to_string())?)
        .map_err(|_| "备份格式无效。")?;
    if ![1, 2].contains(&a.version) || a.database.len() > 128 * 1024 * 1024 {
        return Err("备份版本或大小不受支持。".into());
    }
    validate_settings(&a.settings)?;
    Ok(a)
}
fn checked_image(a: &Archive, dir: &Path) -> Result<Scratch> {
    let t = scratch(dir)?;
    std::fs::write(&t.0, &a.database).map_err(|e| e.to_string())?;
    let c = Connection::open(&t.0).map_err(db_error)?;
    let ok: String = c
        .query_row("PRAGMA integrity_check", [], |r| r.get(0))
        .map_err(db_error)?;
    if ok != "ok" {
        return Err("备份数据库损坏。".into());
    }
    let store = Store::initialize(c, Box::new(SystemClock::new()), None)?;
    let invalid: Option<String> = store
        .connection
        .query_row(
            "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
            [],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if invalid.is_some() {
        return Err("备份外键校验失败。".into());
    }
    store.monitor_config()?;
    for record in store
        .connection
        .prepare(&format!("SELECT {COLUMNS} FROM work_records"))
        .map_err(db_error)?
        .query_map([], read_record)
        .map_err(db_error)?
    {
        record.map_err(db_error)?;
    }
    drop(store);
    Ok(t)
}
fn save_archive(path: &Path, a: &Archive) -> Result<()> {
    let parent = path.parent().ok_or("备份路径无效")?;
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let t = path.with_extension("workmemo-pending");
    let mut f = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&t)
        .map_err(|e| e.to_string())?;
    use std::io::Write;
    let result = (|| {
        serde_json::to_writer(&mut f, a).map_err(|e| e.to_string())?;
        f.flush()
            .and_then(|_| f.sync_all())
            .map_err(|e| e.to_string())
    })();
    drop(f);
    if result.is_err() {
        let _ = std::fs::remove_file(&t);
        return result;
    }
    std::fs::rename(t, path).map_err(|e| e.to_string())
}
fn automatic_backup(store: &mut Store, dir: &Path) -> Result<PathBuf> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    let path = dir
        .join("backups")
        .join(format!("before-change-{n}.workmemo"));
    save_archive(&path, &store.archive(dir)?)?;
    Ok(path)
}
// A durable rollback journal precedes every restore. Startup restores the old
// snapshot if a process stops between file writes and the SQLite commit.
pub fn recover_pending(store: &mut Store, dir: &Path) -> Result<()> {
    let p = dir.join("restore-journal.workmemo");
    if p.exists() {
        let a = read_archive(&p)?;
        let image = checked_image(&a, dir)?;
        store.apply_image(&image.0)?;
        write_configs(dir, &a.settings)?;
        std::fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}
pub struct ArchiveSelection(pub std::sync::Mutex<Option<Archive>>);
#[tauri::command]
pub async fn inspect_backup(app: tauri::AppHandle) -> Result<Option<ImportReport>> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(false)? else {
            return Ok(None);
        };
        let a = read_archive(&path)?;
        let image = checked_image(&a, &dir)?;
        let source = Store::open(&image.0, Box::new(SystemClock::new()))?;
        let mut r = report(&source)?;
        r.backup = Some(path.display().to_string());
        *app.state::<ArchiveSelection>()
            .0
            .lock()
            .map_err(|_| "备份选择锁异常")? = Some(a);
        Ok(Some(r))
    })
    .await
    .map_err(|e| e.to_string())?
}
fn native_file(save: bool) -> Result<Option<PathBuf>> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::Controls::Dialogs::*;
        let mut file = vec![0u16; 32768];
        let filter: Vec<u16> = "WorkMemo Backup\0*.workmemo\0\0".encode_utf16().collect();
        let extension: Vec<u16> = "workmemo\0".encode_utf16().collect();
        let mut ofn: OPENFILENAMEW = unsafe { std::mem::zeroed() };
        ofn.lStructSize = std::mem::size_of::<OPENFILENAMEW>() as u32;
        ofn.lpstrFile = file.as_mut_ptr();
        ofn.nMaxFile = file.len() as u32;
        ofn.lpstrFilter = filter.as_ptr();
        ofn.lpstrDefExt = extension.as_ptr();
        ofn.Flags = OFN_EXPLORER
            | OFN_NOCHANGEDIR
            | if save {
                OFN_OVERWRITEPROMPT
            } else {
                OFN_FILEMUSTEXIST
            };
        let ok = unsafe {
            if save {
                GetSaveFileNameW(&mut ofn)
            } else {
                GetOpenFileNameW(&mut ofn)
            }
        };
        if ok == 0 {
            let e = unsafe { CommDlgExtendedError() };
            return if e == 0 {
                Ok(None)
            } else {
                Err(format!("文件选择失败：{e}"))
            };
        }
        let n = file.iter().position(|c| *c == 0).ok_or("路径无效")?;
        Ok(Some(PathBuf::from(
            String::from_utf16(&file[..n]).map_err(|e| e.to_string())?,
        )))
    }
    #[cfg(not(windows))]
    {
        let _ = save;
        Err("文件选择目前仅支持Windows。".into())
    }
}
fn config_dir(app: &tauri::AppHandle) -> Result<PathBuf> {
    {
        let d = app.path().app_config_dir().map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
        Ok(d)
    }
}
#[tauri::command]
pub async fn create_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    let dir = config_dir(&app)?;
    let shared = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(true)? else {
            return Ok(None);
        };
        let mut guard = shared.lock().map_err(|_| "数据锁异常")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        save_archive(&path, &store.archive(&dir)?)?;
        Ok(Some(path.display().to_string()))
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn restore_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    if app
        .state::<crate::windows::WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态异常")?
        .iter()
        .any(|(k, v)| k != "settings" && *v)
    {
        return Err("请先保存或放弃其他窗口中的修改，再恢复。".into());
    }
    let selected = app
        .state::<ArchiveSelection>()
        .0
        .lock()
        .map_err(|_| "备份选择锁异常")?
        .take()
        .ok_or("请先选择并校验备份。")?;
    let dir = config_dir(&app)?;
    let handle = app.clone();
    let result = service::access(state.inner.clone(), move |store| {
        if store.active()?.is_some_and(|r| !r.is_paused) {
            return Err("请先暂停当前计时，再恢复备份。".into());
        }
        let a = selected;
        let image = checked_image(&a, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let journal = dir.join("restore-journal.workmemo");
        save_archive(&journal, &store.archive(&dir)?)?;
        let result = write_configs(&dir, &a.settings).and_then(|_| store.apply_image(&image.0));
        if let Err(e) = result {
            recover_pending(store, &dir)?;
            return Err(format!("恢复失败，已回滚：{e}"));
        }
        std::fs::remove_file(journal).map_err(|e| e.to_string())?;
        Ok(Some(format!(
            "已恢复；原数据备份：{}。请重新打开设置以加载恢复后的界面设置。",
            backup.display()
        )))
    })
    .await;
    if matches!(result, Ok(Some(_))) {
        crate::windows::reload(&handle)?;
        crate::desktop::reload_island(&handle)?;
        let _ = handle.emit("workmemo:layout-changed", ());
        let _ = handle.emit("workmemo:data-changed", ());
        let _ = handle.emit("workmemo:appearance-changed", ());
        let _ = handle.emit("workmemo:presentation-changed", ());
    }
    result
}
fn preview_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    #[cfg(debug_assertions)]
    if app.config().identifier.starts_with("com.workmemo.test.")
        && app.config().identifier != "com.workmemo.test.monitor"
    {
        // Debug QA profiles never inspect the user's actual preview records.
        return Ok(dir
            .parent()
            .ok_or("数据目录无效")?
            .join(format!("{}.migration-source", app.config().identifier))
            .join("workmemo.sqlite3"));
    }
    Ok(dir
        .parent()
        .ok_or("数据目录无效")?
        .join("com.workmemo.test.monitor")
        .join("workmemo.sqlite3"))
}
fn preview_copy(path: &Path, dir: &Path) -> Result<(Store, Scratch, File)> {
    if !path.is_file() {
        return Err("未发现预览数据。".into());
    }
    #[cfg(windows)]
    let lock = {
        use std::os::windows::fs::OpenOptionsExt;
        std::fs::OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .share_mode(0)
            .open(path.with_extension("lock"))
            .map_err(|_| "请从托盘退出预览程序后再迁移。")?
    };
    #[cfg(not(windows))]
    let lock = File::open(path).map_err(|e| e.to_string())?;
    let source = Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
        .map_err(db_error)?;
    let t = scratch(dir)?;
    source
        .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
        .map_err(db_error)?;
    let store = Store::initialize(
        Connection::open(&t.0).map_err(db_error)?,
        Box::new(SystemClock::new()),
        None,
    )?;
    Ok((store, t, lock))
}
fn report(source: &Store) -> Result<ImportReport> {
    let (records,pending,active)=source.connection.query_row("SELECT COUNT(*),COALESCE(SUM(settlement_status='PENDING'),0),COALESCE(SUM(status='WORKING'),0) FROM work_records",[],|r|Ok((r.get::<_,i64>(0)? as usize,r.get::<_,i64>(1)? as usize,r.get::<_,i64>(2)? as usize))).map_err(db_error)?;
    Ok(ImportReport {
        records,
        pending,
        active,
        ..Default::default()
    })
}
fn fingerprint(source: &Store, id: i64) -> Result<String> {
    let record = serde_json::to_value(source.record(id)?).map_err(|e| e.to_string())?;
    let segments:Vec<String>=source.connection.prepare("SELECT printf('%lld:%lld:%lld:%lld:%s',start_time,COALESCE(end_time,0),checkpoint_time,duration_ms,state) FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    let revisions:Vec<String>=source.connection.prepare("SELECT before_json||after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    serde_json::to_string(&(record, segments, revisions)).map_err(|e| e.to_string())
}
fn copy_row(
    tx: &rusqlite::Transaction,
    source: &Connection,
    table: &str,
    source_id: i64,
    new_parent: Option<i64>,
) -> Result<i64> {
    let cols: Vec<String> = source
        .prepare(&format!("PRAGMA table_info({table})"))
        .map_err(db_error)?
        .query_map([], |r| r.get(1))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let mut vals: Vec<rusqlite::types::Value> = source
        .query_row(
            &format!("SELECT {} FROM {table} WHERE id=?1", cols.join(",")),
            [source_id],
            |r| (0..cols.len()).map(|i| r.get(i)).collect(),
        )
        .map_err(db_error)?;
    vals[0] = rusqlite::types::Value::Null;
    if let Some(parent) = new_parent {
        if let Some(i) = cols.iter().position(|n| n == "record_id") {
            vals[i] = parent.into();
        }
        if table == "record_revisions" {
            for field in ["before_json", "after_json"] {
                let i = cols
                    .iter()
                    .position(|n| n == field)
                    .ok_or("修正记录格式无效")?;
                if let rusqlite::types::Value::Text(text) = &vals[i] {
                    let mut json: serde_json::Value =
                        serde_json::from_str(text).map_err(|e| e.to_string())?;
                    if let Some(id) = json.get_mut("id") {
                        *id = parent.into();
                    }
                    vals[i] = serde_json::to_string(&json)
                        .map_err(|e| e.to_string())?
                        .into();
                }
            }
        }
    }
    let marks = vec!["?"; cols.len()].join(",");
    tx.execute(
        &format!("INSERT INTO {table}({}) VALUES({marks})", cols.join(",")),
        rusqlite::params_from_iter(vals),
    )
    .map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}
#[cfg(test)]
fn merge(target: &mut Store, source: &Store) -> Result<ImportReport> {
    merge_options(target, source, false)
}
fn merge_options(target: &mut Store, source: &Store, include_config: bool) -> Result<ImportReport> {
    if include_config && target.active()?.is_some() {
        return Err("当前有未结束任务，请先只迁移记录；监测配置需在任务处理后导入。".into());
    }
    let config = if include_config {
        Some(source.monitor_config()?)
    } else {
        None
    };
    let mut r = report(source)?;
    let active = target.active()?.is_some();
    let ids: Vec<i64> = source
        .connection
        .prepare("SELECT id FROM work_records ORDER BY id")
        .map_err(db_error)?
        .query_map([], |r| r.get(0))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let tx = target
        .connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(db_error)?;
    for id in ids {
        let record = source.record(id)?;
        let key = format!("preview:{id}:{}", record.start_time);
        let fp = fingerprint(source, id)?;
        let previous: Option<String> = tx
            .query_row(
                "SELECT fingerprint FROM import_sources WHERE source_key=?1",
                [&key],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if let Some(old) = previous {
            if old == fp {
                r.duplicates += 1
            } else {
                r.conflicts += 1;
                r.conflict_ids.push(id);
            }
            continue;
        }
        if active && record.status == "WORKING" {
            r.skipped_active += 1;
            r.skipped_active_ids.push(id);
            continue;
        }
        let new_id = copy_row(&tx, &source.connection, "work_records", id, None)?;
        for table in ["work_segments", "record_revisions"] {
            let children: Vec<i64> = source
                .connection
                .prepare(&format!(
                    "SELECT id FROM {table} WHERE record_id=?1 ORDER BY id"
                ))
                .map_err(db_error)?
                .query_map([id], |r| r.get(0))
                .map_err(db_error)?
                .collect::<rusqlite::Result<_>>()
                .map_err(db_error)?;
            for child in children {
                copy_row(&tx, &source.connection, table, child, Some(new_id))?;
            }
        }
        if record.status == "FINISHED" && record.settlement_status == "PENDING" {
            tx.execute(
                "INSERT INTO end_reminders(record_id,dismissed) VALUES(?1,1)",
                [new_id],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "INSERT INTO import_sources VALUES(?1,?2,?3)",
            params![key, new_id, fp],
        )
        .map_err(db_error)?;
        r.imported += 1;
    }
    if let Some(c) = config {
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for rule in c.rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
                params![rule.url_prefix, rule.category, rule.match_mode],
            )
            .map_err(db_error)?;
        }
        tx.execute("UPDATE monitoring_settings SET enabled=0,revision=revision+1,idle_warning_seconds=?1,idle_end_seconds=?2,away_pause_seconds=?3,hold_seconds=?4,poll_interval_seconds=?5,auto_resume_manual=?6,browsing_only=?7 WHERE id=1",params![c.times.idle_warning_seconds,c.times.idle_end_seconds,c.times.away_pause_seconds,c.times.hold_seconds,c.poll_interval_seconds,c.auto_resume_manual,c.browsing_only]).map_err(db_error)?;
    }
    tx.commit().map_err(db_error)?;
    target.monitor.config = target.monitor_config()?;
    if include_config {
        target.monitor.page = None;
        target.monitor.entered_at = None;
        target.monitor.page_was_matched = false;
    }
    Ok(r)
}
#[tauri::command]
pub async fn preview_migration(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<ImportReport>> {
    let path = preview_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let dir = config_dir(&app)?;
    service::access(state.inner.clone(), move |_| {
        let (s, _t, _lock) = preview_copy(&path, &dir)?;
        let mut r = report(&s)?;
        r.source = Some(path.display().to_string());
        Ok(Some(r))
    })
    .await
}
#[tauri::command]
pub async fn import_preview(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
    include_config: bool,
) -> Result<ImportReport> {
    let path = preview_path(&app)?;
    let dir = config_dir(&app)?;
    let result = service::access(state.inner.clone(), move |store| {
        let (source, _temp, _lock) = preview_copy(&path, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let mut r = merge_options(store, &source, include_config)?;
        r.source = Some(path.display().to_string());
        r.backup = Some(backup.display().to_string());
        Ok(r)
    })
    .await;
    if result.is_ok() {
        let _ = app.emit("workmemo:data-changed", ());
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};
    #[test]
    fn merge_is_idempotent_conflicts_do_not_replace_and_restore_rolls_back() {
        let mut a = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let mut b = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        a.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "original".into(),
        })
        .unwrap();
        a.finish(1).unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().imported, 1);
        assert_eq!(merge(&mut b, &a).unwrap().duplicates, 1);
        a.connection
            .execute("UPDATE work_records SET remark='changed' WHERE id=1", [])
            .unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().conflicts, 1);
        assert_eq!(b.record(1).unwrap().remark, "original");
        let d = TestDirectory::new();
        let archive = b.archive(d.db().parent().unwrap()).unwrap();
        let image = checked_image(&archive, d.db().parent().unwrap()).unwrap();
        b.connection
            .execute("UPDATE work_records SET remark='temporary' WHERE id=1", [])
            .unwrap();
        b.apply_image(&image.0).unwrap();
        assert_eq!(b.record(1).unwrap().remark, "original");
    }
    #[test]
    fn legacy_schema_backup_and_new_rule_modes_restore() {
        let d = TestDirectory::new();
        let dir = d.db().parent().unwrap().to_path_buf();
        let mut source = empty();
        source.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode) VALUES('cn-beijing-vpc.fcapp.run','开发','domain_suffix')",[]).unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        let mut target = empty();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "domain_suffix"
        );
        source.connection.execute_batch("DELETE FROM work_urls; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; INSERT INTO work_urls(url_prefix,category) VALUES('https://example.com/','开发'); PRAGMA user_version=7;").unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "path_prefix"
        );
    }
    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn start(s: &mut Store) {
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "test".into(),
        })
        .unwrap();
    }
    #[test]
    fn active_conflicts_preserve_both_tasks_but_import_finished() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        start(&mut source);
        source.pause(2).unwrap();
        let mut target = empty();
        start(&mut target);
        target.pause(1).unwrap();
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.imported, 1);
        assert_eq!(r.skipped_active_ids, vec![2]);
        assert_eq!(target.active().unwrap().unwrap().id, 1);
        assert!(source.active().unwrap().is_some());
    }
    #[test]
    fn id_collisions_remap_segments_and_audit_without_changing_times() {
        let clock = TestClock::new();
        let mut source = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        start(&mut source);
        clock.advance(12345);
        source.finish(1).unwrap();
        let before = source.record(1).unwrap();
        source
            .settle(SettleInput {
                id: 1,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 3.5,
                remark: "corrected".into(),
            })
            .unwrap();
        let original = source.record(1).unwrap();
        let mut target = empty();
        start(&mut target);
        target.finish(1).unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().imported, 1);
        let imported = target.record(2).unwrap();
        assert_eq!(imported.duration_ms, original.duration_ms);
        assert_eq!(imported.end_time, original.end_time);
        assert_eq!(imported.confirmed_end_time, original.confirmed_end_time);
        assert_eq!(imported.quantity, Some(3.5));
        let (parent, duration): (i64, i64) = target
            .connection
            .query_row(
                "SELECT record_id,duration_ms FROM work_segments WHERE record_id=2",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .unwrap();
        assert_eq!((parent, duration), (2, 12345));
        let (parent, before, after): (i64, String, String) = target
            .connection
            .query_row(
                "SELECT record_id,before_json,after_json FROM record_revisions",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .unwrap();
        assert_eq!(parent, 2);
        let before: serde_json::Value = serde_json::from_str(&before).unwrap();
        let after: serde_json::Value = serde_json::from_str(&after).unwrap();
        assert_eq!(before["id"], 2);
        assert_eq!(after["id"], 2);
        assert_eq!(after["remark"], "corrected");
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.duplicates, 1);
        source
            .connection
            .execute(
                "UPDATE work_records SET remark='changed again' WHERE id=1",
                [],
            )
            .unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().conflict_ids, vec![1]);
    }
    #[test]
    fn unfinished_preview_is_imported_as_recovery_without_downtime() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut source = empty();
        start(&mut source);
        let archive = source.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        let recovered = Store::open(&image.0, Box::new(SystemClock::new())).unwrap();
        let mut target = empty();
        assert_eq!(merge(&mut target, &recovered).unwrap().imported, 1);
        let task = target.active().unwrap().unwrap();
        assert!(task.is_paused && task.recovery_pending);
        assert_eq!(task.duration_ms, 0);
        assert!(!source.active().unwrap().unwrap().is_paused);
    }
    #[test]
    fn migration_preserves_config_by_default_and_imports_options_only_when_requested() {
        let source = empty();
        source.connection.execute("UPDATE monitoring_settings SET poll_interval_seconds=5,auto_resume_manual=0,enabled=1",[]).unwrap();
        let mut target = empty();
        merge(&mut target, &source).unwrap();
        assert_eq!(target.monitor_config().unwrap().poll_interval_seconds, 1);
        merge_options(&mut target, &source, true).unwrap();
        let config = target.monitor_config().unwrap();
        assert_eq!(config.poll_interval_seconds, 5);
        assert!(!config.auto_resume_manual);
        assert!(!config.enabled);
        start(&mut target);
        assert!(merge_options(&mut target, &source, true).is_err());
        assert!(target.active().unwrap().is_some());
    }
    #[test]
    fn migration_failure_rolls_back_all_imported_rows() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        let mut target = empty();
        target.connection.execute_batch("CREATE TRIGGER refuse_import BEFORE INSERT ON import_sources BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(merge(&mut target, &source).is_err());
        assert_eq!(
            target
                .connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            0
        );
    }
    #[test]
    fn restore_failure_rolls_back_database_and_journal_recovers_old_snapshot() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut store = empty();
        start(&mut store);
        store.finish(1).unwrap();
        let archive = store.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        store
            .connection
            .execute("UPDATE work_records SET remark='current' WHERE id=1", [])
            .unwrap();
        store.connection.execute_batch("CREATE TRIGGER fail_restore BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.apply_image(&image.0).is_err());
        assert_eq!(store.record(1).unwrap().remark, "current");
        store
            .connection
            .execute_batch("DROP TRIGGER fail_restore")
            .unwrap();
        save_archive(&dir.join("restore-journal.workmemo"), &archive).unwrap();
        recover_pending(&mut store, dir).unwrap();
        assert_eq!(store.record(1).unwrap().remark, "test");
        assert!(!dir.join("restore-journal.workmemo").exists());
    }
    #[test]
    fn corrupted_backup_and_future_layout_are_rejected() {
        let mut archive = Archive {
            version: 1,
            database: vec![1, 2, 3],
            settings: BTreeMap::new(),
        };
        let d = TestDirectory::new();
        assert!(checked_image(&archive, d.db().parent().unwrap()).is_err());
        archive.settings.insert("window-layout.json".into(),br#"{"density":"comfortable","windows":{"evil":{"x":0,"y":0,"width":400,"height":400}}}"#.to_vec());
        assert!(validate_settings(&archive.settings).is_err());
        archive.settings.clear();
        archive.settings.insert(
            "island.json".into(),
            br#"{"version":1,"enabled":true,"position":["invalid",0]}"#.to_vec(),
        );
        assert!(validate_settings(&archive.settings).is_err());
    }
}

#[tauri::command]
pub fn detect_preview_data(app: tauri::AppHandle) -> Result<bool> {
    Ok(preview_path(&app)?.is_file())
}

#[cfg(test)]
mod image_backup_tests {
    use super::*;
    use crate::{
        database::tests::{TestClock, TestDirectory},
        presentation::{Background, Presentation},
    };
    #[test]
    fn snapshot_keeps_managed_background_and_rejects_missing_image() {
        let source = TestDirectory::new();
        let path = source.db();
        let directory = path.parent().unwrap();
        let backgrounds = directory.join("backgrounds");
        std::fs::create_dir(&backgrounds).unwrap();
        let mut bytes = std::io::Cursor::new(Vec::new());
        image::DynamicImage::new_rgb8(2, 2)
            .write_to(&mut bytes, image::ImageFormat::Png)
            .unwrap();
        std::fs::write(backgrounds.join("bg-test.png"), bytes.get_ref()).unwrap();
        let p = Presentation {
            background: Some(Background {
                file: "bg-test.png".into(),
                opacity: 37,
            }),
            ..Default::default()
        };
        std::fs::write(
            directory.join("presentation.json"),
            serde_json::to_vec(&p).unwrap(),
        )
        .unwrap();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let archive = store.archive(directory).unwrap();
        assert_eq!(archive.version, 2);
        validate_settings(&archive.settings).unwrap();
        assert_eq!(
            &archive.settings["backgrounds/bg-test.png"],
            bytes.get_ref()
        );
        let target = TestDirectory::new();
        let target_path = target.db();
        let target_dir = target_path.parent().unwrap();
        write_configs(target_dir, &archive.settings).unwrap();
        assert_eq!(
            crate::presentation::load(target_dir)
                .unwrap()
                .background
                .unwrap()
                .opacity,
            37
        );
        let mut missing = archive.settings.clone();
        missing.remove("backgrounds/bg-test.png");
        assert!(validate_settings(&missing).is_err());
        let mut invalid = archive.settings.clone();
        invalid.insert("backgrounds/../secret.png".into(), vec![1]);
        assert!(validate_settings(&invalid).is_err());
        for dir in [directory, target_dir] {
            std::fs::remove_file(dir.join("backgrounds/bg-test.png")).unwrap();
            std::fs::remove_dir(dir.join("backgrounds")).unwrap();
            std::fs::remove_file(dir.join("presentation.json")).unwrap();
        }
    }
}
