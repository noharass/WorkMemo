//! A single backend transition observer; no frontend poll or window can replay cues.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Cue {
    Start,
    Pause,
    Resume,
    End,
    Warning,
}
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Status {
    pub id: i64,
    pub paused: bool,
    pub recovery: bool,
}
#[derive(Default)]
pub struct Tracker {
    previous: Option<(Option<Status>, bool)>,
}
impl Tracker {
    pub fn observe(&mut self, active: Option<Status>, warning: bool) -> Vec<Cue> {
        let old = self.previous.replace((active, warning));
        let Some((previous, was_warning)) = old else {
            return vec![];
        };
        let mut cues = vec![];
        if let Some(a) = active {
            if !a.recovery {
                match previous {
                    None => cues.push(Cue::Start),
                    Some(p) if p.id != a.id => cues.push(Cue::Start),
                    Some(p) if p.paused != a.paused => {
                        cues.push(if a.paused { Cue::Pause } else { Cue::Resume })
                    }
                    _ => {}
                }
            }
        } else if previous.is_some() {
            cues.push(Cue::End);
        }
        if warning && (!was_warning || previous.map(|p| p.id) != active.map(|p| p.id)) {
            cues.push(Cue::Warning);
        }
        cues
    }
}
pub fn play(cue: Cue) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::Media::Audio::{PlaySoundW, SND_ASYNC, SND_MEMORY, SND_NODEFAULT};
        let bytes: &'static [u8] = match cue {
            Cue::Start => include_bytes!("../sounds/start.wav"),
            Cue::Pause => include_bytes!("../sounds/pause.wav"),
            Cue::Resume => include_bytes!("../sounds/resume.wav"),
            Cue::End => include_bytes!("../sounds/end.wav"),
            Cue::Warning => include_bytes!("../sounds/warning.wav"),
        };
        // Static embedded PCM stays alive for asynchronous native playback.
        if unsafe {
            PlaySoundW(
                bytes.as_ptr().cast(),
                std::ptr::null_mut(),
                SND_ASYNC | SND_MEMORY | SND_NODEFAULT,
            )
        } == 0
        {
            return Err("系统未能播放提示音，请检查音频输出。".into());
        }
    }
    #[cfg(not(windows))]
    {
        let _ = cue;
    }
    Ok(())
}
#[tauri::command]
pub fn preview_sound() -> Result<(), String> {
    play(Cue::Start)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn transitions_are_once_only_and_initial_recovery_is_silent() {
        let mut t = Tracker::default();
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert!(t.observe(None, false).is_empty());
        assert_eq!(t.observe(Some(a), false), vec![Cue::Start]);
        assert!(t.observe(Some(a), false).is_empty());
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), false),
            vec![Cue::Pause]
        );
        assert_eq!(t.observe(Some(a), false), vec![Cue::Resume]);
        assert_eq!(t.observe(Some(a), true), vec![Cue::Warning]);
        assert!(t.observe(Some(a), true).is_empty());
        assert_eq!(t.observe(None, false), vec![Cue::End]);
        let mut restarted = Tracker::default();
        assert!(
            restarted
                .observe(
                    Some(Status {
                        paused: true,
                        recovery: true,
                        ..a
                    }),
                    true
                )
                .is_empty()
        );
    }
}
