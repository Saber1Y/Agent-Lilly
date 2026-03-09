"use client";

import { DashboardShell } from "@/components/DashboardShell";
import {
  ActionButton,
  SectionCard,
  TextField,
} from "@/components/dashboard/ui";
import { useAgentOps } from "@/components/dashboard/useAgentOps";

export default function DashboardTelegramPage() {
  const {
    opsConfig,
    setOpsConfig,
    saveConfig,
    isLoading,
  } = useAgentOps();

  return (
    <DashboardShell
      currentPage="telegram"
      title="Telegram"
      subtitle="Connect Telegram so Lily can send live automation alerts and updates to your chosen chat."
      actions={
        <ActionButton onClick={saveConfig} disabled={isLoading}>
          Save Telegram Setup
        </ActionButton>
      }
    >
      <SectionCard
        title="Telegram Delivery"
        subtitle="Set the bot credentials and destination chat used for Lily notifications."
      >
        <p className="mb-4 rounded-2xl border border-[#2B2B39] bg-[#101018] px-4 py-3 text-sm text-[#A0A0B0]">
          Telegram credentials are stored on the server and used for outbound Lily notifications.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Telegram Bot Token"
            type="password"
            value={opsConfig.telegramBotToken ?? ""}
            onChange={(value) =>
              setOpsConfig((prev) => ({ ...prev, telegramBotToken: value }))
            }
          />
          <TextField
            label="Telegram Chat ID"
            value={opsConfig.telegramChatId ?? ""}
            onChange={(value) =>
              setOpsConfig((prev) => ({ ...prev, telegramChatId: value }))
            }
          />
        </div>
        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#2B2B39] bg-[#101018] px-4 py-3 text-sm text-white">
          <input
            type="checkbox"
            checked={Boolean(opsConfig.telegramEnabled)}
            onChange={(e) =>
              setOpsConfig((prev) => ({ ...prev, telegramEnabled: e.target.checked }))
            }
          />
          Enable Telegram alerts
        </label>
        <p className="mt-4 text-sm text-[#A0A0B0]">
          Once enabled, Lily can push route reviews, run results, and automation updates directly to Telegram.
        </p>
      </SectionCard>
    </DashboardShell>
  );
}
