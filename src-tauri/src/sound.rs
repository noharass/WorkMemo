//! A single backend transition observer; no frontend poll or window can replay cues.
#[derive(Clone, Copy, Debug, PartialEq, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Cue {
    Start,
    Pause,
    Resume,
    End,
    Warning,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SoundTheme {
    #[default]
    Soft,
    Crisp,
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
                    Some(p) if p.id != a.id => cues.push(Cue::End),
                    Some(p) if p.paused != a.paused => {
                        cues.push(if a.paused { Cue::Pause } else { Cue::Resume })
                    }
                    _ => {}
                }
            }
        } else if previous.is_some() {
            cues.push(Cue::End);
        }
        if cues.is_empty()
            && active.is_some_and(|a| !a.recovery)
            && warning
            && (!was_warning || previous.map(|p| p.id) != active.map(|p| p.id))
        {
            cues.push(Cue::Warning);
        }
        cues
    }
}
fn pcm(cue: Cue, theme: SoundTheme) -> &'static [u8] {
    match (theme, cue) {
        (SoundTheme::Soft, Cue::Start) => include_bytes!("../sounds/start.wav"),
        (SoundTheme::Soft, Cue::Pause) => include_bytes!("../sounds/pause.wav"),
        (SoundTheme::Soft, Cue::Resume) => include_bytes!("../sounds/resume.wav"),
        (SoundTheme::Soft, Cue::End) => include_bytes!("../sounds/end.wav"),
        (SoundTheme::Soft, Cue::Warning) => include_bytes!("../sounds/warning.wav"),
        (SoundTheme::Crisp, Cue::Start) => include_bytes!("../sounds/crisp/start.wav"),
        (SoundTheme::Crisp, Cue::Pause) => include_bytes!("../sounds/crisp/pause.wav"),
        (SoundTheme::Crisp, Cue::Resume) => include_bytes!("../sounds/crisp/resume.wav"),
        (SoundTheme::Crisp, Cue::End) => include_bytes!("../sounds/crisp/end.wav"),
        (SoundTheme::Crisp, Cue::Warning) => include_bytes!("../sounds/crisp/warning.wav"),
    }
}
pub fn play(cue: Cue, theme: SoundTheme) -> Result<(), String> {
    let bytes = pcm(cue, theme);
    #[cfg(windows)]
    {
        use windows_sys::Win32::Media::Audio::{PlaySoundW, SND_ASYNC, SND_MEMORY, SND_NODEFAULT};
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
        let _ = bytes;
    }
    Ok(())
}
#[tauri::command]
pub fn preview_sound(theme: Option<SoundTheme>, cue: Option<Cue>) -> Result<(), String> {
    play(cue.unwrap_or(Cue::Start), theme.unwrap_or_default())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn transition_takes_priority_over_warning_and_muted_observations_do_not_replay() {
        let mut t = Tracker::default();
        t.observe(None, false);
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert_eq!(t.observe(Some(a), true), vec![Cue::Start]);
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), true),
            vec![Cue::Pause]
        );
        // Same observer state is updated while muted; enabling sound cannot replay it.
        assert!(
            t.observe(Some(Status { paused: true, ..a }), true)
                .is_empty()
        );
        assert_eq!(t.observe(None, true), vec![Cue::End]);
        assert!(t.observe(None, true).is_empty());
        t.observe(Some(a), false);
        assert_eq!(t.observe(Some(Status { id: 2, ..a }), true), vec![Cue::End]);
        assert!(serde_json::from_str::<SoundTheme>("\"unknown\"").is_err());
        assert!(serde_json::from_str::<Cue>("\"unknown\"").is_err());
    }
    #[test]
    fn ten_embedded_cues_are_short_faded_non_silent_pcm_with_bounded_peak() {
        for theme in [SoundTheme::Soft, SoundTheme::Crisp] {
            for cue in [Cue::Start, Cue::Pause, Cue::Resume, Cue::End, Cue::Warning] {
                let wav = pcm(cue, theme);
                assert_eq!(&wav[..4], b"RIFF");
                assert_eq!(&wav[8..16], b"WAVEfmt ");
                assert_eq!(&wav[36..40], b"data");
                assert_eq!(u16::from_le_bytes(wav[20..22].try_into().unwrap()), 1);
                assert_eq!(u16::from_le_bytes(wav[22..24].try_into().unwrap()), 1);
                assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 22050);
                assert_eq!(u16::from_le_bytes(wav[34..36].try_into().unwrap()), 16);
                assert_eq!(
                    u32::from_le_bytes(wav[40..44].try_into().unwrap()) as usize,
                    wav.len() - 44
                );
                let samples: Vec<i16> = wav[44..]
                    .chunks_exact(2)
                    .map(|b| i16::from_le_bytes([b[0], b[1]]))
                    .collect();
                assert!(samples.len() <= 18743 && samples.len() > 220);
                assert_eq!(samples[0], 0);
                assert_eq!(samples.last(), Some(&0));
                let peak = samples.iter().map(|v| i32::from(*v).abs()).max().unwrap();
                assert!(peak > 100 && peak <= 14746);
                assert_ne!(pcm(cue, SoundTheme::Soft), pcm(cue, SoundTheme::Crisp));
            }
        }
    }
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
