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
}
