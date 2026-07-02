use tauri::{path::BaseDirectory, Manager};

/// Absolute path to the `Icons/` folder bundled into the app (declared as a `bundle.resources`
/// entry in tauri.conf.json), used as the fallback icons source until the player picks their own
/// folder. Resolved via Tauri's resource directory so it works both in `tauri dev` (copied next
/// to the debug binary) and in an installed build on another machine (copied next to the
/// installed executable), unlike a path baked in from the source tree at compile time.
#[tauri::command]
fn default_icons_folder(app: tauri::AppHandle) -> Option<String> {
    let resource_path = app.path().resolve("resources/Icons", BaseDirectory::Resource).ok()?;
    if !resource_path.is_dir() {
        return None;
    }

    let path_string = resource_path.to_string_lossy().to_string();
    Some(
        path_string
            .strip_prefix(r"\\?\")
            .map(str::to_string)
            .unwrap_or(path_string),
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![default_icons_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
