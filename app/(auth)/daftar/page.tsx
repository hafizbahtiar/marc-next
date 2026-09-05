import type { Metadata } from "next";

import { BorangDaftar } from "@/components/auth/borang-daftar";
import { TajukAuth } from "@/components/auth/tajuk";

export const metadata: Metadata = { title: "Daftar akaun" };

export default function DaftarPage() {
  return (
    <>
      <TajukAuth
        tajuk="Daftar akaun MARC"
        perihal="Selepas mendaftar, pihak pengurusan akan menyemak nombor staf anda sebelum akaun diluluskan."
      />
      <BorangDaftar />
    </>
  );
}
