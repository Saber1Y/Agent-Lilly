import { NextRequest, NextResponse } from "next/server";

import { getAutomationReport } from "@/lib/automation";
import { getWalletAddressFromRequest } from "@/lib/walletScope";

export async function GET(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  const report = await getAutomationReport(walletAddress);

  return NextResponse.json({
    status: "ok",
    report,
  });
}
