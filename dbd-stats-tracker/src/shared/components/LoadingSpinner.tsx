import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  const { t } = useTranslation();
  return (
    <p className="loading-spinner" role="status">
      <span className="loading-spinner-circle" aria-hidden="true" />
      {label ?? t("common.loading")}
    </p>
  );
}
