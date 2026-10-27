//! Input metadata only: no hooks, key values, input text, or pointer coordinates.
use crate::{
    clock::{Clock, SystemClock, TimePoint},
    monitor::NativeSample,
};
use std::sync::mpsc::{self, Receiver, Sender};

#[derive(Clone, Copy, Debug)]
pub struct SystemSignal {
    pub at: TimePoint,
    pub available: bool,
}

// LASTINPUTINFO contains a wrapping 32-bit uptime value. Never use a poll time
// as the input time; reject nonsensical/synthetic future timestamps instead.
pub fn expand_input_tick(uptime: i64, raw: u32) -> Option<i64> {
    if uptime < 0 {
        return None;
    }
    let elapsed = (uptime as u32).wrapping_sub(raw) as i64;
    (elapsed <= uptime && elapsed <= i32::MAX as i64).then_some(uptime - elapsed)
}

#[cfg(windows)]
mod platform {
    use super::*;
    use std::{
        mem::size_of,
        ptr::{null, null_mut},
    };
    use windows_sys::Win32::{
        Foundation::{CloseHandle, HWND, LPARAM, LRESULT, WPARAM},
        System::{
            LibraryLoader::GetModuleHandleW,
            RemoteDesktop::*,
            Threading::{
                OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION, QueryFullProcessImageNameW,
            },
        },
        UI::{
            Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO},
            WindowsAndMessaging::*,
        },
    };

    pub fn sample() -> Result<NativeSample, String> {
        let mut input = LASTINPUTINFO {
            cbSize: size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        if unsafe { GetLastInputInfo(&mut input) } == 0 {
            return Err("无法读取 Windows 最后输入状态。".into());
        }
        // Read the comparison clock after the API, so an input arriving during
        // the call cannot look like a future timestamp.
        let at = SystemClock::new().now();
        let last_input_ticks = expand_input_tick(at.ticks_ms, input.dwTime)
            .ok_or("Windows 输入时间异常，已停止推测工时。")?;
        let mut buffer = null_mut();
        let mut bytes = 0;
        if unsafe {
            WTSQuerySessionInformationW(
                null_mut(),
                WTS_CURRENT_SESSION,
                WTSSessionInfoEx,
                &mut buffer,
                &mut bytes,
            )
        } == 0
        {
            return Err("无法确认当前 Windows 会话状态。".into());
        }
        let unlocked = if bytes as usize >= size_of::<WTSINFOEXW>() && !buffer.is_null() {
            // WTS owns the allocation; only access the documented level-1 data.
            let info = unsafe { &*(buffer as *const WTSINFOEXW) };
            info.Level == 1
                && unsafe { info.Data.WTSInfoExLevel1.SessionFlags }
                    == WTS_SESSIONSTATE_UNLOCK as i32
                && unsafe { info.Data.WTSInfoExLevel1.SessionState } == WTSActive
        } else {
            false
        };
        unsafe { WTSFreeMemory(buffer as _) };
        let foreground = unsafe { GetForegroundWindow() };
        let mut pid = 0;
        unsafe { GetWindowThreadProcessId(foreground, &mut pid) };
        let process = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid) };
        let mut path = [0u16; 32768];
        let mut length = path.len() as u32;
        let chrome_foreground = if !process.is_null() {
            let success =
                unsafe { QueryFullProcessImageNameW(process, 0, path.as_mut_ptr(), &mut length) }
                    != 0;
            unsafe { CloseHandle(process) };
            success
                && String::from_utf16_lossy(&path[..length as usize])
                    .rsplit(['\\', '/'])
                    .next()
                    .is_some_and(|name| name.eq_ignore_ascii_case("chrome.exe"))
        } else {
            false
        };
        Ok(NativeSample {
            at,
            last_input_ticks,
            chrome_foreground,
            unlocked,
            reliable: true,
        })
    }

    unsafe extern "system" fn procedure(
        hwnd: HWND,
        message: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        if message == WM_NCCREATE {
            let create = unsafe { &*(lparam as *const CREATESTRUCTW) };
            unsafe { SetWindowLongPtrW(hwnd, GWLP_USERDATA, create.lpCreateParams as isize) };
        }
        let sender = unsafe { GetWindowLongPtrW(hwnd, GWLP_USERDATA) }
            as *const Sender<Result<SystemSignal, String>>;
        let state = match message {
            WM_WTSSESSION_CHANGE => match wparam as u32 {
                WTS_SESSION_LOCK
                | WTS_SESSION_LOGOFF
                | WTS_CONSOLE_DISCONNECT
                | WTS_REMOTE_DISCONNECT => Some(false),
                WTS_SESSION_UNLOCK | WTS_CONSOLE_CONNECT | WTS_REMOTE_CONNECT => Some(true),
                _ => None,
            },
            WM_POWERBROADCAST => match wparam as u32 {
                4 => Some(false),     // PBT_APMSUSPEND
                7 | 18 => Some(true), // PBT_APMRESUMESUSPEND / PBT_APMRESUMEAUTOMATIC
                _ => None,
            },
            _ => None,
        };
        if let Some(available) = state {
            if !sender.is_null() {
                let _ = unsafe { &*sender }.send(Ok(SystemSignal {
                    at: SystemClock::new().now(),
                    available,
                }));
            }
        }
        unsafe { DefWindowProcW(hwnd, message, wparam, lparam) }
    }

    pub fn listen() -> Receiver<Result<SystemSignal, String>> {
        let (sender, receiver) = mpsc::channel();
        std::thread::spawn(move || {
            let class: Vec<u16> = "WorkMemoSystemObserver\0".encode_utf16().collect();
            let instance = unsafe { GetModuleHandleW(null()) };
            let window_class = WNDCLASSW {
                lpfnWndProc: Some(procedure),
                hInstance: instance,
                lpszClassName: class.as_ptr(),
                ..Default::default()
            };
            if unsafe { RegisterClassW(&window_class) } == 0 {
                let _ = sender.send(Err("无法注册系统状态监听窗口。".into()));
                return;
            }
            // Hidden top-level window receives power broadcasts; a message-only
            // window would miss them. It is never shown or given focus.
            let hwnd = unsafe {
                CreateWindowExW(
                    0,
                    class.as_ptr(),
                    class.as_ptr(),
                    0,
                    0,
                    0,
                    0,
                    0,
                    null_mut(),
                    null_mut(),
                    instance,
                    &sender as *const _ as _,
                )
            };
            if hwnd.is_null() {
                let _ = sender.send(Err("无法创建系统状态监听窗口。".into()));
                return;
            }
            if unsafe { WTSRegisterSessionNotification(hwnd, NOTIFY_FOR_THIS_SESSION) } == 0 {
                let _ = sender.send(Err("无法订阅当前会话的锁屏通知。".into()));
                unsafe { DestroyWindow(hwnd) };
                return;
            }
            let mut message = MSG::default();
            while unsafe { GetMessageW(&mut message, null_mut(), 0, 0) } > 0 {
                unsafe {
                    TranslateMessage(&message);
                    DispatchMessageW(&message);
                }
            }
            unsafe {
                WTSUnRegisterSessionNotification(hwnd);
                DestroyWindow(hwnd);
            }
        });
        receiver
    }
}

#[cfg(windows)]
pub use platform::{listen, sample};
#[cfg(not(windows))]
pub fn sample() -> Result<NativeSample, String> {
    Err("本阶段输入监测仅支持 Windows。".into())
}
#[cfg(not(windows))]
pub fn listen() -> Receiver<Result<SystemSignal, String>> {
    let (_sender, receiver) = mpsc::channel();
    receiver
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn wrapping_input_clock_retains_actual_last_input() {
        let uptime = (u32::MAX as i64) + 50_000;
        let raw = (uptime - 420_123) as u32;
        assert_eq!(expand_input_tick(uptime, raw), Some(uptime - 420_123));
        assert_eq!(expand_input_tick(100, 200), None);
    }
}
