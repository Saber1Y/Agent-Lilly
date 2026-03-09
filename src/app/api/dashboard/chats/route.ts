import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { deleteStoredChat, getStoredChats, saveStoredChat } from "@/lib/persistence";
import { getWalletAddressFromRequest } from "@/lib/walletScope";

const chatSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  messages: z.array(
    z.object({
      id: z.string().trim().min(1),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.number(),
      actionCommand: z.string().optional(),
    }),
  ),
});

export async function GET(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  const chats = await getStoredChats(walletAddress);
  return NextResponse.json({ status: "ok", chats });
}

export async function POST(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  const rawPayload = await request.json();
  const parsedPayload = chatSchema.safeParse(rawPayload);
  if (!parsedPayload.success) {
    return NextResponse.json(
      { status: "error", message: "Invalid chat payload." },
      { status: 400 },
    );
  }

  const chat = await saveStoredChat({
    walletAddress,
    ...parsedPayload.data,
  });

  return NextResponse.json({ status: "ok", chat });
}

export async function DELETE(request: NextRequest) {
  const walletAddress = getWalletAddressFromRequest(request);
  if (!walletAddress) {
    return NextResponse.json(
      { status: "error", message: "A valid wallet address is required." },
      { status: 400 },
    );
  }

  const chatId = request.nextUrl.searchParams.get("chat_id");
  if (!chatId) {
    return NextResponse.json(
      { status: "error", message: "chat_id is required." },
      { status: 400 },
    );
  }

  const deleted = await deleteStoredChat(walletAddress, chatId);
  return NextResponse.json({ status: deleted ? "ok" : "error" });
}
