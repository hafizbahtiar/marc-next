import type { Metadata } from "next";

import { BorangLogMasuk } from "@/components/auth/borang-log-masuk";
import { Notis } from "@/components/auth/notis";
import { TajukAuth } from "@/components/auth/tajuk";
import { destinasiSelamat } from "@/lib/auth/routes";
import { paramPertama } from "@/lib/search-params";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LogMasukPage({ searchParams }: PageProps<"/log-masuk">) {
  const params = await searchParams;
  const next = destinasiSelamat(paramPertama(params.next));
  const selepasReset = paramPertama(params.reset) === "berjaya";

  return (
    <>
      <TajukAuth
        tajuk="Log masuk"
        perihal="Masukkan emel dan kata laluan akaun MARC anda."
      />

      {selepasReset ? (
        <div className="mb-4">
          <Notis berjaya="Kata laluan anda telah ditukar. Sila log masuk dengan kata laluan baharu." />
        </div>
      ) : null}

      <BorangLogMasuk next={next} />
    </>
  );
}

