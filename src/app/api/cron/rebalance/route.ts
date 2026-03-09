import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/env/server";
import { runAutonomousRebalance } from "@/lib/automation";
import { getWalletAddressFromRequest } from "@/lib/walletScope";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = serverEnv.cronSecret;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: serverEnv.cronSecret
          ? "Unauthorized cron request."
          : "CRON_SECRET is not configured.",
      },
      { status: serverEnv.cronSecret ? 401 : 503 },
    );
  }

  try {
    const walletAddress = getWalletAddressFromRequest(request);
    const result = await runAutonomousRebalance("cron", { walletAddress: walletAddress ?? undefined });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        mode: "analysis",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
