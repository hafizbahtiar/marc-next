import type { Metadata } from "next";
import Link from "next/link";

import { BorangTetapKataLaluan } from "@/components/auth/borang-tetap-kata-laluan";
import { Notis } from "@/components/auth/notis";
import { TajukAuth } from "@/components/auth/tajuk";
import { ROUTES } from "@/lib/auth/routes";
import { paramPertama } from "@/lib/search-params";

export const metadata: Metadata = { title: "Tetapkan kata laluan" };

export default async function TetapKataLaluanPage({
  searchParams,
}: PageProps<"/tetap-kata-laluan">) {
  const token = paramPertama((await searchParams).token) ?? "";

  // Token TIDAK ditebus semasa memuatkan halaman. `ConsumePasswordResetToken`
  // di backend memadam baris itu pada percubaan pertama, jadi pengesahan
  // awal di sini akan menghanguskan pautan sebelum ahli sempat menaip
  // apa-apa — dan pra-lawatan pautan oleh klien emel akan
  // melakukannya untuknya.
  if (!token) {
    return (
      <>
        <TajukAuth
          tajuk="Pautan tidak lengkap"
          perihal="Pautan reset yang anda buka tiada token."
        />
        <div className="grid gap-4">
          <Notis ralat="Buka semula pautan penuh daripada emel, atau minta pautan baharu." />
          <Link
            href={ROUTES.lupaKataLaluan}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Minta pautan reset baharu
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TajukAuth
        tajuk="Tetapkan kata laluan baharu"
        perihal="Pilih kata laluan baharu untuk akaun MARC anda."
      />
      <BorangTetapKataLaluan token={token} />
    </>
  );
}
