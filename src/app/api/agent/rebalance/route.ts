import { NextRequest, NextResponse } from "next/server";

import { runAutonomousRebalance } from "@/lib/automation";
import { getWalletAddressFromRequest } from "@/lib/walletScope";

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      message: "Use POST for manual rebalance runs.",
    },
    { status: 405 },
  );
}

export async function POST(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  try {
    const result = await runAutonomousRebalance("manual", { walletAddress });
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
