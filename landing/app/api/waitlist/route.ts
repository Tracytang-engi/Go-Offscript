import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "https://go-off-script-api.onrender.com";

// POST — submit email to waitlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

// GET — fetch count (?count=1) or proxy admin export (requires x-admin-key header)
export async function GET(req: NextRequest) {
  const isCount = req.nextUrl.searchParams.get("count") === "1";
  const endpoint = isCount ? `${BACKEND}/api/waitlist/count` : `${BACKEND}/api/waitlist`;

  const headers: Record<string, string> = {};
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey) headers["x-admin-key"] = adminKey;

  try {
    const res = await fetch(endpoint, { headers, cache: "no-store" });
    if (!isCount && res.headers.get("content-type")?.includes("text/csv")) {
      const csv = await res.text();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="waitlist.csv"',
        },
      });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch." }, { status: 500 });
  }
}
