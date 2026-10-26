use super::*;

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "workmemo-appearance-{}-{nonce}-{sequence}",
            std::process::id()
        ));
        fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        for item in fs::read_dir(&self.0).unwrap().flatten() {
            let _ = fs::remove_file(item.path());
        }
        let _ = fs::remove_dir(&self.0);
    }
}

#[test]
fn missing_file_uses_default_without_writing() {
    let directory = Directory::new();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    assert!(!directory.settings().exists());
}

#[test]
fn all_themes_and_boundaries_round_trip_over_existing_file() {
    let directory = Directory::new();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        for opacity in [80, 88, 100] {
            let expected = Appearance {
                version: 1,
                theme,
                opacity,
            };
            save(&directory.settings(), expected.clone()).unwrap();
            assert_eq!(load(&directory.settings()).unwrap(), expected);
        }
    }
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn invalid_opacity_does_not_replace_saved_settings() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original = fs::read(directory.settings()).unwrap();
    for opacity in [0, 79, 101, 255] {
        assert!(
            save(
                &directory.settings(),
                Appearance {
                    opacity,
                    ..Appearance::default()
                }
            )
            .is_err()
        );
    }
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn corrupted_file_is_reported_and_backed_up_before_explicit_repair() {
    let directory = Directory::new();
    let original = b"invalid settings";
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
    save(&directory.settings(), Appearance::default()).unwrap();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    let backup = fs::read_dir(&directory.0)
        .unwrap()
        .flatten()
        .find(|item| item.file_name().to_string_lossy().contains("recovery"))
        .unwrap();
    assert_eq!(fs::read(backup.path()).unwrap(), original);
}

#[test]
fn newer_schema_is_not_overwritten() {
    let directory = Directory::new();
    let original = br#"{"version":2,"theme":"future","opacity":90}"#;
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn rejects_unknown_theme_and_oversized_configuration() {
    let directory = Directory::new();
    fs::write(
        directory.settings(),
        br#"{"version":1,"theme":"unknown","opacity":90}"#,
    )
    .unwrap();
    assert!(load(&directory.settings()).is_err());
    fs::write(directory.settings(), vec![b' '; MAX_BYTES as usize + 1]).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
}

#[cfg(windows)]
#[test]
fn failed_replace_keeps_original_and_removes_temporary_file() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original_bytes = fs::read(directory.settings()).unwrap();
    let original_permissions = fs::metadata(directory.settings()).unwrap().permissions();
    let mut readonly = original_permissions.clone();
    readonly.set_readonly(true);
    fs::set_permissions(directory.settings(), readonly).unwrap();
    let result = save(
        &directory.settings(),
        Appearance {
            theme: Theme::Dark,
            ..Appearance::default()
        },
    );
    fs::set_permissions(directory.settings(), original_permissions).unwrap();
    assert!(result.is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original_bytes);
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn saving_appearance_never_changes_the_work_session() {
    use crate::{
        clock::SystemClock,
        database::{StartInput, Store},
    };
    let directory = Directory::new();
    let mut store = Store::open(
        &directory.0.join("workmemo.sqlite3"),
        Box::new(SystemClock::new()),
    )
    .unwrap();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: Some(2.5),
            remark: "isolation test".into(),
        })
        .unwrap();
    let original = store.snapshot().unwrap().active.unwrap();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        save(
            &directory.settings(),
            Appearance {
                version: 1,
                theme,
                opacity: 85,
            },
        )
        .unwrap();
    }
    let current = store.snapshot().unwrap().active.unwrap();
    assert_eq!(current.id, original.id);
    assert_eq!(current.start_time, original.start_time);
    assert_eq!(current.remark, original.remark);
    assert_eq!(current.quantity, original.quantity);
    assert_eq!(current.status, "WORKING");
    assert!(!current.is_paused);
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}
