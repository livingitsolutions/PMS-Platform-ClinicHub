import { CircleAlert } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title, message, details, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4">
      <div className="flex gap-3">
        <CircleAlert className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          )}
          <p className="text-sm text-red-700">{message}</p>
          {details && (
            <p className="text-sm text-red-600 mt-2 font-mono text-xs bg-red-100 p-2 rounded">
              {details}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface QueryErrorAlertProps {
  error: Error | null;
  onRetry?: () => void;
}

export function QueryErrorAlert({ error, onRetry }: QueryErrorAlertProps) {
  if (!error) return null;

  return (
    <ErrorAlert
      title="Failed to load data"
      message={error.message || 'An unexpected error occurred'}
      onRetry={onRetry}
    />
  );
}
