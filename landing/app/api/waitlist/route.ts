import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "https://go-off-script-api.onrender.com";

// Allow time for Render cold starts when proxying waitlist
export const maxDuration = 60;

async function proxyJson(path: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/csv")) {
    const csv = await res.text();
    return new NextResponse(csv, {
      status: res.status,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="waitlist.csv"',
      },
    });
  }
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST — submit email to waitlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return await proxyJson("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Server is waking up. Please wait a few seconds and try again.",
      },
      { status: 503 }
    );
  }
}

// GET — fetch count (?count=1) or proxy admin export (requires x-admin-key header)
export async function GET(req: NextRequest) {
  const isCount = req.nextUrl.searchParams.get("count") === "1";
  const path = isCount ? "/api/waitlist/count" : "/api/waitlist";

  const headers: Record<string, string> = {};
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey) headers["x-admin-key"] = adminKey;

  try {
    return await proxyJson(path, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch." }, { status: 503 });
  }
}
