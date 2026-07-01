import type { ISODateString, UUID } from "../../../shared/types/common.types";

export interface AuthUser {
  id: UUID;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: ISODateString;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: ISODateString;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  newPassword: string;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  /** True until the initial session restore (app boot) has settled. Distinct from `status`
   *  so that a sign-in/sign-up submission (which also sets status to "loading") doesn't
   *  make the gate unmount the auth form in favor of a full-page spinner. */
  isInitializing: boolean;
}

/** Thrown by signUp when Supabase requires email confirmation before a session is issued. */
export class EmailConfirmationRequiredError extends Error {
  constructor() {
    super("Veuillez confirmer votre adresse email avant de vous connecter.");
    this.name = "EmailConfirmationRequiredError";
  }
}
