import { useState, type FormEvent } from "react";
import { useAuthStore } from "../stores/auth.store";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
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
      setFormError(err instanceof Error ? err.message : "Connexion impossible.");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="login-password">Mot de passe</label>
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
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
      <button type="button" className="auth-link" onClick={onSwitchToRegister}>
        Pas encore de compte ? Créer un compte
      </button>
    </form>
  );
}
