import { BackLink } from "@/components/ui/back-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <div className="mx-auto grid max-w-6xl gap-6">
      <BackLink href="/settings">Kembali ke Tetapan</BackLink>
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Bantuan</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Soalan lazim</h1>
      </header>
      <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
        {faqs.map(([question, answer]) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
