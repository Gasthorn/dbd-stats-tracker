import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import "./update-banner.css";

type UpdateState = "idle" | "checking" | "available" | "downloading" | "installed" | "error";

/**
 * Silently checks for an app update on mount (real Tauri runtime only - a plain browser during
 * dev just has nothing to check against) and, if one is found, shows a dismissible banner to
 * download, install, and relaunch with a single click.
 */
export function UpdateBanner() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState("checking");
    check()
      .then((found) => {
        if (cancelled) return;
        if (found) {
          setUpdate(found);
          setState("available");
        } else {
          setState("idle");
        }
      })
      .catch(() => {
        // Outside the Tauri runtime, or no network - fail silently, this isn't user-actionable.
        if (!cancelled) setState("idle");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleInstall() {
    if (!update) return;
    setState("downloading");
    setError(null);
    try {
      let totalBytes = 0;
      let downloadedBytes = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          totalBytes = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          downloadedBytes += event.data.chunkLength;
          setProgress(totalBytes > 0 ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)) : 0);
        }
      });
      setState("installed");
      await relaunch();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : t("updater.installFailed"));
    }
  }

  if (dismissed || state === "idle" || state === "checking") return null;

  return (
    <div className="update-banner">
      {state === "available" && update && (
        <>
          <span>{t("updater.available", { version: update.version, currentVersion: update.currentVersion })}</span>
          <div className="update-banner-actions">
            <button type="button" onClick={handleInstall}>
              {t("updater.install")}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setDismissed(true)}>
              {t("updater.later")}
            </button>
          </div>
        </>
      )}

      {state === "downloading" && (
        <span>
          {t("updater.downloading")} {progress > 0 ? `${progress}%` : ""}
        </span>
      )}

      {state === "installed" && <span>{t("updater.installed")}</span>}

      {state === "error" && (
        <>
          <span className="update-banner-error">{error}</span>
          <button type="button" className="btn-secondary" onClick={() => setDismissed(true)}>
            {t("common.close")}
          </button>
        </>
      )}
    </div>
  );
}
