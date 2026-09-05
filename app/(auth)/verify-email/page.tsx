import type { Metadata } from "next";
import Link from "next/link";

import { BorangSahkanEmel } from "@/components/auth/borang-sahkan-emel";
import { Notis } from "@/components/auth/notis";
import { TajukAuth } from "@/components/auth/tajuk";
import { ROUTES } from "@/lib/auth/routes";
import { paramPertama } from "@/lib/search-params";

export const metadata: Metadata = { title: "Sahkan emel" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const token = paramPertama((await searchParams).token) ?? "";

  if (!token) {
    return (
      <>
        <TajukAuth
          tajuk="Pautan tidak lengkap"
          perihal="Pautan pengesahan yang anda buka tiada token."
        />
        <div className="grid gap-4">
          <Notis ralat="Buka semula pautan penuh daripada emel MARC, atau minta pautan baharu selepas log masuk." />
          <Link
            href={ROUTES.logMasuk}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Ke log masuk
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TajukAuth
        tajuk="Sahkan emel anda"
        perihal="Klik butang di bawah untuk mengesahkan alamat emel akaun MARC anda. Pautan ini sah selama 1 jam dari masa ia dihantar."
      />
      <BorangSahkanEmel token={token} />
    </>
  );
}
