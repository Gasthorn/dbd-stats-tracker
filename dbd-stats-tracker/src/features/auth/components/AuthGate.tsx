import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../stores/auth.store";
import { AuthPage } from "./AuthPage";
import "./auth.css";

interface AuthGateProps {
  children: ReactNode;
}

/** Renders the sign-in/sign-up screen until a session exists, then renders the app. */
export function AuthGate({ children }: AuthGateProps) {
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initialize();
    return unsubscribe;
  }, []);

  if (isInitializing) {
    return (
      <div className="auth-loading">
        <p>Chargement...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <AuthPage />;
  }

  return <>{children}</>;
}
