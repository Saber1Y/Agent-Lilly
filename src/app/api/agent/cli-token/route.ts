import { NextResponse } from "next/server";

import { issueCliToken } from "@/lib/cliAuth";

export async function POST() {
  const token = issueCliToken();
  if (!token) {
    return NextResponse.json(
      {
        status: "error",
        message: "AGENT_API_SECRET or CRON_SECRET is not configured on the server.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    ...token,
  });
}
