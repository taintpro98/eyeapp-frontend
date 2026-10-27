import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UIMessage } from "ai";
import { AlertTriangle, BarChart3, Check, Loader2, Send, Sparkles, Trash2, TrendingUp, Wrench, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./MarkdownMessage";
import { TradeSetupCard, type TradeSetup } from "./TradeSetupCard";
import { dispatchChartCommands, dispatchChartIndicators, type ChartCommand, type ChartIndicator } from "./chartBridge";

const LUMI_WORKER_URL =
  import.meta.env.VITE_LUMI_WORKER_URL || "https://eyeapp-lumi.taideptrai02.workers.dev";

// --- Per-ticker history (text only, to keep localStorage small) ---
const HISTORY_PREFIX = "alumieye-chat-";
const MAX_SAVED_MESSAGES = 40;

function loadHistory(ticker: string): UIMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + ticker);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(ticker: string, messages: UIMessage[]) {
  try {
    const lean = messages.slice(-MAX_SAVED_MESSAGES).map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts.filter((p) => p.type === "text"),
    }));
    localStorage.setItem(HISTORY_PREFIX + ticker, JSON.stringify(lean));
  } catch {
    // quota exceeded / private mode
  }
}

function clearHistory(ticker: string) {
  try {
    localStorage.removeItem(HISTORY_PREFIX + ticker);
  } catch {
    // ignore
  }
}

// --- Tool parts ("tool-<name>" in the UI message stream) ---
type ToolPart = {
  type: string;
  toolCallId?: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: { ticker?: string; tickers?: string[] };
  output?: unknown;
  errorText?: string;
};

const isToolPart = (part: { type: string }) => part.type.startsWith("tool-") || part.type === "dynamic-tool";
const toolName = (part: ToolPart & { toolName?: string }) =>
  part.type === "dynamic-tool" ? (part.toolName ?? "unknown") : part.type.slice(5);

const KNOWN_ERRORS = new Set([
  "feature_required",
  "subscription_required",
  "unauthorized",
  "rate_limited",
  "service_unavailable",
  "generation_failed",
]);

type ChatPanelProps = {
  ticker: string;
  className?: string;
  /** Applied once there are messages — the empty state sizes to its content. */
  activeClassName?: string;
};

/** Lumi chat for the Technical tab: kết nối trực tiếp với Cloudflare Workers AI. */
export function ChatPanel({ ticker, className, activeClassName }: ChatPanelProps) {
  const { t } = useTranslation();
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const setLumiDocked = useAppStore((s) => s.setLumiDocked);

  // While the real chat is on screen, hide the floating demo widget (it would cover the input).
  useEffect(() => {
    setLumiDocked(true);
    return () => setLumiDocked(false);
  }, [setLumiDocked]);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const dispatched = useRef(new Set<string>());

  const [messages, setMessages] = useState<UIMessage[]>(() => loadHistory(ticker));
  const [status, setStatus] = useState<"ready" | "submitted">("ready");
  const [error, setError] = useState<string | null>(null);
  const busy = status === "submitted";

  // Load this ticker's conversation when the ticker changes (and on mount).
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (loadedFor.current === ticker) return;
    loadedFor.current = ticker;
    setError(null);
    dispatched.current.clear();
    // Messages restored from storage must not replay their chart drawings.
    const saved = loadHistory(ticker);
    for (const m of saved) dispatched.current.add(m.id);
    setMessages(saved);
  }, [ticker]);

  useEffect(() => {
    if (!messages.length || loadedFor.current !== ticker) return;
    const timer = window.setTimeout(() => saveHistory(ticker, messages), 300);
    return () => window.clearTimeout(timer);
  }, [messages, ticker]);

  // Apply chart tool results once each.
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant" || dispatched.current.has(msg.id)) continue;
      msg.parts.forEach((raw, idx) => {
        if (!isToolPart(raw)) return;
        const part = raw as ToolPart;
        if (part.state !== "output-available") return;
        const key = `${msg.id}:${part.toolCallId ?? idx}`;
        if (dispatched.current.has(key)) return;
        dispatched.current.add(key);
        const name = toolName(part);
        const output = part.output as { commands?: ChartCommand[]; indicators?: ChartIndicator[] } | undefined;
        if (name === "drawOnChart" && output?.commands) dispatchChartCommands(output.commands);
        if (name === "addIndicator" && output?.indicators) dispatchChartIndicators(output.indicators);
      });
    }
  }, [messages]);

  // Follow new tokens only while the reader is at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      stickToBottom.current = true;
      setError(null);

      const userMsg: UIMessage = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        parts: [{ type: "text", text: clean }],
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setStatus("submitted");

      try {
        // Lấy 8 tin nhắn gần nhất để làm ngữ cảnh
        const history = nextMessages.slice(-8).map((m) => {
          const textContent = m.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("\n");
          return {
            role: m.role === "user" ? ("user" as const) : ("assistant" as const),
            content: textContent,
          };
        });

        const res = await fetch(LUMI_WORKER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `Bạn là Lumi — Trợ lý AI Phân tích Kỹ thuật và Chứng khoán của ALumiEye tại thị trường Việt Nam (HOSE, HNX, UPCOM). Người dùng đang xem biểu đồ cổ phiếu ${ticker}. Hãy phân tích kỹ thuật chuyên sâu, chỉ rõ xu hướng, các vùng giá hỗ trợ, kháng cự quan trọng và chiến lược hành động tham khảo. Trả lời bằng tiếng Việt, định dạng markdown rõ ràng, súc tích.`,
              },
              ...history,
            ],
          }),
        });

        if (!res.ok) {
          throw new Error(`Worker status: ${res.status}`);
        }

        const data = await res.json();
        const aiText =
          data.response ||
          data.choices?.[0]?.message?.content ||
          "Lumi đã nhận tín hiệu nhưng chưa xử lý được câu trả lời. Bạn thử hỏi lại nhé!";

        const assistantMsg: UIMessage = {
          id: `msg-asst-${Date.now()}`,
          role: "assistant",
          parts: [{ type: "text", text: aiText }],
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("[ChatPanel] Chat error:", err);
        setError("service_unavailable");
      } finally {
        setStatus("ready");
      }
    },
    [busy, messages, ticker]
  );

  const clearChat = () => {
    setMessages([]);
    clearHistory(ticker);
    dispatched.current.clear();
    setError(null);
  };

  const quickActions = [
    { key: "overview", Icon: Sparkles },
    { key: "trend", Icon: TrendingUp },
    { key: "levels", Icon: BarChart3 },
    { key: "faTa", Icon: AlertTriangle },
  ] as const;

  const code = error;
  const needsUpgrade = code === "feature_required" || code === "subscription_required";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-card border border-surface-border bg-surface-card shadow-card",
        className,
        (messages.length > 0 || busy) && activeClassName,
      )}
    >
      <div className="flex items-center gap-2 border-b border-surface-border px-3 py-2">
        <Sparkles className="h-4 w-4 text-brand-primary dark:text-brand-light" />
        <span className="text-sm font-semibold text-text-primary">{t("technical.chat.title")}</span>
        <span className="rounded bg-brand-primary/10 px-1.5 py-0.5 text-xs font-medium text-brand-primary dark:text-brand-light">
          {ticker}
        </span>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            title={t("technical.chat.clear")}
            aria-label={t("technical.chat.clear")}
            className="ml-auto rounded p-1 text-text-secondary transition-colors hover:text-rating-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Sparkles className="h-7 w-7 text-text-secondary/60" />
            <p className="text-text-secondary">{t("technical.chat.empty", { ticker })}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  disabled={busy}
                  onClick={() => send(t(`technical.chat.quick.${key}.question`, { ticker }))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-xs text-text-primary transition-colors hover:border-brand-primary/40 disabled:opacity-50"
                >
                  <Icon className="h-3 w-3" />
                  {t(`technical.chat.quick.${key}.label`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[92%] rounded-lg px-3 py-2",
                msg.role === "user"
                  ? "bg-brand-primary text-white"
                  : "border border-surface-border bg-surface-warm/40 text-text-primary dark:bg-surface-border/20",
              )}
            >
              {msg.parts.map((raw, idx) => {
                if (raw.type === "text") {
                  return msg.role === "user" ? (
                    <p key={idx} className="whitespace-pre-wrap">{raw.text}</p>
                  ) : (
                    <MarkdownMessage key={idx} content={raw.text} />
                  );
                }
                if (!isToolPart(raw)) return null;
                const part = raw as ToolPart;
                const name = toolName(part);
                const running = part.state === "input-streaming" || part.state === "input-available";
                const target = part.input?.ticker ?? part.input?.tickers?.join(", ");
                return (
                  <div key={idx} className="my-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Wrench className="h-3 w-3" />
                      <span>
                        {t(`technical.chat.tools.${name}`, { defaultValue: name })}
                        {target ? ` — ${target}` : ""}
                      </span>
                      {running && <Loader2 className="h-3 w-3 animate-spin" />}
                      {part.state === "output-available" && <Check className="h-3 w-3 text-rating-5" />}
                      {part.state === "output-error" && <X className="h-3 w-3 text-rating-1" />}
                    </div>
                    {part.state === "output-available" && name === "createTradeSetup" && part.output != null && (
                      <TradeSetupCard setup={part.output as TradeSetup} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("technical.chat.thinking", { ticker })}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-start gap-2 rounded-lg border border-rating-1/30 bg-rating-1/10 px-3 py-2 text-rating-1">
            <span className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {t(`technical.chat.errors.${code && KNOWN_ERRORS.has(code) ? code : "generic"}`)}
            </span>
            {needsUpgrade && (
              <Button size="sm" onClick={() => openUpgradeModal({ featureKey: "aiInsights" })}>
                {t("upgrade.upgradeToUnlock")}
              </Button>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput("");
        }}
        className="flex items-center gap-2 border-t border-surface-border p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("technical.chat.placeholder", { ticker })}
          aria-label={t("technical.chat.placeholder", { ticker })}
          disabled={busy}
          className="h-10 min-w-0 flex-1 rounded-lg border border-surface-border bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label={t("technical.chat.send")}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
