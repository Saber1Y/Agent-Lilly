import { NextResponse } from "next/server";

import { fetchYields } from "@/lib/yields";

export async function GET() {
  const yields = await fetchYields();
  return NextResponse.json({
    status: "ok",
    yields,
  });
}
