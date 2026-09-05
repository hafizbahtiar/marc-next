"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAddressAction, type AddressFormState } from "@/lib/profile/address-actions";

const states = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak",
  "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu",
  "Wilayah Persekutuan Kuala Lumpur", "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya",
];

const initialState: AddressFormState = {};

export function AddressForm() {
  const [state, formAction, pending] = useActionState(createAddressAction, initialState);
  const [type, setType] = useState<"landed" | "highrise">("landed");

  return (
    <form action={formAction} className="grid gap-5 rounded-xl border bg-card p-5">
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">{state.success}</p> : null}
      <input type="hidden" name="address_type" value={type} />
      <div className="grid gap-2">
        <Label>Jenis alamat</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["landed", "highrise"] as const).map((value) => (
            <Button key={value} type="button" variant={type === value ? "default" : "outline"} onClick={() => setType(value)}>
              {value === "landed" ? "Landed" : "Highrise"}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="unit_number" label={type === "highrise" ? "No. unit" : "No. rumah"} error={state.fields?.unit_number} placeholder={type === "highrise" ? "A-12-3" : "12"} />
        {type === "highrise" ? (
          <>
            <Field name="floor" label="Tingkat" error={state.fields?.floor} placeholder="12" />
            <Field name="block" label="Blok" error={state.fields?.block} placeholder="A" />
          </>
        ) : null}
        <Field name="street" label="Jalan" error={state.fields?.street} placeholder="Jalan Ampang" />
        <Field name="township" label="Taman" error={state.fields?.township} placeholder="Taman Melawati" />
        <Field name="city" label="Bandar" error={state.fields?.city} placeholder="Kuala Lumpur" />
        <Field name="postcode" label="Poskod" error={state.fields?.postcode} placeholder="53100" inputMode="numeric" />
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="state">Negeri</Label>
          <Select name="state" defaultValue="">
            <SelectTrigger id="state">
              <SelectValue placeholder="Pilih negeri" />
            </SelectTrigger>
            <SelectContent>
              {states.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
          {state.fields?.state ? <p className="text-xs text-destructive">{state.fields.state}</p> : null}
        </div>
      </div>
      <Separator />
      <label className="flex items-center justify-between gap-4 text-sm">
        <span>
          <span className="block font-medium">Jadikan alamat utama</span>
          <span className="text-xs text-muted-foreground">Alamat ini digunakan sebagai alamat default.</span>
        </span>
        <Switch name="is_default" />
      </label>
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan alamat"}</Button>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  placeholder,
  inputMode,
}: {
  name: string;
  label: string;
  error?: string;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} inputMode={inputMode} aria-invalid={Boolean(error)} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
