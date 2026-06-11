const APP_NAME: &str = "Companion";

#[cfg(target_os = "windows")]
pub fn write_autostart(exe_path: &str) -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu
        .open_subkey_with_flags(
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            KEY_SET_VALUE,
        )
        .map_err(|e| e.to_string())?;
    run_key
        .set_value(APP_NAME, &exe_path.to_string())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn write_autostart(_exe_path: &str) -> Result<(), String> {
    Ok(()) // No-op on non-Windows
}

#[tauri::command]
pub fn toggle_autostart(enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let run_key = hkcu
            .open_subkey_with_flags(
                r"Software\Microsoft\Windows\CurrentVersion\Run",
                KEY_SET_VALUE,
            )
            .map_err(|e| e.to_string())?;

        if enable {
            let exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let val = format!("\"{}\" --minimized", exe.to_string_lossy());
            run_key.set_value(APP_NAME, &val).map_err(|e| e.to_string())?;
        } else {
            run_key.delete_value(APP_NAME).ok();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn is_autostart_enabled() -> bool {
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        hkcu.open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run")
            .and_then(|k| k.get_value::<String, _>(APP_NAME))
            .is_ok()
    }
    #[cfg(not(target_os = "windows"))]
    { false }
}
