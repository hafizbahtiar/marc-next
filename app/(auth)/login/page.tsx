import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { Notice } from "@/components/auth/notice";
import { AuthHeading } from "@/components/auth/auth-heading";
import { destinasiSelamat } from "@/lib/auth/routes";
import { paramPertama } from "@/lib/search-params";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = destinasiSelamat(paramPertama(params.next));
  const selepasReset = paramPertama(params.reset) === "berjaya";

  return (
    <>
      <AuthHeading
        tajuk="Log masuk"
        perihal="Masukkan emel dan kata laluan akaun MARC anda."
      />

      {selepasReset ? (
        <div className="mb-4">
          <Notice berjaya="Kata laluan anda telah ditukar. Sila log masuk dengan kata laluan baharu." />
        </div>
      ) : null}

      <LoginForm next={next} />
    </>
  );
}

