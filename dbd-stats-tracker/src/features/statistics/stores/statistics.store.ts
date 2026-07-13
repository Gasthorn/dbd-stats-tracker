import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import type { AsyncStatus } from "../../../shared/types/common.types";
import { matchService } from "../../match-tracker";
import type { Match } from "../../match-tracker/types/match.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

export interface StatisticsState {
  matches: Match[];
  status: AsyncStatus;
  error: string | null;
  viewedMonth: number;
  viewedYear: number;
}

export interface StatisticsActions {
  fetchAll: () => Promise<void>;
  changeMonth: (delta: number) => void;
  resetMonth: () => void;
}

export type StatisticsStore = StatisticsState & StatisticsActions;

const now = new Date();

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  matches: [],
  status: "idle",
  error: null,
  viewedMonth: now.getMonth(),
  viewedYear: now.getFullYear(),

  fetchAll: async () => {
    set({ status: "loading", error: null });
    try {
      const result = await matchService.listMatches();
      set({ matches: result.items, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  changeMonth: (delta) => {
    const date = new Date(get().viewedYear, get().viewedMonth + delta, 1);
    set({ viewedMonth: date.getMonth(), viewedYear: date.getFullYear() });
  },

  resetMonth: () => {
    const today = new Date();
    set({ viewedMonth: today.getMonth(), viewedYear: today.getFullYear() });
  },
}));
