// src/components/ErrorMessage.tsx

import { XCircle } from "lucide-react";
import { Button } from "./ui/button";

type ErrorMessageProps = {
  message?: string; // optional custom message
  onRetry?: () => void; // optional retry handler
  className?: string; // extra classes for layout
};

const ErrorMessage = ({
  message = "Something went wrong.",
  onRetry,
  className = "",
}: ErrorMessageProps) => {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-lg bg-red-50 p-6 ${className}`}
    >
      <XCircle className="mb-4 h-12 w-12 text-red-500" />
      <p className="mb-4 text-center text-red-700">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
