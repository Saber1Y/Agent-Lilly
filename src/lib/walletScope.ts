import type { NextRequest } from "next/server";
import { getAddress, isAddress } from "viem";

export function normalizeWalletAddress(value: string | null | undefined) {
  if (!value || !isAddress(value)) {
    return null;
  }

  return getAddress(value);
}

export function getWalletAddressFromRequest(request: NextRequest) {
  const headerValue = request.headers.get("x-wallet-address");
  if (headerValue) {
    return normalizeWalletAddress(headerValue);
  }

  const queryValue = request.nextUrl.searchParams.get("wallet_address");
  return normalizeWalletAddress(queryValue);
}
