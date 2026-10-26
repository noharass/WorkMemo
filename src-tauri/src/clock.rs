use std::time::{Instant, SystemTime, UNIX_EPOCH};

#[derive(Clone, Copy)]
pub struct TimePoint {
    pub wall_ms: i64,
    pub ticks_ms: i64,
}

pub trait Clock: Send {
    fn now(&self) -> TimePoint;
}

pub struct SystemClock {
    origin: Instant,
}

impl SystemClock {
    pub fn new() -> Self {
        Self {
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
            ticks_ms: self.origin.elapsed().as_millis().min(i64::MAX as u128) as i64,
        }
    }
}
