"use client";

import { useFormStatus } from "react-dom";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Butang hantar yang tahu sendiri bila borangnya sedang dihantar.
 *
 * `useFormStatus` dibaca daripada borang INDUK, jadi komponen ini mesti
 * kekal sebagai anak `<form>` dan bukan dirender bersama borang itu.
 * Ini mengelakkan setiap borang daripada memacu keadaan `pending`nya
 * sendiri.
 */
export function ButangHantar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className ?? "h-10 w-full rounded-md text-sm"}
    >
      {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
