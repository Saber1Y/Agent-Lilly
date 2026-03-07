import type { AgentDecision } from "./agent";

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export interface StrategyReasoning {
  summary: string;
  thesis: string;
  risks: string[];
  actionBias: "hold" | "rebalance";
  confidence: number;
}

const DEFAULT_MODEL = "gemini-2.5-flash";
const REASONING_TIMEOUT_MS = 8000;

export async function generateStrategyReasoning(
  decision: AgentDecision,
): Promise<StrategyReasoning | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = buildPrompt(decision);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      signal: AbortSignal.timeout(REASONING_TIMEOUT_MS),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "x-goog-api-client": "lifi-yield-agent/0.1.0",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              thesis: { type: "string" },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              actionBias: {
                type: "string",
                enum: ["hold", "rebalance"],
              },
              confidence: {
                type: "number",
              },
            },
            required: [
              "summary",
              "thesis",
              "risks",
              "actionBias",
              "confidence",
            ],
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini reasoning failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini reasoning returned no text payload.");
  }

  const parsed = JSON.parse(text) as StrategyReasoning;
  return sanitizeReasoning(parsed);
}

function buildPrompt(decision: AgentDecision): string {
  const yields = Object.values(decision.yields)
    .sort((a, b) => b.supplyApr - a.supplyApr)
    .map(
      (item) =>
        `${item.chainName}: ${item.supplyApr.toFixed(2)}% APR, liquidity ${item.liquidity.toFixed(0)} ${item.symbol}`,
    )
    .join("\n");

  return [
    "You are Agent Lily, a DeFi strategy analyst for a cross-chain USDC yield system.",
    "You must provide reasoning only. You do not sign, broadcast, or execute transactions.",
    "Base your answer only on the supplied yield and route summary.",
    "Keep output concise and practical.",
    "",
    `Deterministic agent status: ${decision.status}`,
    `Deterministic message: ${decision.message}`,
    `Deterministic recommendation: ${decision.recommendation.action}`,
    `Current chain id: ${decision.currentChain}`,
    "",
    "Yields:",
    yields || "No yield data available.",
    "",
    "Route summary:",
    decision.recommendation.quote
      ? `From ${decision.recommendation.fromChain} to ${decision.recommendation.toChain}, estimated gas USD ${decision.recommendation.quote.gasCostUSD || "unknown"}, estimated output USD ${decision.recommendation.quote.toAmountUSD || "unknown"}`
      : "No route quote available.",
    "",
    "Return a JSON object with:",
    "- summary: one sentence",
    "- thesis: one short paragraph",
    "- risks: 2 to 4 short bullet-style strings",
    '- actionBias: "hold" or "rebalance"',
    "- confidence: number from 0 to 1",
  ].join("\n");
}

function sanitizeReasoning(value: StrategyReasoning): StrategyReasoning {
  const summary =
    typeof value.summary === "string" && value.summary.trim()
      ? value.summary.trim()
      : "No summary provided.";
  const thesis =
    typeof value.thesis === "string" && value.thesis.trim()
      ? value.thesis.trim()
      : "No thesis provided.";
  const risks = Array.isArray(value.risks)
    ? value.risks
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const actionBias =
    value.actionBias === "rebalance" ? "rebalance" : "hold";
  const numericConfidence =
    typeof value.confidence === "number"
      ? value.confidence
      : Number.parseFloat(String(value.confidence));
  const confidence = Number.isFinite(numericConfidence)
    ? Math.min(1, Math.max(0, numericConfidence))
    : 0.5;

  return {
    summary,
    thesis,
    risks,
    actionBias,
    confidence,
  };
}
