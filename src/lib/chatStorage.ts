export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  actionCommand?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

function createWalletHeaders(walletAddress: string) {
  return {
    "x-wallet-address": walletAddress,
  };
}

export async function getStoredChats(walletAddress: string): Promise<Chat[]> {
  const response = await fetch("/api/dashboard/chats", {
    headers: createWalletHeaders(walletAddress),
  });
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Failed to load chats.");
  }

  return (json.chats ?? []).map(
    (chat: {
      id: string;
      title: string;
      messages: ChatMessage[];
      updatedAt: string;
    }) => ({
      id: chat.id,
      title: chat.title,
      messages: chat.messages ?? [],
      timestamp: new Date(chat.updatedAt).getTime(),
    }),
  );
}

export async function saveChat(walletAddress: string, chat: Chat): Promise<void> {
  const response = await fetch("/api/dashboard/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...createWalletHeaders(walletAddress),
    },
    body: JSON.stringify({
      id: chat.id,
      title: chat.title,
      messages: chat.messages,
    }),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || "Failed to save chat.");
  }
}

export async function deleteChat(walletAddress: string, chatId: string): Promise<void> {
  const response = await fetch(
    `/api/dashboard/chats?chat_id=${encodeURIComponent(chatId)}`,
    {
      method: "DELETE",
      headers: createWalletHeaders(walletAddress),
    },
  );

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || "Failed to delete chat.");
  }
}

export function generateChatTitle(firstMessage: string): string {
  const preview = firstMessage.slice(0, 40).trim();
  return preview.length < firstMessage.length ? `${preview}...` : preview;
}
