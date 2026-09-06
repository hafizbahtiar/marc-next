import { NextResponse } from "next/server";

import { API_INTERNAL_URL } from "@/lib/env";
import { accessToken } from "@/lib/auth/session";

const receiptTypes = new Set(["registration", "activity", "donation"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  if (!receiptTypes.has(type) || !id) {
    return NextResponse.json({ error: "Resit tidak dijumpai." }, { status: 404 });
  }

  const token = await accessToken();
  if (!token) {
    return NextResponse.json({ error: "Sesi anda sudah tamat." }, { status: 401 });
  }

  const response = await fetch(`${API_INTERNAL_URL}/me/payments/${type}/${encodeURIComponent(id)}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: response.status === 404 ? "Resit tidak dijumpai." : "Gagal memuat turun resit." },
      { status: response.status },
    );
  }

  const preview = new URL(_request.url).searchParams.get("preview") === "1";
  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": preview
        ? "inline"
        : response.headers.get("content-disposition") ?? 'attachment; filename="MARC-Resit.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
