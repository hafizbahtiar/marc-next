"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeClaimAction, requestClaimAction, type ClaimActionResult } from "@/lib/auth/claim-actions";

export function ClaimAccountForm({ token }: { token: string }) {
  const [state, action] = useActionState<ClaimActionResult | undefined, FormData>(
    token ? completeClaimAction : requestClaimAction,
    undefined,
  );

  if (token) {
    return (
      <form action={action} className="grid gap-4">
        <input type="hidden" name="token" value={token} />
        {state ? <ClaimNotice state={state} /> : null}
        {state?.ok ? (
          <Link href="/login" className="text-center text-sm font-medium text-primary hover:underline">
            Log masuk ke MARC
          </Link>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="password">Kata laluan baharu</Label>
              <Input id="password" name="password" type="password" minLength={6} autoComplete="new-password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password_confirmation">Ulang kata laluan</Label>
              <Input id="password_confirmation" name="password_confirmation" type="password" minLength={6} autoComplete="new-password" required />
            </div>
            <Button type="submit">Tetapkan kata laluan</Button>
          </>
        )}
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      {state ? <ClaimNotice state={state} /> : null}
      {!state?.ok ? (
        <>
          <div className="grid gap-2">
            <Label htmlFor="email">Emel yang didaftarkan</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="staff_id">ID staff</Label>
            <Input id="staff_id" name="staff_id" autoComplete="off" required />
          </div>
          <Button type="submit">Hantar pautan claim</Button>
        </>
      ) : null}
    </form>
  );
}

function ClaimNotice({ state }: { state: ClaimActionResult }) {
  return state.ok ? (
    <Alert>
      <AlertTitle>Permintaan diterima</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  ) : (
    <Alert variant="destructive">
      <AlertTitle>Tidak dapat meneruskan</AlertTitle>
      <AlertDescription>{state.error}</AlertDescription>
    </Alert>
  );
}
