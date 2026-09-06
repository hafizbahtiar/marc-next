import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthHeading } from "@/components/auth/auth-heading";

export const metadata: Metadata = { title: "Lupa kata laluan" };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        tajuk="Lupa kata laluan"
        perihal="Masukkan emel akaun anda. Kami akan hantar pautan untuk menetapkan kata laluan baharu - pautan itu sah selama 1 jam."
      />
      <ForgotPasswordForm />
    </>
  );
}
