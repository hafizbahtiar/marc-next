import { NextResponse } from "next/server";

import { API_INTERNAL_URL } from "@/lib/env";
import { accessToken } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await accessToken();
  if (!token) {
    return NextResponse.json({ error: "Sesi anda sudah tamat." }, { status: 401 });
  }

  const { id } = await params;
  const response = await fetch(`${API_INTERNAL_URL}/me/certificates/${encodeURIComponent(id)}/file`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    return new NextResponse(body || "Gagal menyediakan sijil.", {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" },
    });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sijil-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
