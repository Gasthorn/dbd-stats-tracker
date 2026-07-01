import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../shared/lib/supabase/client";
import {
  EmailConfirmationRequiredError,
  type AuthSession,
  type AuthUser,
  type LoginCredentials,
  type PasswordResetRequest,
  type PasswordUpdateRequest,
  type RegisterCredentials,
} from "../types/auth.types";
import type { AuthService } from "./auth.service.types";

async function fetchProfile(
  userId: string,
): Promise<Pick<AuthUser, "username" | "avatarUrl" | "createdAt">> {
  const { data, error } = await supabase
    .from("users")
    .select("username, avatar_url, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Impossible de récupérer le profil utilisateur.");
  }

  return {
    username: data.username,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}

async function toAuthSession(session: Session): Promise<AuthSession> {
  const profile = await fetchProfile(session.user.id);

  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email ?? "",
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
  };

  return {
    user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: new Date((session.expires_at ?? 0) * 1000).toISOString(),
  };
}

export const authService: AuthService = {
  async signInWithPassword({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error("Connexion impossible : aucune session retournée.");
    return toAuthSession(data.session);
  },

  async signUp({ email, password, username }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new EmailConfirmationRequiredError();
    }
    return toAuthSession(data.session);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) return null;
    return toAuthSession(data.session);
  },

  async requestPasswordReset({ email }: PasswordResetRequest) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updatePassword({ newPassword }: PasswordUpdateRequest) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        callback(null);
        return;
      }
      toAuthSession(session)
        .then(callback)
        .catch(() => callback(null));
    });
    return () => data.subscription.unsubscribe();
  },
};
