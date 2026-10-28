use crate::clock::TimePoint;
use serde::{Deserialize, Serialize};

pub const RECENT_INPUT_MS: i64 = 5_000;
pub const BROWSER_TIMEOUT_MS: i64 = 15_000;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WorkUrl {
    pub id: i64,
    #[serde(default = "default_match_mode")]
    pub match_mode: String,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct TrackingTimes {
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_seconds: i64,
    pub hold_seconds: i64,
}
impl Default for TrackingTimes {
    fn default() -> Self {
        Self {
            idle_warning_seconds: 300,
            idle_end_seconds: 420,
            away_pause_seconds: 120,
            hold_seconds: 600,
        }
    }
}
impl TrackingTimes {
    pub fn validate(&self) -> Result<(), String> {
        if [
            self.idle_warning_seconds,
            self.idle_end_seconds,
            self.away_pause_seconds,
            self.hold_seconds,
        ]
        .iter()
        .any(|v| !(1..=86400).contains(v))
        {
            return Err("计时参数必须为 1 到 86400 秒的整数。".into());
        }
        if self.idle_warning_seconds >= self.idle_end_seconds {
            return Err("空闲提醒时间必须早于空闲结束时间。".into());
        }
        Ok(())
    }
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MonitorConfig {
    pub enabled: bool,
    pub revision: i64,
    pub rules: Vec<WorkUrl>,
    pub times: TrackingTimes,
    pub poll_interval_seconds: i64,
    pub auto_resume_manual: bool,
    #[serde(default)]
    pub browsing_only: bool,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleInput {
    #[serde(default = "default_match_mode")]
    pub match_mode: String,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConfigInput {
    pub enabled: bool,
    pub expected_revision: i64,
    pub rules: Vec<RuleInput>,
    pub times: TrackingTimes,
    pub poll_interval_seconds: i64,
    pub auto_resume_manual: bool,
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

#[derive(Clone, Debug, Serialize)]
pub struct StartCandidate {
    pub id: u64,
    pub rule_id: i64,
    pub category: String,
}
#[derive(Clone, Debug, Default, Serialize)]
pub struct MonitorStatus {
    pub browsing_only: bool,
    pub browse_ready: bool,
    pub browse_category: Option<String>,
    pub start_candidate: Option<StartCandidate>,
    pub enabled: bool,
    pub browser_connected: bool,
    pub native_available: bool,
    pub work_page: bool,
    pub idle_warning: bool,
    pub message: String,
    pub revision: i64,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_remaining_seconds: Option<i64>,
}

#[derive(Default)]
pub struct Runtime {
    pub candidate: Option<StartCandidate>,
    pub candidate_sequence: u64,
    pub browse_ready_rule: Option<i64>,
    pub page_activity_at: Option<i64>,
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
        self.candidate = None;
        self.status.start_candidate = None;
        self.config.browsing_only = false;
        self.status.browsing_only = false;
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

pub fn default_match_mode() -> String {
    "path_prefix".into()
}
pub fn normalize_rule(value: &str, mode: &str) -> Result<String, String> {
    match mode {
        "path_prefix" => normalize_url(value),
        "origin" => {
            let value = normalize_url(value)?;
            let url = url::Url::parse(&value).map_err(|_| "站点无效")?;
            Ok(format!("{}/", url.origin().ascii_serialization()))
        }
        "domain_suffix" => {
            let value = value.trim().trim_start_matches('.');
            if value.is_empty()
                || value.len() > 253
                || value.contains(['/', ':', '?', '#', '@', '*', '\\'])
            {
                return Err(
                    "请输入域名，例如 cn-beijing-vpc.fcapp.run，不含协议、端口或路径。".into(),
                );
            }
            let host = url::Host::parse(value).map_err(|_| "域名无效")?;
            let url::Host::Domain(domain) = host else {
                return Err("域名后缀不能是 IP 地址。".into());
            };
            if !domain.contains('.')
                || domain.split('.').any(|label| {
                    label.is_empty()
                        || label.len() > 63
                        || label.starts_with('-')
                        || label.ends_with('-')
                        || !label
                            .bytes()
                            .all(|b| b.is_ascii_alphanumeric() || b == b'-')
                })
            {
                return Err("请输入有效的完整域名后缀。".into());
            }
            Ok(domain)
        }
        _ => Err("未知的网址匹配模式，请更新应用及扩展。".into()),
    }
}

pub fn supports_match_modes(capable: bool, rules: &[WorkUrl]) -> bool {
    capable || rules.iter().all(|r| r.match_mode == "path_prefix")
}
#[cfg(test)]
mod matching_tests {
    use super::*;
    #[test]
    fn rule_validation_and_legacy_capabilities() {
        assert_eq!(
            normalize_rule("https://moonshot.feishu.cn/sheets/a?q=1", "origin").unwrap(),
            "https://moonshot.feishu.cn/"
        );
        assert_eq!(
            normalize_rule(".CN-BEIJING-VPC.fcapp.run", "domain_suffix").unwrap(),
            "cn-beijing-vpc.fcapp.run"
        );
        for value in [
            "https://example.com",
            "localhost",
            "example.com/",
            "example.com:443",
            "evil@host.com",
            "*",
            "127.0.0.1",
            "bad..example.com",
        ] {
            assert!(normalize_rule(value, "domain_suffix").is_err(), "{value}");
        }
        assert!(normalize_rule("https://user:pass@example.com", "origin").is_err());
        assert!(normalize_rule("https://example.com", "unknown").is_err());
        let mut rules = vec![WorkUrl {
            id: 1,
            url_prefix: "https://example.com/".into(),
            category: "开发".into(),
            match_mode: default_match_mode(),
        }];
        assert!(supports_match_modes(false, &rules));
        rules[0].match_mode = "origin".into();
        assert!(!supports_match_modes(false, &rules));
        assert!(supports_match_modes(true, &rules));
    }
}
