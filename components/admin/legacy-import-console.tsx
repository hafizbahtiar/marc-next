"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, CheckCircle2Icon, FileUpIcon, UploadCloudIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { importLegacyBatchAction, dryRunLegacyImportAction } from "@/lib/admin/legacy-import-actions";
import type { LegacyImportBatch } from "@/lib/admin/legacy-import-api";

export function LegacyImportConsole({ batches }: { batches: LegacyImportBatch[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string }>();
  const [report, setReport] = useState<Record<string, unknown>>();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await dryRunLegacyImportAction(form);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setReport(result.data);
      setMessage({ kind: "success", text: "Dry-run selesai. Semak konflik sebelum import." });
      router.refresh();
    });
  }

  function runImport(id: string) {
    startTransition(async () => {
      const result = await importLegacyBatchAction(id);
      setMessage(
        result.ok
          ? { kind: "success", text: "Baris yang telah dipadankan dengan akaun berjaya diimport." }
          : { kind: "error", text: result.error },
      );
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-5">
      {message ? (
        <Alert variant={message.kind === "error" ? "destructive" : "default"}>
          {message.kind === "error" ? <AlertCircleIcon /> : <CheckCircle2Icon />}
          <AlertTitle>{message.kind === "error" ? "Import tidak berjaya" : "Import diproses"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jalankan dry-run CSV</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Dry-run hanya membaca dan menyimpan laporan konflik. Ia tidak mencipta atau mengubah akaun ahli.
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}>
            <div className="grid flex-1 gap-2">
              <label htmlFor="legacy-member-csv" className="text-sm font-medium">Fail CSV ahli lama</label>
              <Input id="legacy-member-csv" name="file" type="file" accept=".csv,text/csv" required />
            </div>
            <Button type="submit" disabled={pending}>
              <UploadCloudIcon />
              {pending ? "Menyemak…" : "Semak CSV"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {report ? (
        <Alert>
          <FileUpIcon />
          <AlertTitle>Laporan dry-run baharu</AlertTitle>
          <AlertDescription>
            {String(report.total_rows)} baris dibaca, {String(report.valid_rows)} lulus dan {String(report.conflict_rows)} mempunyai konflik.
            {Number(report.warnings) > 0 ? ` ${String(report.warnings)} telefon dikosongkan sebagai warning.` : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batch import terdahulu</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada dry-run.</p>
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Fail</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Baris</th>
                  <th className="px-3 py-2 font-medium">Konflik</th>
                  <th className="px-3 py-2 font-medium">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-b last:border-0">
                    <td className="px-3 py-3 font-medium">{batch.source_filename}</td>
                    <td className="px-3 py-3">{batch.status}</td>
                    <td className="px-3 py-3">{batch.valid_rows}/{batch.total_rows}</td>
                    <td className="px-3 py-3">{batch.conflict_rows}</td>
                    <td className="px-3 py-3">
                      {batch.status !== "imported" && batch.valid_rows > 0 ? (
                        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => runImport(batch.id)}>
                          <FileUpIcon />
                          Import baris lulus
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {batches.map((batch) => (
        <Card key={`${batch.id}-rows`}>
          <CardHeader>
            <CardTitle className="text-base">
              Senarai row: {batch.source_filename}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Semua {batch.total_rows} row dipaparkan. Row merah mempunyai konflik dan tidak akan diimport.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Ahli</th>
                  <th className="px-3 py-2 font-medium">Emel</th>
                  <th className="px-3 py-2 font-medium">Bahagian</th>
                  <th className="px-3 py-2 font-medium">Akaun</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {batch.rows?.map((row) => {
                  const hasConflict = row.conflicts.length > 0 || row.status === "conflict";
                  return (
                    <tr key={row.id} className={hasConflict ? "border-b bg-destructive/5 align-top" : "border-b align-top"}>
                      <td className="px-3 py-3">{row.source_row}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{row.display_name || "Tanpa nama"}</p>
                        <p className="text-xs text-muted-foreground">{row.member_id || "No. ahli tiada"}</p>
                      </td>
                      <td className="px-3 py-3">{row.email}</td>
                      <td className="px-3 py-3">{row.department_code || "—"}</td>
                      <td className="px-3 py-3">
                        {row.user_id ? (
                          <span className="text-emerald-700 dark:text-emerald-400">Dipadankan</span>
                        ) : (
                          <span className="text-muted-foreground">Belum ada akaun</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {hasConflict ? (
                          <div className="grid gap-1 text-destructive">
                            <span className="font-medium">Konflik</span>
                            {row.conflicts.map((conflict) => (
                              <span key={conflict.code} className="text-xs">
                                {conflict.message}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {row.status === "imported" ? "Sudah diimport" : "Lulus"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
