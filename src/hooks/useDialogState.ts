import { ReactNode, useCallback, useState } from "react";

type BaseDialogState = {
  isOpen: boolean;
  message: string | ReactNode;
  mantraId: string;
  mantraTitle: string;
  [keyof: string]: any;
};

// common dialog state
export function useDialogState<T extends BaseDialogState>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const open = useCallback((data: Omit<T, "isOpen">) => {
    setState({ ...data, isOpen: true } as T);
  }, []);

  const close = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return { state, open, close };
}

// Hook for Alert Dialog (activate/make seller/etc)
type AlertDialogState = BaseDialogState & {
  action: string; // "activate" | "make_seller" | "deactivate" | etc
};

// alert only
export function useAlertDialog() {
  return useDialogState<AlertDialogState>({
    isOpen: false,
    message: "",
    mantraId: "",
    mantraTitle: "",
    action: "",
  });
}

// Hook for Reason Dialog (inactivate/reject/etc)
type ReasonDialogState = BaseDialogState;

// reason only
export function useReasonDialog() {
  return useDialogState<ReasonDialogState>({
    isOpen: false,
    message: "",
    mantraId: "",
    mantraTitle: "",
  });
}

// both
export function useConfirmationDialogs() {
  const alertDialog = useAlertDialog();
  const reasonDialog = useReasonDialog();

  return {
    alert: alertDialog,
    reason: reasonDialog,
  };
}

export function useMantraDialog() {
  return useDialogState<any>({
    isOpen: false,
    mode: "create",
    mantraId: "",
  });
}
export function useStoryDialog() {
  return useDialogState<any>({
    isOpen: false,
    mode: "create",
    mantraId: "",
  });
}

// ============================================
// USAGE EXAMPLE IN COMPONENTS
// ============================================

/*
// In UserManagement.tsx
const { alert, reason } = useConfirmationDialogs();

// Open alert dialog
alert.open({
  message: "Activate user?",
  userId: "123",
  userName: "John",
  action: "activate",
});

// Open reason dialog
reason.open({
  message: "Inactivate user?",
  userId: "123",
  userName: "John",
});

// Close dialogs
alert.close();
reason.close();

// Render dialogs
<AlertDialog isOpen={alert.state.isOpen} ... />
<ReasonDialog isOpen={reason.state.isOpen} ... />
*/
