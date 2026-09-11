interface Props {
  message: string | null;
}

export function ErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="polite" className="error-banner">
      {message}
    </div>
  );
}
