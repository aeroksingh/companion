use tauri::{
    App, AppHandle, Manager,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn setup_tray(app: &mut App) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Show Companion", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "Hide Companion", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let center = MenuItem::with_id(app, "center", "Open Companion Center", true, None::<&str>)?;
    let create = MenuItem::with_id(app, "create", "Create Companion", true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[
        &show, &hide, &sep1, &center, &create, &sep2, &quit,
    ])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Companion")
        .icon(app.default_window_icon().unwrap().clone())
        .on_menu_event(|app, event| handle_menu(app, event.id.as_ref()))
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event {
                toggle_overlay(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn handle_menu(app: &AppHandle, id: &str) {
    match id {
        "show" => {
            if let Some(w) = app.get_webview_window("overlay") {
                w.show().ok();
            }
        }
        "hide" => {
            if let Some(w) = app.get_webview_window("overlay") {
                w.hide().ok();
            }
        }
        "center" => {
            if let Some(w) = app.get_webview_window("center") {
                w.show().ok();
                w.set_focus().ok();
            }
        }
        "create" => {
            if let Some(w) = app.get_webview_window("onboarding") {
                w.show().ok();
                w.set_focus().ok();
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}

fn toggle_overlay(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("overlay") {
        let visible = w.is_visible().unwrap_or(false);
        if visible { w.hide().ok(); } else { w.show().ok(); }
    }
}
