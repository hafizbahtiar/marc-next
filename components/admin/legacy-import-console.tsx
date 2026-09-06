"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CopyIcon,
  FileUpIcon,
  UploadCloudIcon,
  WrenchIcon,
} from "lucide-react";

import { DataTable, DataTableColumnHeader, type DataTableFilter } from "@/components/marc/data-table";
import { ResponsiveDetailsSheet } from "@/components/marc/responsive-sheet";
import { StatusBadge, type StatusTone } from "@/components/marc/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  importLegacyBatchAction,
  dryRunLegacyImportAction,
  resolveLegacyImportDepartmentAction,
  updateLegacyImportRowAction,
} from "@/lib/admin/legacy-import-actions";
import { ringkasanKonflik, teksRingkasanKonflik } from "@/lib/admin/legacy-import-conflicts";
import type { LegacyImportBatch, LegacyImportRow } from "@/lib/admin/legacy-import-api";

type Mesej = { kind: "error" | "success"; text: string };
type Bahagian = { code: string; name: string };

/**
 * Konflik No. ID. yang diselesaikan dengan membetulkan No. ID. baris itu
 * sendiri. Ketiga-tiganya tak boleh diautomasikan - sistem tak tahu
 * nilai yang betul: placeholder perlu No. ID. sebenar, pendua perlu
 * manusia menentukan baris mana yang mana, dan No. ID. milik akaun lain
 * perlu keputusan.
 */
const STAFF_ID_CONFLICTS = new Set(["placeholder_staff_id", "duplicate_staff_id", "existing_staff_id"]);

/** Pilihan "cipta baharu" dalam pemilih bahagian. */
const BAHARU = "__baharu__";

const STATUS_LABEL: Record<string, string> = {
  valid: "Lulus",
  conflict: "Konflik",
  imported: "Diimport",
  claimed: "Dituntut",
};

/**
 * `statusTone` yang dikongsi tak mengenali status import warisan, jadi
 * pemetaan dibuat di sini dan bukan dengan memaksa nilai kita ke dalam
 * senarainya.
 */
function toneStatus(status: string): StatusTone {
  if (status === "valid") return "success";
  if (status === "conflict") return "danger";
  if (status === "imported" || status === "claimed") return "info";
  return "neutral";
}

/**
 * Kod bahagian TAK boleh mengandungi '/' - ia memecahkan routing
 * /admin/departments/:code di backend.
 */
function cadangKod(nilai: string) {
  return nilai.trim().replace(/\s*\/\s*/g, "-").replace(/\s+/g, " ").slice(0, 64);
}

/**
 * Cadangkan bahagian sedia ada bila nilai CSV mengandungi kodnya, cth
 * "PEJ. TKPE (P) / BKP" -> "BKP". Padanan pada sempadan perkataan supaya
 * "UU" tak tersilap padan dengan "BAHAGIAN UUUM".
 */
function padananBahagian(nilai: string, departments: Bahagian[]) {
  const perkataan = new Set(
    nilai
      .toUpperCase()
      .split(/[^A-Z0-9]+/)
      .filter(Boolean),
  );
  return departments.find((item) => perkataan.has(item.code.toUpperCase()))?.code;
}

const rowFilters: DataTableFilter[] = [
  {
    columnId: "status",
    title: "Status",
    options: [
      { value: "conflict", label: "Konflik" },
      { value: "valid", label: "Lulus" },
      { value: "imported", label: "Diimport" },
      { value: "claimed", label: "Dituntut" },
    ],
  },
];

export function LegacyImportConsole({
  batches,
  departments,
}: {
  batches: LegacyImportBatch[];
  departments: Bahagian[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Mesej>();
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

  const runImport = useCallback(
    (id: string) => {
      startTransition(async () => {
        const result = await importLegacyBatchAction(id);
        setMessage(
          result.ok
            ? { kind: "success", text: "Baris yang telah dipadankan dengan akaun berjaya diimport." }
            : { kind: "error", text: result.error },
        );
        if (result.ok) router.refresh();
      });
    },
    [router],
  );

  const batchColumns = useMemo<ColumnDef<LegacyImportBatch>[]>(
    () => [
      {
        accessorKey: "source_filename",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fail" />,
        cell: ({ row }) => <span className="font-medium">{row.original.source_filename}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <StatusBadge
            label={STATUS_LABEL[row.original.status] ?? row.original.status}
            tone={toneStatus(row.original.status)}
          />
        ),
      },
      {
        id: "baris",
        header: "Baris",
        enableSorting: false,
        cell: ({ row }) => `${row.original.valid_rows}/${row.original.total_rows}`,
      },
      {
        accessorKey: "conflict_rows",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Konflik" />,
      },
      {
        id: "tindakan",
        header: "Tindakan",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.status !== "imported" && row.original.valid_rows > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => runImport(row.original.id)}
            >
              <FileUpIcon />
              Import baris lulus
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          ),
      },
    ],
    [pending, runImport],
  );

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
        <CardContent>
          <DataTable
            columns={batchColumns}
            data={batches}
            getRowId={(batch) => batch.id}
            emptyMessage="Belum ada dry-run."
            enablePagination={false}
          />
        </CardContent>
      </Card>

      {batches.map((batch) => (
        <BatchRowsCard
          key={`${batch.id}-rows`}
          batch={batch}
          departments={departments}
          onMessage={setMessage}
        />
      ))}
    </div>
  );
}

function BatchRowsCard({
  batch,
  departments,
  onMessage,
}: {
  batch: LegacyImportBatch;
  departments: Bahagian[];
  onMessage: (mesej: Mesej) => void;
}) {
  // `batch.rows ?? []` menghasilkan array BAHARU setiap render, yang
  // membatalkan memo di bawah setiap kali. Distabilkan di sini.
  const rows = useMemo(() => batch.rows ?? [], [batch.rows]);
  const ringkasan = useMemo(() => ringkasanKonflik(rows), [rows]);

  const columns = useMemo<ColumnDef<LegacyImportRow>[]>(
    () => [
      {
        accessorKey: "source_row",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Row" />,
      },
      {
        accessorKey: "display_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ahli" />,
        cell: ({ row }) => (
          <div className="min-w-36">
            <p className="font-medium">{row.original.display_name || "Tanpa nama"}</p>
            <p className="text-xs text-muted-foreground">{row.original.member_id || "No. ahli tiada"}</p>
          </div>
        ),
      },
      { accessorKey: "email", header: "Emel" },
      {
        accessorKey: "department_code",
        header: "Bahagian",
        cell: ({ row }) => row.original.department_code || "-",
      },
      {
        id: "akaun",
        header: "Akaun",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.user_id ? (
            <StatusBadge label="Dipadankan" tone="success" />
          ) : (
            <span className="text-xs text-muted-foreground">Belum ada akaun</span>
          ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <StatusBadge
            label={STATUS_LABEL[row.original.status] ?? row.original.status}
            tone={toneStatus(row.original.status)}
          />
        ),
      },
      {
        id: "konflik",
        header: "Konflik",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.conflicts.length === 0 ? (
            <span className="text-xs text-muted-foreground">-</span>
          ) : (
            <ResolveSheet
              row={row.original}
              batchId={batch.id}
              departments={departments}
              onMessage={onMessage}
            />
          ),
      },
    ],
    [batch.id, departments, onMessage],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Senarai row: {batch.source_filename}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {batch.total_rows} row. Baris berkonflik tidak akan diimport sehingga diselesaikan.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RingkasanKonflikSection items={ringkasan} onMessage={onMessage} />
        <DataTable
          columns={columns}
          data={rows}
          searchKey="display_name"
          searchPlaceholder="Cari nama ahli…"
          filters={rowFilters}
          getRowId={(row) => row.id}
          emptyMessage="Tiada row."
          initialPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Ringkasan konflik unik - dibina untuk DISALIN dan dihantar kepada
 * client, jadi ia dikumpulkan mengikut mesej penuh (yang membawa nilai
 * spesifik seperti nama bahagian), bukan kod konflik.
 */
function RingkasanKonflikSection({
  items,
  onMessage,
}: {
  items: { message: string; count: number }[];
  onMessage: (mesej: Mesej) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        Tiada konflik dalam batch ini.
      </div>
    );
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(teksRingkasanKonflik(items));
      onMessage({ kind: "success", text: "Ringkasan konflik disalin." });
    } catch {
      onMessage({ kind: "error", text: "Pelayar tidak membenarkan salinan automatik." });
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Konflik unik ({items.length})</p>
          <p className="text-xs text-muted-foreground">Senarai untuk dimaklumkan kepada client.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={salin}>
          <CopyIcon />
          Salin
        </Button>
      </div>
      <ul className="mt-3 grid gap-1.5">
        {items.map((item) => (
          <li key={item.message} className="flex items-start justify-between gap-3 text-sm">
            <span>{item.message}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{item.count} baris</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResolveSheet({
  row,
  batchId,
  departments,
  onMessage,
}: {
  row: LegacyImportRow;
  batchId: string;
  departments: Bahagian[];
  onMessage: (mesej: Mesej) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [staffID, setStaffID] = useState(row.legacy_staff_id);
  const [pilihan, setPilihan] = useState(
    () => padananBahagian(row.department_code, departments) ?? BAHARU,
  );
  const [kod, setKod] = useState(() => cadangKod(row.department_code));
  const [nama, setNama] = useState(row.department_code);

  const perluBahagian = row.conflicts.some((conflict) => conflict.code === "unknown_department");
  const perluStaffID = row.conflicts.some((conflict) => STAFF_ID_CONFLICTS.has(conflict.code));

  function simpanBahagian() {
    startTransition(async () => {
      const baharu = pilihan === BAHARU;
      const result = await resolveLegacyImportDepartmentAction(
        batchId,
        row.department_code,
        baharu ? kod : pilihan,
        baharu ? nama : undefined,
      );
      if (!result.ok) {
        onMessage({ kind: "error", text: result.error });
        return;
      }
      setOpen(false);
      onMessage({
        kind: "success",
        text: baharu
          ? `Bahagian ${kod} ditambah dan baris dikemas kini.`
          : `Baris dipetakan ke bahagian ${pilihan}.`,
      });
      router.refresh();
    });
  }

  function simpanStaffID() {
    startTransition(async () => {
      const result = await updateLegacyImportRowAction(row.id, staffID);
      if (!result.ok) {
        onMessage({ kind: "error", text: result.error });
        return;
      }
      setOpen(false);
      onMessage({ kind: "success", text: "No. ID. dikemas kini dan konflik dikira semula." });
      router.refresh();
    });
  }

  return (
    <ResponsiveDetailsSheet
      open={open}
      onOpenChange={setOpen}
      title={`Selesaikan konflik - row ${row.source_row}`}
      description={row.display_name || "Tanpa nama"}
      trigger={
        <Button type="button" size="sm" variant="outline">
          <WrenchIcon />
          Selesaikan ({row.conflicts.length})
        </Button>
      }
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <p className="text-sm font-medium">Konflik</p>
          <ul className="grid gap-1">
            {row.conflicts.map((conflict) => (
              <li key={conflict.code} className="text-sm text-destructive">
                {conflict.message}
              </li>
            ))}
          </ul>
        </div>

        {perluBahagian ? (
          <div className="grid gap-3 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Bahagian</p>
              <p className="text-xs text-muted-foreground">
                Semua baris dalam batch yang merujuk &ldquo;{row.department_code}&rdquo; akan ditukar.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`bahagian-${row.id}`}>Pilih bahagian</Label>
              <Select
                value={pilihan}
                disabled={pending}
                onValueChange={setPilihan}
              >
                <SelectTrigger id={`bahagian-${row.id}`} className="w-full">
                  <SelectValue placeholder="Pilih bahagian" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.code} - {item.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={BAHARU}>+ Cipta bahagian baharu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {pilihan === BAHARU ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={`kod-${row.id}`}>Kod baharu</Label>
                  <Input
                    id={`kod-${row.id}`}
                    value={kod}
                    disabled={pending}
                    onChange={(event) => setKod(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Kod tidak boleh mengandungi &lsquo;/&rsquo;.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`nama-${row.id}`}>Nama</Label>
                  <Input
                    id={`nama-${row.id}`}
                    value={nama}
                    disabled={pending}
                    onChange={(event) => setNama(event.target.value)}
                  />
                </div>
              </>
            ) : null}
            <Button
              type="button"
              className="w-fit"
              disabled={pending || (pilihan === BAHARU && (kod.trim() === "" || nama.trim() === ""))}
              onClick={simpanBahagian}
            >
              {pilihan === BAHARU ? "Cipta bahagian" : "Petakan ke bahagian ini"}
            </Button>
          </div>
        ) : null}

        {perluStaffID ? (
          <div className="grid gap-3 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">No. ID.</p>
              <p className="text-xs text-muted-foreground">
                Tiada nilai yang boleh diteka sistem - masukkan No. ID. sebenar.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`staff-${row.id}`}>No. ID.</Label>
              <Input
                id={`staff-${row.id}`}
                value={staffID}
                disabled={pending}
                onChange={(event) => setStaffID(event.target.value)}
              />
            </div>
            <Button
              type="button"
              className="w-fit"
              disabled={pending || staffID.trim() === "" || staffID === row.legacy_staff_id}
              onClick={simpanStaffID}
            >
              Simpan No. ID.
            </Button>
          </div>
        ) : null}

        {!perluBahagian && !perluStaffID ? (
          <p className="text-sm text-muted-foreground">
            Konflik ini perlu dibetulkan dalam fail CSV asal, kemudian jalankan dry-run baharu.
          </p>
        ) : null}
      </div>
    </ResponsiveDetailsSheet>
  );
}
