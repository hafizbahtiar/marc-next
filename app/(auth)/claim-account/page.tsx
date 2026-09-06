import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeading } from "@/components/auth/auth-heading";
import { ClaimAccountForm } from "@/components/auth/claim-account-form";
import { Notice } from "@/components/auth/notice";
import { ROUTES } from "@/lib/auth/routes";
import { paramPertama } from "@/lib/search-params";

export const metadata: Metadata = { title: "Tuntut akaun MARC" };

export default async function ClaimAccountPage({
  searchParams,
}: PageProps<"/claim-account">) {
  const token = paramPertama((await searchParams).token) ?? "";

  return (
    <>
      <AuthHeading
        tajuk={token ? "Tuntut akaun MARC" : "Cari akaun ahli lama"}
        perihal={
          token
            ? "Tetapkan kata laluan untuk mengaktifkan akaun ahli lama anda."
            : "Masukkan emel dan ID staff yang digunakan dalam rekod ahli MARC."
        }
      />
      {!token ? <Notice ralat="Pautan claim akan dihantar hanya jika maklumat sepadan dengan rekod yang telah disahkan." /> : null}
      <ClaimAccountForm token={token} />
      <Link href={ROUTES.logMasuk} className="text-center text-sm font-medium text-primary hover:underline">
        Kembali ke log masuk
      </Link>
    </>
  );
}
