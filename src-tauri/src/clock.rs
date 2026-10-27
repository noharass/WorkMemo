#[cfg(not(windows))]
use std::time::Instant;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Copy, Debug)]
pub struct TimePoint {
    pub wall_ms: i64,
    pub ticks_ms: i64,
}

pub trait Clock: Send {
    fn now(&self) -> TimePoint;
}

pub struct SystemClock {
    #[cfg(not(windows))]
    origin: Instant,
}

impl SystemClock {
    pub fn new() -> Self {
        Self {
            #[cfg(not(windows))]
            origin: Instant::now(),
        }
    }
}

impl Clock for SystemClock {
    fn now(&self) -> TimePoint {
        TimePoint {
            wall_ms: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()
                .min(i64::MAX as u128) as i64,
            ticks_ms: system_ticks(self),
        }
    }
}

#[cfg(windows)]
fn system_ticks(_: &SystemClock) -> i64 {
    // Windows input timestamps use the same uptime clock, including sleep.
    unsafe {
        windows_sys::Win32::System::SystemInformation::GetTickCount64().min(i64::MAX as u64) as i64
    }
}
#[cfg(not(windows))]
fn system_ticks(clock: &SystemClock) -> i64 {
    clock.origin.elapsed().as_millis().min(i64::MAX as u128) as i64
}
