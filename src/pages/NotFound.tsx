// src/components/NotFound.tsx
import { Button } from "@/components";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NotFoundProps = {
  message?: string; // Optional custom message
  redirectPath?: string; // Optional redirect path (default = "/")
  buttonText?: string; // Optional button text (default = "Go Home")
  className?: string; // Extra classes
};

const NotFound = ({
  message = "Page not found",
  redirectPath = "/",
  buttonText = "Go Home",
  className = "",
}: NotFoundProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex h-screen w-full flex-col items-center justify-center p-6 ${className}`}
    >
      <AlertCircle className="mb-4 h-20 w-20 text-gray-400" />
      <h1 className="mb-2 text-3xl font-bold">{message}</h1>
      <p className="mb-6 text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Button
        onClick={() => navigate(redirectPath)}
        className="rounded bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default NotFound;
