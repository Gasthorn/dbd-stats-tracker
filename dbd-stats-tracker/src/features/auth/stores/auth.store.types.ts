import type {
  AuthSession,
  AuthState,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";

export interface AuthActions {
  /** Restores the current session (if any) and subscribes to auth changes. Returns an unsubscribe function. */
  initialize: () => () => void;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: AuthSession | null) => void;
  setUser: (user: AuthUser | null) => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;
