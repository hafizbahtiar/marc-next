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

function CertificatePreview({ values }: { values: CertificateTemplateInput }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="grid gap-3">
        <p className="text-sm font-medium">Pratonton sijil</p>
        <div className="aspect-[1.414/1] w-full max-w-full overflow-hidden rounded-xl border-8 bg-background p-5 shadow-sm sm:p-8" style={{ borderColor: values.primary_color }}>
          {values.logo_url ? <img src={values.logo_url} alt="" className="mx-auto mb-4 h-10 max-w-full object-contain" /> : null}
          <div className="grid h-full content-center gap-3 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: values.secondary_color }}>{values.subtitle || "MARC"}</p>
            <h2 className="font-heading text-xl font-bold sm:text-3xl" style={{ color: values.primary_color }}>{values.title || "Sijil Penyertaan"}</h2>
            <p className="text-xs leading-5 text-muted-foreground">{values.body_text || "Diberikan kepada [Nama penerima] atas penyertaan dalam aktiviti MARC."}</p>
            <div className="mt-4 grid gap-1 text-xs">
              <span className="font-semibold">{values.signature_name || "Nama penandatangan"}</span>
              <span className="text-muted-foreground">{values.issuer_name || "Penerbit sijil"}</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] text-muted-foreground">{values.footer_text || "Sijil ini dijana secara rasmi oleh MARC."}</p>
        </div>
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
