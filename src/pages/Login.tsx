import { Button } from "@/components";
import { useAuth } from "@/context/AuthProvider";
import { getGoogleAccessToken } from "@/lib/google";
import { notifyError, notifySuccess } from "@/lib/notification";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // TanStack Query mutation
  const mutation = useMutation({
    mutationFn: async (googleToken: string) => {
      return await authService.loginWithGoogle(googleToken);
    },
    onSuccess: (data) => {
      login(data.accessToken);
      notifySuccess("Login successful!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      notifyError(
        error?.message ||
          error.response?.data?.message ||
          "Login failed. Please try again."
      );
    },
  });

  // even handler

  const handleLogin = async () => {
    try {
      const googleToken = await getGoogleAccessToken();
      mutation.mutate(googleToken);
    } catch (err: any) {
      notifyError(err?.message || "Google login failed.");
    }
  };

  if (import.meta.env.VITE_MODE === "development") {
    return (
      <div className="flex h-screen items-center justify-center gap-4">
        🔐 Login Page (Public)
        <Button onClick={() => navigate("/dev-login")}>Dev Login</Button>
      </div>
    );
  }

  return (
    <div className="m-auto flex min-h-screen w-screen items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border border-neutral-300 bg-white p-8 text-center shadow">
        <h1 className="mb-4 text-2xl font-bold">Welcome Admin</h1>
        <Button
          className={cn(
            "w-3xs mx-auto",
            mutation.isPending
              ? "hover:cursor-not-allowed"
              : "hover:cursor-pointer"
          )}
          onClick={handleLogin}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Logging in..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
};

export default Login;
