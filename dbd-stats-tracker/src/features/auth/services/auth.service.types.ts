import type {
  AuthSession,
  LoginCredentials,
  PasswordResetRequest,
  PasswordUpdateRequest,
  RegisterCredentials,
} from "../types/auth.types";

export interface AuthService {
  signInWithPassword: (credentials: LoginCredentials) => Promise<AuthSession>;
  signUp: (credentials: RegisterCredentials) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  getSession: () => Promise<AuthSession | null>;
  requestPasswordReset: (request: PasswordResetRequest) => Promise<void>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<void>;
  onAuthStateChange: (
    callback: (session: AuthSession | null) => void,
  ) => () => void;
}
