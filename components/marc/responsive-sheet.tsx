"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRightIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResponsiveSheetItem({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const trigger = (
    <button
      type="button"
      className="flex min-h-16 w-full items-center gap-3 px-4 py-0 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{label}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </DrawerHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

const faqItems = [
  ["Bagaimana cara mendaftar sebagai ahli MARC?", "Daftar menggunakan emel anda. Pendaftaran perlu diluluskan oleh pihak pengurusan sebelum ciri penuh boleh digunakan."],
  ["Bagaimana cara sahkan emel saya?", "Pautan pengesahan dihantar selepas daftar atau log masuk. Semak folder spam atau gunakan butang hantar semula."],
  ["Apa beza role ahli dan pengurusan?", "Role pengurusan mempunyai kebenaran tambahan mengikut hierarki organisasi."],
  ["Adakah MARC aplikasi rasmi MAIWP?", "Bukan. MARC dibangunkan secara sukarela sebagai projek peribadi dan tidak diurus, ditaja, atau disahkan oleh MAIWP."],
];

export function SettingsFaqSheetContent() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map(([question, answer]) => (
        <AccordionItem key={question} value={question}>
          <AccordionTrigger className="text-left">{question}</AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-muted-foreground">{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function SettingsAboutSheetContent() {
  return (
    <div className="grid gap-5 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <InfoIcon className="size-7" />
      </div>
      <div className="grid gap-2">
        <p className="font-heading text-lg font-semibold">MARC</p>
        <p className="text-sm leading-6 text-muted-foreground">
          Aplikasi komuniti untuk berkongsi maklumat, pengumuman, dan berhubung sesama ahli.
        </p>
      </div>
      <p className="rounded-lg bg-muted p-4 text-left text-sm leading-6 text-muted-foreground">
        Ini bukan aplikasi rasmi MAIWP. MARC dibangunkan secara sukarela sebagai projek peribadi,
        dan tidak diurus, ditaja, atau disahkan oleh MAIWP.
      </p>
    </div>
  );
}

type FormField = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
};

type FormResult = { ok: boolean; message: string };

export function ResponsiveFormSheet({
  title,
  description,
  trigger,
  fields,
  submitLabel,
  onSubmit,
}: {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  fields: FormField[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<FormResult>;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [values, setValues] = React.useState<Record<string, string>>({});

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextValues = Object.fromEntries(fields.map((field) => [field.name, String(form.get(field.name) ?? "")]));
    setValues(nextValues);
    startTransition(async () => {
      const result = await onSubmit(nextValues);
      if (result.ok) setOpen(false);
    });
  }

  const form = (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4">
        {fields.map((field) => (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={`sheet-${field.name}`}>{field.label}</Label>
            <Input
              id={`sheet-${field.name}`}
              name={field.name}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue ?? values[field.name]}
              required={field.required ?? true}
              autoFocus={fields[0] === field}
            />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan…" : submitLabel}
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">{form}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="px-4 pb-6">{form}</div>
      </SheetContent>
    </Sheet>
  );
}
