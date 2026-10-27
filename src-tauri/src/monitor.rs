use crate::clock::TimePoint;
use serde::{Deserialize, Serialize};

pub const INPUT_POLL_MS: i64 = 5_000;
pub const RECENT_INPUT_MS: i64 = 5_000;
pub const IDLE_WARNING_MS: i64 = 300_000;
pub const IDLE_END_MS: i64 = 420_000;
pub const AWAY_PAUSE_MS: i64 = 120_000;
pub const HOLD_MS: i64 = 600_000;
pub const BROWSER_TIMEOUT_MS: i64 = 15_000;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WorkUrl {
    pub id: i64,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MonitorConfig {
    pub enabled: bool,
    pub revision: i64,
    pub rules: Vec<WorkUrl>,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleInput {
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConfigInput {
    pub enabled: bool,
    pub expected_revision: i64,
    pub rules: Vec<RuleInput>,
}

#[derive(Clone, Copy, Debug)]
pub struct NativeSample {
    pub at: TimePoint,
    pub last_input_ticks: i64,
    pub chrome_foreground: bool,
    pub unlocked: bool,
    pub reliable: bool,
}

#[derive(Clone, Debug)]
pub struct PageSample {
    pub at: TimePoint,
    pub focused: bool,
    pub rule_id: Option<i64>,
    pub revision: i64,
    pub ready: bool,
}

#[derive(Clone, Debug, Default, Serialize)]
pub struct MonitorStatus {
    pub enabled: bool,
    pub browser_connected: bool,
    pub native_available: bool,
    pub work_page: bool,
    pub idle_warning: bool,
    pub message: String,
    pub revision: i64,
}

#[derive(Default)]
pub struct Runtime {
    pub active: bool,
    pub events_failed: bool,
    pub config: MonitorConfig,
    pub native: Option<NativeSample>,
    pub page: Option<PageSample>,
    pub last_trusted_page: Option<i64>,
    pub browser_owner: Option<u64>,
    pub last_tick: Option<i64>,
    pub last_input: Option<i64>,
    pub record_id: Option<i64>,
    pub entered_at: Option<i64>,
    pub page_was_matched: bool,
    pub away_since: Option<i64>,
    pub monitor_pause_since: Option<i64>,
    pub input_floor: i64,
    pub warning_dismissed_for: Option<i64>,
    pub status: MonitorStatus,
}

impl Runtime {
    pub fn record_changed(&mut self, id: i64, at: TimePoint) {
        self.record_id = Some(id);
        self.last_input = Some(at.ticks_ms);
        self.away_since = None;
        self.monitor_pause_since = None;
        self.warning_dismissed_for = None;
        self.status.idle_warning = false;
    }
    pub fn record_ended(&mut self, at: TimePoint) {
        self.record_id = None;
        self.input_floor = at.ticks_ms;
        self.away_since = None;
        self.monitor_pause_since = None;
        self.status.idle_warning = false;
    }
}

pub fn normalize_url(value: &str) -> Result<String, String> {
    if value.len() > 2048 {
        return Err("工作 URL 不能超过 2048 字节。".into());
    }
    let mut url =
        url::Url::parse(value.trim()).map_err(|_| "请输入完整的 http 或 https 工作 URL。")?;
    if !["http", "https"].contains(&url.scheme())
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err("工作 URL 只支持不含用户名或密码的 http/https 地址。".into());
    }
    url.set_query(None);
    url.set_fragment(None);
    let result = url.to_string();
    if result.len() > 2048 {
        return Err("规范化后的 URL 过长。".into());
    }
    Ok(result)
}
