import type { Metadata } from "next";

import { BorangLupaKataLaluan } from "@/components/auth/borang-lupa-kata-laluan";
import { TajukAuth } from "@/components/auth/tajuk";

export const metadata: Metadata = { title: "Lupa kata laluan" };

export default function LupaKataLaluanPage() {
  return (
    <>
      <TajukAuth
        tajuk="Lupa kata laluan"
        perihal="Masukkan emel akaun anda. Kami akan hantar pautan untuk menetapkan kata laluan baharu — pautan itu sah selama 1 jam."
      />
      <BorangLupaKataLaluan />
    </>
  );
}
