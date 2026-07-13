import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import { buildsService } from "../services/builds.service";
import type { BuildsStore } from "./builds.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

export const useBuildsStore = create<BuildsStore>((set, get) => ({
  builds: [],
  status: "idle",
  error: null,

  fetchBuilds: async () => {
    set({ status: "loading", error: null });
    try {
      const builds = await buildsService.listBuilds();
      set({ builds, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  saveBuild: async (input) => {
    const build = await buildsService.saveBuild(input);
    const existingIndex = get().builds.findIndex((b) => b.id === build.id);
    set({
      builds:
        existingIndex >= 0
          ? get().builds.map((b) => (b.id === build.id ? build : b))
          : [...get().builds, build].sort((a, b) => a.name.localeCompare(b.name)),
    });
    return build;
  },

  deleteBuild: async (id) => {
    await buildsService.deleteBuild(id);
    set({ builds: get().builds.filter((b) => b.id !== id) });
  },
}));
