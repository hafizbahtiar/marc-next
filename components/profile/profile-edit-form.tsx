"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/api/types";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { mintaUploadURLAction } from "@/lib/posts/actions";
import { kemaskiniProfilAction } from "@/lib/profil/actions";

const JENIS_DIBENARKAN = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [keadaan, formAction] = useActionState(kemaskiniProfilAction, KEADAAN_AWAL);
  const [pratontonAvatar, setPratontonAvatar] = useState<string | null>(profile.avatar_url);
  const [avatarR2Key, setAvatarR2Key] = useState<string | undefined>(undefined);
  const [ralatAvatar, setRalatAvatar] = useState<string | null>(null);
  const [memuatNaik, setMemuatNaik] = useState(false);
  const inputFailRef = useRef<HTMLInputElement>(null);

  async function chooseAvatar(file: File | undefined) {
    if (!file) return;
    if (!JENIS_DIBENARKAN.has(file.type)) {
      setRalatAvatar("Jenis fail tidak disokong.");
      return;
    }
    setRalatAvatar(null);
    setMemuatNaik(true);
    try {
      const hasilPresign = await mintaUploadURLAction(file.type);
      if (!hasilPresign.ok) {
        setRalatAvatar(hasilPresign.ralat);
        return;
      }
      const respons = await fetch(hasilPresign.data.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!respons.ok) throw new Error("upload gagal");
      setPratontonAvatar(URL.createObjectURL(file));
      setAvatarR2Key(hasilPresign.data.r2_key);
    } catch {
      setRalatAvatar("Gagal muat naik gambar.");
    } finally {
      setMemuatNaik(false);
      if (inputFailRef.current) inputFailRef.current.value = "";
    }
  }

  function removeAvatar() {
    setPratontonAvatar(null);
    setAvatarR2Key("");
  }

  return (
    <form action={formAction} className="grid gap-6">
      {keadaan.ralat ? <p className="text-sm text-destructive">{keadaan.ralat}</p> : null}

      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {pratontonAvatar ? <AvatarImage src={pratontonAvatar} alt="" /> : null}
          <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">
            {(profile.display_name?.trim() || profile.email).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={memuatNaik}
              onClick={() => inputFailRef.current?.click()}
            >
              {memuatNaik ? "Memuat naik…" : "Tukar gambar"}
            </Button>
            {pratontonAvatar ? (
              <ConfirmationDialog
                title="Buang gambar profil?"
                description="Gambar profil yang dipilih akan dibuang daripada perubahan anda."
                confirmLabel="Buang gambar"
                trigger={<Button type="button" size="sm" variant="ghost">Buang</Button>}
                onConfirm={async () => {
                  removeAvatar();
                }}
              />
            ) : null}
          </div>
          {ralatAvatar ? <p className="text-xs text-destructive">{ralatAvatar}</p> : null}
        </div>
        <input
          ref={inputFailRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => chooseAvatar(e.target.files?.[0])}
        />
      </div>
      {avatarR2Key !== undefined ? (
        <input type="hidden" name="avatar_r2_key" value={avatarR2Key} />
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="display_name">Nama paparan</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={keadaan.nilai?.display_name ?? profile.display_name ?? ""}
          maxLength={100}
          aria-invalid={Boolean(keadaan.medan?.display_name)}
        />
        {keadaan.medan?.display_name ? (
          <p className="text-xs text-destructive">{keadaan.medan.display_name}</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">No. telefon</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={keadaan.nilai?.phone ?? profile.phone ?? ""}
          maxLength={30}
          aria-invalid={Boolean(keadaan.medan?.phone)}
        />
        {keadaan.medan?.phone ? (
          <p className="text-xs text-destructive">{keadaan.medan.phone}</p>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-border/70 pt-4">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Waris
        </h2>
        <div className="grid gap-1.5">
          <Label htmlFor="emergency_contact_name">Nama waris</Label>
          <Input
            id="emergency_contact_name"
            name="emergency_contact_name"
            defaultValue={
              keadaan.nilai?.emergency_contact_name ?? profile.emergency_contact_name ?? ""
            }
            maxLength={100}
            aria-invalid={Boolean(keadaan.medan?.emergency_contact_name)}
          />
          {keadaan.medan?.emergency_contact_name ? (
            <p className="text-xs text-destructive">{keadaan.medan.emergency_contact_name}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="emergency_contact_phone">No. telefon waris</Label>
          <Input
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            defaultValue={
              keadaan.nilai?.emergency_contact_phone ?? profile.emergency_contact_phone ?? ""
            }
            maxLength={30}
            aria-invalid={Boolean(keadaan.medan?.emergency_contact_phone)}
          />
          {keadaan.medan?.emergency_contact_phone ? (
            <p className="text-xs text-destructive">{keadaan.medan.emergency_contact_phone}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5 border-t border-border/70 pt-4">
        <Label htmlFor="health_notes">Nota kesihatan</Label>
        <Textarea
          id="health_notes"
          name="health_notes"
          defaultValue={keadaan.nilai?.health_notes ?? profile.health_notes ?? ""}
          maxLength={500}
          placeholder="Alahan, kondisi, atau nota (pilihan)"
          aria-invalid={Boolean(keadaan.medan?.health_notes)}
        />
        {keadaan.medan?.health_notes ? (
          <p className="text-xs text-destructive">{keadaan.medan.health_notes}</p>
        ) : null}
      </div>

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending ? "Menyimpan…" : "Simpan"}
    </Button>
  );
}
