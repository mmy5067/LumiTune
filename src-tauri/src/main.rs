use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime, WebviewUrl, WebviewWindowBuilder, WindowEvent,
};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS,
    KEYEVENTF_KEYUP, VIRTUAL_KEY,
};

const MAIN_LABEL: &str = "main";
const OVERLAY_LABEL: &str = "overlay";
const VK_MEDIA_NEXT_TRACK_CODE: u16 = 0xB0;
const VK_MEDIA_PREV_TRACK_CODE: u16 = 0xB1;
const VK_MEDIA_PLAY_PAUSE_CODE: u16 = 0xB3;

#[derive(Serialize, Deserialize, Default)]
struct OverlayState {
    x: Option<i32>,
    y: Option<i32>,
    width: Option<u32>,
    height: Option<u32>,
}

fn overlay_state_path<R: Runtime>(app: &impl Manager<R>) -> Option<PathBuf> {
    app.path().app_config_dir().ok().map(|dir| dir.join("LumiTune").join("overlay-state.json"))
}

fn load_overlay_state<R: Runtime>(app: &impl Manager<R>) -> OverlayState {
    if let Some(path) = overlay_state_path(app) {
        if let Ok(contents) = fs::read_to_string(&path) {
            if let Ok(state) = serde_json::from_str(&contents) {
                return state;
            }
        }
    }
    OverlayState::default()
}

fn save_overlay_state<R: Runtime>(app: &impl Manager<R>, state: &OverlayState) -> Result<(), String> {
    let path = overlay_state_path(app).ok_or_else(|| "Unable to determine app config directory".to_string())?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let contents = serde_json::to_string_pretty(state).map_err(|e| e.to_string())?;
    fs::write(path, contents).map_err(|e| e.to_string())
}

fn send_media_key(vk_code: u16) -> Result<(), String> {
    let key = VIRTUAL_KEY(vk_code);
    let inputs = [
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: key,
                    wScan: 0,
                    dwFlags: KEYBD_EVENT_FLAGS(0),
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
        INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: key,
                    wScan: 0,
                    dwFlags: KEYEVENTF_KEYUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        },
    ];

    let sent = unsafe { SendInput(&inputs, std::mem::size_of::<INPUT>() as i32) };

    if sent == inputs.len() as u32 {
        Ok(())
    } else {
        Err(format!("SendInput failed, sent {} of {}", sent, inputs.len()))
    }
}

fn show_window(app: &AppHandle, label: &str) -> Result<(), String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("window `{label}` not found"))?;
    window.show().map_err(|e| e.to_string())?;
    window.unminimize().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

fn hide_window(app: &AppHandle, label: &str) -> Result<(), String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("window `{label}` not found"))?;
    window.hide().map_err(|e| e.to_string())
}

fn toggle_overlay_impl(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window(OVERLAY_LABEL)
        .ok_or_else(|| "overlay window not found".to_string())?;

    match window.is_visible() {
        Ok(true) => window.hide().map_err(|e| e.to_string()),
        _ => {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
            Ok(())
        }
    }
}

fn apple_music_control_js(action: &str) -> Option<&'static str> {
    match action {
        "play_pause" => Some(
            r#"
(() => {
  const labelMap = {
    play_pause: ['播放', '暂停', 'Play', 'Pause', '播放/暂停', 'play/pause'],
    previous: ['上一首', '上一曲', 'Previous', 'Back', 'Skip back', 'Previous track'],
    next: ['下一首', '下一曲', 'Next', 'Forward', 'Skip forward', 'Next track']
  };

  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  const keywords = labelMap['play_pause'];
  const target = findTarget(buttons, keywords);

  if (target) {
    target.click();
    return true;
  }

  document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
  return true;

  function findTarget(elements, keywords) {
    const visible = elements.filter(isVisible);
    return visible.find((el) => {
      const label = [el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('data-testid'), el.textContent]
        .filter(Boolean)
        .join(' ')
        .trim()
        .toLowerCase();
      return keywords.some(keyword => label.includes(keyword.toLowerCase()));
    });
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }
})();
"#,
        ),
        "previous" => Some(
            r#"
(() => {
  const labelMap = {
    play_pause: ['播放', '暂停', 'Play', 'Pause', '播放/暂停', 'play/pause'],
    previous: ['上一首', '上一曲', 'Previous', 'Back', 'Skip back', 'Previous track'],
    next: ['下一首', '下一曲', 'Next', 'Forward', 'Skip forward', 'Next track']
  };

  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  const keywords = labelMap['previous'];
  const target = findTarget(buttons, keywords);

  if (target) {
    target.click();
    return true;
  }

  console.warn('[LumiTune] control target not found: previous');
  return false;

  function findTarget(elements, keywords) {
    const visible = elements.filter(isVisible);
    return visible.find((el) => {
      const label = [el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('data-testid'), el.textContent]
        .filter(Boolean)
        .join(' ')
        .trim()
        .toLowerCase();
      return keywords.some(keyword => label.includes(keyword.toLowerCase()));
    });
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }
})();
"#,
        ),
        "next" => Some(
            r#"
(() => {
  const labelMap = {
    play_pause: ['播放', '暂停', 'Play', 'Pause', '播放/暂停', 'play/pause'],
    previous: ['上一首', '上一曲', 'Previous', 'Back', 'Skip back', 'Previous track'],
    next: ['下一首', '下一曲', 'Next', 'Forward', 'Skip forward', 'Next track']
  };

  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  const keywords = labelMap['next'];
  const target = findTarget(buttons, keywords);

  if (target) {
    target.click();
    return true;
  }

  console.warn('[LumiTune] control target not found: next');
  return false;

  function findTarget(elements, keywords) {
    const visible = elements.filter(isVisible);
    return visible.find((el) => {
      const label = [el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('data-testid'), el.textContent]
        .filter(Boolean)
        .join(' ')
        .trim()
        .toLowerCase();
      return keywords.some(keyword => label.includes(keyword.toLowerCase()));
    });
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }
})();
"#,
        ),
        _ => None,
    }
}

fn player_action_impl(app: &AppHandle, action: &str) -> Result<(), String> {
    let media_result = match action {
        "play_pause" | "playPause" | "toggle" => send_media_key(VK_MEDIA_PLAY_PAUSE_CODE),
        "next" => send_media_key(VK_MEDIA_NEXT_TRACK_CODE),
        "previous" | "prev" => send_media_key(VK_MEDIA_PREV_TRACK_CODE),
        _ => return Err(format!("unknown action `{}`", action)),
    };

    if media_result.is_ok() {
        return media_result;
    }

    let js = apple_music_control_js(action).ok_or_else(|| format!("unknown action `{}`", action))?;
    let main = app
        .get_webview_window(MAIN_LABEL)
        .ok_or_else(|| "main window not found".to_string())?;
    main.eval(js).map_err(|e| e.to_string())
}

fn create_overlay_window(app: &tauri::App) -> tauri::Result<()> {
    if app.get_webview_window(OVERLAY_LABEL).is_some() {
        return Ok(());
    }

    let overlay_state = load_overlay_state(app);
    let size = overlay_state
        .width
        .and_then(|width| overlay_state.height.map(|height| (width as f64, height as f64)))
        .unwrap_or((340.0, 150.0));
    let position = overlay_state
        .x
        .and_then(|x| overlay_state.y.map(|y| (x as f64, y as f64)));

    let builder = WebviewWindowBuilder::new(app, OVERLAY_LABEL, WebviewUrl::App("index.html".into()))
        .title("Apple Music Lite Overlay")
        .inner_size(size.0, size.1)
        .min_inner_size(260.0, 88.0)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .visible(false);

    let builder = if let Some((x, y)) = position {
        builder.position(x, y)
    } else {
        builder.position(1100.0, 72.0)
    };

    builder.build()?;

    Ok(())
}

fn create_tray(app: &tauri::App) -> tauri::Result<()> {
    let show_main = MenuItem::with_id(app, "show_main", "显示 Apple Music", true, None::<&str>)?;
    let toggle_overlay = MenuItem::with_id(app, "toggle_overlay", "显示/隐藏悬浮窗", true, None::<&str>)?;
    let previous = MenuItem::with_id(app, "previous", "上一首", true, None::<&str>)?;
    let play_pause = MenuItem::with_id(app, "play_pause", "播放/暂停", true, None::<&str>)?;
    let next = MenuItem::with_id(app, "next", "下一首", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show_main,
            &toggle_overlay,
            &previous,
            &play_pause,
            &next,
            &quit,
        ],
    )?;

    TrayIconBuilder::new()
        .tooltip("Apple Music Lite")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_main" => {
                let _ = show_window(app, MAIN_LABEL);
            }
            "toggle_overlay" => {
                let _ = toggle_overlay_impl(app);
            }
            "previous" => {
                let _ = player_action_impl(app, "previous");
            }
            "play_pause" => {
                let _ = player_action_impl(app, "play_pause");
            }
            "next" => {
                let _ = player_action_impl(app, "next");
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = show_window(tray.app_handle(), MAIN_LABEL);
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
fn show_main(app: AppHandle) -> Result<(), String> {
    show_window(&app, MAIN_LABEL)
}

#[tauri::command]
fn hide_overlay(app: AppHandle) -> Result<(), String> {
    hide_window(&app, OVERLAY_LABEL)
}

#[tauri::command]
fn toggle_overlay(app: AppHandle) -> Result<(), String> {
    toggle_overlay_impl(&app)
}

#[tauri::command]
fn player_action(app: AppHandle, action: String) -> Result<(), String> {
    player_action_impl(&app, &action)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            show_main,
            hide_overlay,
            toggle_overlay,
            player_action
        ])
        .setup(|app| {
            create_overlay_window(app)?;
            create_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                WindowEvent::Moved(position) if window.label() == OVERLAY_LABEL => {
                    let mut state = load_overlay_state(window.app_handle());
                    state.x = Some(position.x);
                    state.y = Some(position.y);
                    if let Ok(size) = window.outer_size() {
                        state.width = Some(size.width);
                        state.height = Some(size.height);
                    }
                    let _ = save_overlay_state(window.app_handle(), &state);
                }
                WindowEvent::Resized(size) if window.label() == OVERLAY_LABEL => {
                    let mut state = load_overlay_state(window.app_handle());
                    state.width = Some(size.width);
                    state.height = Some(size.height);
                    if let Ok(pos) = window.outer_position() {
                        state.x = Some(pos.x);
                        state.y = Some(pos.y);
                    }
                    let _ = save_overlay_state(window.app_handle(), &state);
                }
                WindowEvent::CloseRequested { api, .. } => {
                    match window.label() {
                        MAIN_LABEL | OVERLAY_LABEL => {
                            api.prevent_close();
                            let _ = window.hide();
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Apple Music Lite");
}
