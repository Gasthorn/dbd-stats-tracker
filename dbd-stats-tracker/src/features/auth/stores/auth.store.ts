import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import { authService } from "../services/auth.service";
import type { AuthStore } from "./auth.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  status: "idle",
  error: null,
  isInitializing: true,

  initialize: () => {
    authService
      .getSession()
      .then((session) => {
        set({
          session,
          user: session?.user ?? null,
          status: session ? "authenticated" : "unauthenticated",
        });
      })
      .catch((err) => set({ status: "error", error: toErrorMessage(err) }))
      .finally(() => set({ isInitializing: false }));

    return authService.onAuthStateChange((session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? "authenticated" : "unauthenticated",
      });
    });
  },

  signIn: async (credentials) => {
    set({ status: "loading", error: null });
    try {
      const session = await authService.signInWithPassword(credentials);
      set({ session, user: session.user, status: "authenticated" });
    } catch (err) {
      set({ status: "unauthenticated", error: toErrorMessage(err) });
      throw err;
    }
  },

  signUp: async (credentials) => {
    set({ status: "loading", error: null });
    try {
      const session = await authService.signUp(credentials);
      set({ session, user: session.user, status: "authenticated" });
    } catch (err) {
      set({ status: "unauthenticated", error: toErrorMessage(err) });
      throw err;
    }
  },

  signOut: async () => {
    set({ status: "loading", error: null });
    try {
      await authService.signOut();
      set({ session: null, user: null, status: "unauthenticated" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
      throw err;
    }
  },

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  reset: () =>
    set({ user: null, session: null, status: "idle", error: null, isInitializing: false }),
}));
