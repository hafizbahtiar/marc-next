import { ChevronDownIcon } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";

const faqs = [
  ["Bagaimana cara mendaftar sebagai ahli MARC?", "Daftar menggunakan emel anda dalam skrin pendaftaran. Pendaftaran perlu diluluskan oleh pihak pengurusan MARC sebelum anda boleh mengakses ciri penuh aplikasi."],
  ["Kenapa saya masih tidak boleh akses feed selepas daftar?", "Pendaftaran mungkin masih menunggu kelulusan atau emel anda belum disahkan. Semak halaman utama untuk status terkini."],
  ["Bagaimana cara sahkan emel saya?", "Pautan pengesahan dihantar selepas anda daftar atau log masuk. Semak folder spam atau gunakan butang hantar semula pada skrin pengesahan emel."],
  ["Apa beza role Ahli, Supervisor, Manager, dan Super Admin?", "Ahli ialah role asas. Role pengurusan mempunyai kebenaran tambahan mengikut hierarki organisasi."],
  ["Bagaimana cara buat post baru?", "Tekan butang + pada skrin utama, tulis kandungan atau lampirkan gambar, kemudian tekan Hantar."],
  ["Adakah MARC aplikasi rasmi MAIWP?", "Bukan. MARC dibangunkan secara sukarela sebagai projek peribadi dan tidak diurus, ditaja, atau disahkan oleh MAIWP."],
  ["Saya ada masalah lain, macam mana nak hubungi pihak pengurusan?", "Hubungi pihak pengurusan MARC yang menguruskan aplikasi ini."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <BackLink href="/settings">Kembali ke Tetapan</BackLink>
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Bantuan</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Soalan lazim</h1>
      </header>
      <div className="overflow-hidden rounded-xl border bg-card">
        {faqs.map(([question, answer]) => (
          <details key={question} className="group border-b last:border-0">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex-1">{question}</span>
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
