"use client";

import * as React from "react";

import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";

type NavigationAction = () => void;

export function useUnsavedChangesGuard(isDirty: boolean) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const pendingAction = React.useRef<NavigationAction | null>(null);
  const bypassPopState = React.useRef(false);
  const cleanRef = React.useRef(false);

  const markClean = React.useCallback(() => {
    cleanRef.current = true;
  }, []);

  const requestNavigation = React.useCallback((action: NavigationAction) => {
    if (!isDirty || cleanRef.current) {
      action();
      return;
    }
    pendingAction.current = action;
    setDialogOpen(true);
  }, [isDirty]);

  React.useEffect(() => {
    cleanRef.current = false;
    if (!isDirty) return;

    const guardedState = { ...(window.history.state ?? {}), __unsavedChangesGuard: true };
    window.history.pushState(guardedState, "", window.location.href);

    const handlePopState = () => {
      if (bypassPopState.current) {
        bypassPopState.current = false;
        return;
      }
      window.history.pushState(guardedState, "", window.location.href);
      pendingAction.current = () => {
        bypassPopState.current = true;
        window.history.back();
      };
      setDialogOpen(true);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const dialog = (
    <ConfirmationDialog
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
      title="Buang perubahan?"
      description="Maklumat yang telah diisi belum disimpan. Jika anda keluar sekarang, perubahan tersebut akan hilang."
      confirmLabel="Buang perubahan"
      cancelLabel="Teruskan edit"
      onConfirm={async () => {
        const action = pendingAction.current;
        pendingAction.current = null;
        markClean();
        action?.();
      }}
    />
  );

  return { markClean, requestNavigation, dialog };
}
