/// Absolute path to the repo-root `Icons/` folder shipped alongside this project on disk, used as
/// the fallback icons source until the player picks their own folder. `CARGO_MANIFEST_DIR` is
/// baked in at compile time as the absolute path to `src-tauri/`, so this doesn't depend on the
/// process's working directory at launch.
#[tauri::command]
fn default_icons_folder() -> Option<String> {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let candidate = std::path::Path::new(manifest_dir).join("..").join("..").join("Icons");
    let canonical = candidate.canonicalize().ok()?;
    if !canonical.is_dir() {
        return None;
    }

    let path_string = canonical.to_string_lossy().to_string();
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
        .invoke_handler(tauri::generate_handler![default_icons_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
