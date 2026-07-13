import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/auth.store";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { t } = useTranslation();
  const signIn = useAuthStore((state) => state.signIn);
  const status = useAuthStore((state) => state.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = status === "loading";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      await signIn({ email, password });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("auth.signInFailed"));
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{t("auth.loginTitle")}</h2>

      <label htmlFor="login-email">{t("auth.email")}</label>
      <input
        id="login-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="login-password">{t("auth.password")}</label>
      <input
        id="login-password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {formError && <p className="auth-error">{formError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("auth.signInPending") : t("auth.signInAction")}
      </button>
      <button type="button" className="auth-link" onClick={onSwitchToRegister}>
        {t("auth.switchToRegister")}
      </button>
    </form>
  );
}
