import { toast } from "sonner";

export const notifySuccess = (msg: string, description?: string) =>
  toast.success(msg, { description });

export const notifyError = (msg: string, description?: string) =>
  toast.error(msg, { description });

export const notifyWarning = (msg: string, description?: string) =>
  toast.warning(msg, { description });

export const notifyInfo = (msg: string, description?: string) =>
  toast.info(msg, { description });

export const notifyLoading = (msg: string, description?: string) =>
  toast.loading(msg, { description });

// For promise-based operations (show loading then success/failure):
export const notifyPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) =>
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
