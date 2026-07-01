import { useState, type FormEvent } from "react";
import { useAuthStore } from "../stores/auth.store";
import { EmailConfirmationRequiredError } from "../types/auth.types";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const MIN_PASSWORD_LENGTH = 6;

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const signUp = useAuthStore((state) => state.signUp);
  const status = useAuthStore((state) => state.status);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isSubmitting = status === "loading";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (password !== confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }

    try {
      await signUp({ email, password, username });
    } catch (err) {
      if (err instanceof EmailConfirmationRequiredError) {
        setInfoMessage(err.message);
        return;
      }
      setFormError(err instanceof Error ? err.message : "Inscription impossible.");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>

      <label htmlFor="register-username">Pseudo</label>
      <input
        id="register-username"
        type="text"
        required
        minLength={3}
        maxLength={32}
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="register-password">Mot de passe</label>
      <input
        id="register-password"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
      <input
        id="register-confirm-password"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {formError && <p className="auth-error">{formError}</p>}
      {infoMessage && <p className="auth-info">{infoMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création..." : "Créer mon compte"}
      </button>
      <button type="button" className="auth-link" onClick={onSwitchToLogin}>
        Déjà un compte ? Se connecter
      </button>
    </form>
  );
}
