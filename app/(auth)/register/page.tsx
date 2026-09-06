import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthHeading } from "@/components/auth/auth-heading";

export const metadata: Metadata = { title: "Daftar akaun" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading
        tajuk="Daftar akaun MARC"
        perihal="Selepas mendaftar, pihak pengurusan akan menyemak nombor staf anda sebelum akaun diluluskan."
      />
      <RegisterForm />
    </>
  );
}
