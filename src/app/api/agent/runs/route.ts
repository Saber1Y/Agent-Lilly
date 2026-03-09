import { NextRequest, NextResponse } from "next/server";

import { getRecentAutomationRuns } from "@/lib/persistence";
import { getWalletAddressFromRequest } from "@/lib/walletScope";

export async function GET(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  const runs = await getRecentAutomationRuns(walletAddress, 20);
  return NextResponse.json({
    status: "ok",
    runs,
  });
}
