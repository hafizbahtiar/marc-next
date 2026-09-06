"use client";

import { useState, useTransition } from "react";
import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { useUnsavedChangesGuard } from "@/components/marc/unsaved-changes-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CertificateTemplate, CertificateTemplateInput } from "@/lib/admin/certificate-templates-api";
import {
  publishCertificateTemplateAction,
  updateCertificateTemplateAction,
} from "@/lib/admin/certificate-templates-actions";

const DEFAULT_TEMPLATE_VALUES: CertificateTemplateInput = {
  name: "Template MARC Standard",
  primary_color: "#E21E28",
  secondary_color: "#223145",
  logo_url: "/marc-logo-penuh.png",
  title: "Sijil Penyertaan",
  subtitle: "MARC",
  body_text: "Diberikan kepada [Nama penerima] atas penyertaan dalam aktiviti MARC.",
  issuer_name: "MARC",
  signature_name: "Pengurusan MARC",
  footer_text: "Sijil ini dijana secara rasmi oleh MARC.",
};

export function CertificateTemplateForm({ template }: { template: CertificateTemplate }) {
  const [values, setValues] = useState<CertificateTemplateInput>(toInput(template));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [initialValues] = useState(() => JSON.stringify(values));
  const { markClean, requestNavigation, dialog } = useUnsavedChangesGuard(
    initialValues !== JSON.stringify(values),
  );

  function update(key: keyof CertificateTemplateInput, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function save(publish = false) {
    setError(null);
    startTransition(async () => {
      const result = await updateCertificateTemplateAction(template.id, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (publish) {
        const published = await publishCertificateTemplateAction(template.id);
        if (!published.ok) {
          setError(published.error);
          return;
        }
      }
      markClean();
      toast.success(publish ? "Template diterbitkan." : "Template disimpan.");
    });
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="grid gap-6">
        <div>
          <Button type="button" variant="ghost" onClick={() => requestNavigation(() => window.history.back())}>
            <ArrowLeftIcon />
            Kembali
          </Button>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Template tidak dapat disimpan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="grid gap-2">
            <label htmlFor="template-name" className="text-sm font-medium">Nama template</label>
            <Input id="template-name" value={values.name} onChange={(event) => update("name", event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField id="template-primary" label="Warna utama" value={values.primary_color} onChange={(value) => update("primary_color", value)} />
            <ColorField id="template-secondary" label="Warna sekunder" value={values.secondary_color} onChange={(value) => update("secondary_color", value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="template-logo" className="text-sm font-medium">URL logo</label>
            <Input id="template-logo" type="url" value={values.logo_url ?? ""} onChange={(event) => update("logo_url", event.target.value)} placeholder="https://…" />
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
          <TextField id="template-title" label="Tajuk sijil" value={values.title} onChange={(value) => update("title", value)} />
          <TextField id="template-subtitle" label="Subtajuk" value={values.subtitle} onChange={(value) => update("subtitle", value)} />
          <TextAreaField id="template-body" label="Teks utama" value={values.body_text} onChange={(value) => update("body_text", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="template-issuer" label="Nama penerbit" value={values.issuer_name} onChange={(value) => update("issuer_name", value)} />
            <TextField id="template-signature" label="Nama penandatangan" value={values.signature_name} onChange={(value) => update("signature_name", value)} />
          </div>
          <TextAreaField id="template-footer" label="Footer" value={values.footer_text} onChange={(value) => update("footer_text", value)} />
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setValues(DEFAULT_TEMPLATE_VALUES)}>
            <RotateCcwIcon />
            Reset kepada default
          </Button>
          <Button type="button" variant="outline" onClick={() => requestNavigation(() => window.history.back())}>Batal</Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => save()}>{pending ? "Menyimpan…" : "Simpan draf"}</Button>
          <Button type="button" disabled={pending} onClick={() => save(true)}>{pending ? "Memproses…" : "Simpan dan terbitkan"}</Button>
        </div>
      </div>
      <CertificatePreview values={values} />
      {dialog}
    </div>
  );
}

// Fallback SAMA seperti defaultTemplateStyle() dalam
// marc_go/internal/certificate/certificate.go. Kalau yang sana berubah,
// yang sini kena ikut - kalau tidak pratonton menipu.
const FALLBACK = {
  primary_color: "#105e4a",
  secondary_color: "#093d30",
  title: "SIJIL PENYERTAAN",
  subtitle: "Dengan ini disahkan bahawa",
  body_text: "telah menyertai",
};

// Bahagian per-sijil: bukan sebahagian template, jadi ia contoh sahaja.
const CONTOH = {
  serial: "MARC-2026-0001",
  recipient: "Ahmad bin Abdullah",
  activity: "Gotong-Royong Perdana MARC",
  meta: "Kemasyarakatan  •  6 September 2026",
};

const MUTED = "#6e747a";

// Saiz fon fpdf dalam pt; viewBox SVG dalam mm. 1pt = 25.4/72 mm.
const pt = (size: number) => size * (25.4 / 72);

// Cermin hexColor() dalam certificate.go: apa-apa yang bukan 6 digit hex
// jatuh balik ke warna lalai, jadi warna tak sah dipratonton sebagaimana
// ia akan dicetak - bukan sebagaimana ia ditaip.
function hexColor(value: string, fallback: string) {
  const hex = value.startsWith("#") ? value.slice(1) : value;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : fallback;
}

// templateStyle() menyemak `== ""` tanpa trim - ikut sama.
function orFallback(value: string, fallback: string) {
  return value === "" ? fallback : value;
}

// CertificatePreview melukis semula susun atur GeneratePDF dalam SVG,
// dalam sistem koordinat yang sama (A4 landskap, 297x210mm). Setiap
// kedudukan di bawah datang terus daripada drawBorder/drawHeading/
// drawRecipient/drawFooter, termasuk cMargin 1mm fpdf pada teks rata
// kiri/kanan dan pemusatan menegak dalam setiap sel.
//
// Teks yang terlalu panjang SENGAJA dibiar melimpah keluar viewBox:
// GeneratePDF tidak memotong medan template, jadi pratonton yang
// membalut teks akan menyembunyikan sijil yang rosak.
function CertificatePreview({ values }: { values: CertificateTemplateInput }) {
  const primary = hexColor(values.primary_color, FALLBACK.primary_color);
  const secondary = hexColor(values.secondary_color, FALLBACK.secondary_color);
  const title = orFallback(values.title, FALLBACK.title);
  const subtitle = orFallback(values.subtitle, FALLBACK.subtitle);
  const bodyText = orFallback(values.body_text, FALLBACK.body_text);

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="grid gap-3">
        <p className="text-sm font-medium">Pratonton sijil</p>
        <svg
          viewBox="0 0 297 210"
          role="img"
          aria-label={`Pratonton sijil ${title}`}
          xmlSpace="preserve"
          className="w-full rounded-xl border shadow-sm"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          <rect x="0" y="0" width="297" height="210" fill="#ffffff" />

          {/* drawBorder */}
          <rect x="0" y="0" width="297" height="14" fill={primary} />
          <rect x="0" y="14" width="297" height="1.6" fill={secondary} />
          <rect x="10" y="22" width="277" height="178" fill="none" stroke={primary} strokeWidth="0.6" />

          {/* drawHeading - "MARC" dikodkan keras dalam PDF, bukan issuer_name */}
          <text x="21" y="7" fill="#ffffff" fontSize={pt(15)} fontWeight="700" dominantBaseline="central">
            MARC
          </text>
          <text x="148.5" y="49" fill={primary} fontSize={pt(30)} fontWeight="700" textAnchor="middle" dominantBaseline="central">
            {title}
          </text>
          <text x="148.5" y="60" fill={MUTED} fontSize={pt(11)} textAnchor="middle" dominantBaseline="central">
            {subtitle}
          </text>

          {/* drawRecipient */}
          <text x="148.5" y="85" fill={secondary} fontSize={pt(26)} fontWeight="700" textAnchor="middle" dominantBaseline="central">
            {CONTOH.recipient}
          </text>
          <text x="148.5" y="96" fill={MUTED} fontSize={pt(11)} textAnchor="middle" dominantBaseline="central">
            {bodyText}
          </text>
          <text x="148.5" y="105" fill={primary} fontSize={pt(16)} fontWeight="700" textAnchor="middle" dominantBaseline="central">
            {CONTOH.activity}
          </text>
          <text x="148.5" y="113.5" fill={MUTED} fontSize={pt(11)} textAnchor="middle" dominantBaseline="central">
            {CONTOH.meta}
          </text>

          {/* drawFooter - kod QR sebenar dijana per-sijil daripada URL sahih */}
          <rect x="249" y="152" width="28" height="28" fill="#f1f2f4" stroke="#d6d9dd" strokeWidth="0.4" />
          <rect x="252" y="155" width="6" height="6" fill="#c3c7cc" />
          <rect x="268" y="155" width="6" height="6" fill="#c3c7cc" />
          <rect x="252" y="171" width="6" height="6" fill="#c3c7cc" />
          <text x="263" y="167" fill="#9aa0a6" fontSize={pt(7)} textAnchor="middle" dominantBaseline="central">
            QR
          </text>
          <text x="21" y="168.5" fill={MUTED} fontSize={pt(9)} dominantBaseline="central">
            {`No. Sijil  ${CONTOH.serial}`}
          </text>
          <text x="21" y="173.5" fill={MUTED} fontSize={pt(9)} dominantBaseline="central">
            {values.footer_text}
          </text>
          <text x="276" y="168.5" fill={MUTED} fontSize={pt(9)} textAnchor="end" dominantBaseline="central">
            {values.signature_name}
          </text>
          <text x="276" y="173.5" fill={MUTED} fontSize={pt(9)} textAnchor="end" dominantBaseline="central">
            {values.issuer_name}
          </text>
        </svg>

        <p className="text-xs leading-5 text-muted-foreground">
          Susun atur mengikut PDF sebenar. Nama penerima, nama aktiviti, nombor siri dan kod QR di atas
          hanyalah contoh - setiap sijil mengisinya sendiri.
        </p>
        {values.logo_url ? (
          <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
            Logo belum digunakan pada PDF sijil, jadi ia tidak dipratonton di sini.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function toInput(template: CertificateTemplate): CertificateTemplateInput {
  return {
    ...DEFAULT_TEMPLATE_VALUES,
    name: template.name,
    primary_color: template.primary_color,
    secondary_color: template.secondary_color,
    logo_url: template.logo_url || DEFAULT_TEMPLATE_VALUES.logo_url,
    title: template.title,
    subtitle: template.subtitle,
    body_text: template.body_text,
    issuer_name: template.issuer_name,
    signature_name: template.signature_name,
    footer_text: template.footer_text,
  };
}

function TextField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="grid gap-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function TextAreaField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="grid gap-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24" /></div>;
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const presets = [
    { value: "#E21E28", label: "Merah MARC" },
    { value: "#223145", label: "Navy MARC" },
    { value: "#2D3089", label: "Royal blue MARC" },
    { value: "#FAF8F7", label: "Surface MARC" },
  ];
  const colorValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : presets[0].value;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input id={id} type="color" value={colorValue} onChange={(event) => onChange(event.target.value.toUpperCase())} className="w-12 p-1" />
        <Input aria-label={`${label} HEX`} value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} placeholder="#E21E28" />
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label={`Preset ${label}`}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.label}
            aria-label={`Pilih ${preset.label}`}
            className="size-6 rounded-full border border-black/15 ring-offset-2 transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: preset.value }}
            onClick={() => onChange(preset.value)}
          />
        ))}
      </div>
    </div>
  );
}
