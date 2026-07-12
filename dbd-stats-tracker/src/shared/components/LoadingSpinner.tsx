interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <p className="loading-spinner" role="status">
      <span className="loading-spinner-circle" aria-hidden="true" />
      {label}
    </p>
  );
}
