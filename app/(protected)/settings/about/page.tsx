import Link from "next/link";
import { InfoIcon } from "lucide-react";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Tentang" />
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Bantuan</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Tentang MARC</h1>
      </header>
      <div className="grid gap-6 rounded-xl border bg-card p-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <InfoIcon className="size-8" />
        </div>
        <div className="grid gap-2">
          <p className="text-lg font-semibold">MARC</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Aplikasi komuniti untuk berkongsi maklumat, pengumuman, dan berhubung sesama ahli.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Dibina secara sukarela atas permintaan kelab yang mencetuskan idea aplikasi ini.
          </p>
        </div>
        <p className="rounded-lg bg-muted p-4 text-left text-sm leading-6 text-muted-foreground">
          Ini bukan aplikasi rasmi MAIWP. MARC dibangunkan secara sukarela sebagai projek peribadi,
          dan tidak diurus, ditaja, atau disahkan oleh MAIWP.
        </p>
        <p className="text-sm text-muted-foreground">
          Dibangunkan oleh{" "}
          <Link className="text-primary underline underline-offset-4" href="https://hafizbahtiar.com">
            hafizbahtiar.com
          </Link>
        </p>
      </div>
    </div>
  );
}
