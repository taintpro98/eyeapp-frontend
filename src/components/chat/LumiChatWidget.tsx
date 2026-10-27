import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { cn } from "@/lib/utils";
import {
  ChatMessage,
  QUICK_PROMPTS_CONFIG,
  getInitialChatMessages,
  getMockLumiReply,
} from "@/data/mockLumiChat";

const LUMI_WORKER_URL =
  import.meta.env.VITE_LUMI_WORKER_URL || "https://eyeapp-lumi.taideptrai02.workers.dev";

export function LumiChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem("alumieye_lumi_chat");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getInitialChatMessages();
  });

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [lumiMood, setLumiMood] = useState<"happy" | "thinking">("happy");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Huỷ phản hồi đang chờ khi widget bị gỡ khỏi cây component
  useEffect(() => () => clearTimeout(replyTimerRef.current), []);

  // Auto-scroll xuống tin nhắn cuối cùng khi có cập nhật mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  // Lưu lịch sử chat bằng Tiếng Việt vào sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("alumieye_lumi_chat", JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Tự động focus vào ô nhập liệu khi mở chat box trên desktop
  useEffect(() => {
    if (isOpen) {
      setShowGreetingBubble(false);
      if (window.innerWidth >= 640) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen]);

  // Trên mobile box chat phủ toàn màn hình: khoá cuộn trang phía sau
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 640) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend ?? input).trim();
      if (!text || isThinking) return;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: "user",
        text,
        timestamp: timeStr,
      };

      const currentMessages = [...messages, userMsg];
      setMessages(currentMessages);
      setInput("");
      setIsThinking(true);
      setLumiMood("thinking");

      try {
        // Gửi tối đa 8 tin nhắn gần nhất để giữ mạch trò chuyện
        const history = currentMessages.slice(-8).map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

        const res = await fetch(LUMI_WORKER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "Bạn là Lumi — Trợ lý AI Phân tích Chứng khoán & Định lượng thông minh của ALumiEye tại thị trường Việt Nam (HOSE, HNX, UPCOM). Hãy phân tích sắc bén, súc tích, chuyên nghiệp bằng tiếng Việt, dùng định dạng markdown đẹp mắt.",
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
          "Lumi đã nhận được tin nhắn của bạn. Bạn muốn phân tích thêm mã hay chỉ số nào?";

        const replyNow = new Date();
        const replyTimeStr = `${String(replyNow.getHours()).padStart(2, "0")}:${String(replyNow.getMinutes()).padStart(2, "0")}`;

        const reply: ChatMessage = {
          id: `msg-lumi-${Date.now()}`,
          sender: "lumi",
          text: aiText,
          timestamp: replyTimeStr,
          mood: "happy",
          highlightBadge: {
            label: "Lumi AI",
            variant: "brand",
          },
        };

        setMessages((prev) => [...prev, reply]);
      } catch (err) {
        console.warn("[Lumi] Gọi Worker thất bại, chuyển sang chế độ dự phòng:", err);
        const fallbackReply = getMockLumiReply(text);
        setMessages((prev) => [...prev, fallbackReply]);
      } finally {
        setIsThinking(false);
        setLumiMood("happy");
      }
    },
    [input, isThinking, messages]
  );

  // Hỗ trợ mở chat box từ bất kỳ nơi nào trong app qua event `open-lumi-chat`
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      setShowGreetingBubble(false);
      if (customEvent.detail?.query) {
        setTimeout(() => {
          handleSendMessage(customEvent.detail.query);
        }, 100);
      }
    };
    window.addEventListener("open-lumi-chat", handleOpenEvent);
    return () => window.removeEventListener("open-lumi-chat", handleOpenEvent);
  }, [handleSendMessage]);

  const handleResetChat = () => {
    // Bỏ phản hồi đang chờ để nó không hiện lại sau khi đã làm mới
    clearTimeout(replyTimerRef.current);
    const fresh = getInitialChatMessages();
    setMessages(fresh);
    setLumiMood("happy");
    setIsThinking(false);
    try {
      sessionStorage.removeItem("alumieye_lumi_chat");
    } catch {
      // ignore
    }
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
          const cleanLine = isBullet ? line.trim().replace(/^[•-]\s*/, "") : line;

          // Parse markdown bold: **text**
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

          const content = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-brand-primary dark:text-brand-light">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-brand-primary dark:text-brand-light font-bold select-none">•</span>
                <span className="flex-1">{content}</span>
              </div>
            );
          }

          return <p key={idx}>{content}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. Nút nổi (Floating Trigger) luôn cố định ở Bottom-Right */}
      <div
        className={cn(
          "fixed z-50 flex flex-col items-end gap-2",
          "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6",
          // Mobile: box chat đã phủ toàn màn hình nên ẩn nút nổi
          isOpen && "hidden sm:flex"
        )}
      >
        {/* Bóng thoại chào mừng (Greeting Bubble) khi chatbox đang đóng */}
        {!isOpen && showGreetingBubble && (
          <div className="group relative flex max-w-[220px] sm:max-w-xs items-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-3.5 py-2 shadow-lg shadow-brand-dark/10 dark:shadow-black/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsOpen(true)}>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-medium text-text-primary">
                {t("lumiChat.askLumi")} 🦉
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGreetingBubble(false);
              }}
              className="text-text-secondary hover:text-text-primary p-0.5 rounded-full hover:bg-surface-border/50"
              aria-label={t("lumiChat.closePrompt")}
            >
              <X className="h-3 w-3" />
            </button>
            {/* Mũi tên trỏ xuống nút Lumi */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-surface-border bg-surface-card" />
          </div>
        )}

        {/* Nút bấm tròn hình Lumi */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full",
            "bg-surface-card dark:bg-plum-800 p-1.5 shadow-xl shadow-brand-dark/20 dark:shadow-black/50",
            "border-2 border-brand-primary/30 dark:border-brand-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation",
            isOpen && "ring-2 ring-brand-primary ring-offset-2 dark:ring-offset-surface-bg"
          )}
          title={t("lumiChat.openChatAria")}
          aria-label={t("lumiChat.openChatAria")}
        >
          {/* Avatar linh vật Lumi với nét biểu cảm mở mắt/nhắm mắt */}
          <div className="h-full w-full rounded-full bg-brand-cream/80 dark:bg-brand-primary/20 flex items-center justify-center p-1">
            <Lumi
              mood={isOpen ? "happy" : isThinking ? "thinking" : lumiMood}
              className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Đèn tín hiệu trực tuyến (Green status badge) */}
          <span className="absolute right-0 top-0 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-surface-card bg-emerald-500" />
          </span>

          {/* Biểu tượng phụ lấp lánh */}
          <div className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm ring-1 ring-white dark:ring-surface-card">
            <Sparkles className="h-2.5 w-2.5 text-amber-300" />
          </div>
        </button>
      </div>

      {/* 2. Cửa sổ Box Chat: mobile phủ toàn màn hình, desktop neo ở Bottom-Right */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-[60] flex flex-col overflow-hidden",
            "inset-0 h-[100dvh] w-full bg-surface-card dark:bg-plum-950",
            "sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[410px] sm:max-h-[82vh]",
            isExpanded ? "sm:w-[540px] sm:h-[680px]" : "sm:h-[600px]",
            "sm:rounded-2xl sm:border sm:border-surface-border",
            "sm:bg-surface-card/95 sm:dark:bg-plum-950/95 sm:shadow-2xl sm:backdrop-blur-xl sm:ring-1 sm:ring-black/5 sm:dark:ring-white/10",
            "animate-in fade-in slide-in-from-bottom-3 duration-200"
          )}
        >
          {/* Header của Chatbox */}
          <div className="flex items-center justify-between border-b border-surface-border bg-surface-warm/80 dark:bg-plum-850/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:py-3.5">
            <div className="flex items-center gap-3">
              {/* Avatar Lumi trong header */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cream dark:bg-brand-primary/20 p-1 ring-2 ring-brand-primary/20">
                <Lumi mood={lumiMood} className="h-full w-full object-contain" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-surface-card bg-emerald-500" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-text-primary text-sm sm:text-base leading-none">
                    {t("lumiChat.title")}
                  </h3>
                  <span className="inline-flex items-center rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary dark:text-brand-light">
                    {t("lumiChat.role")}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                    AI Live
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-text-secondary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isThinking ? t("lumiChat.statusThinking") : t("lumiChat.statusOnline")}
                </p>
              </div>
            </div>

            {/* Các nút điều khiển trên Header */}
            <div className="flex items-center gap-1 text-text-secondary">
              <button
                onClick={handleResetChat}
                className="rounded-lg p-2 sm:p-1.5 hover:bg-surface-border/50 hover:text-text-primary active:bg-surface-border transition-colors touch-manipulation"
                title={t("lumiChat.resetChat")}
                aria-label={t("lumiChat.resetChat")}
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="hidden sm:inline-flex rounded-lg p-1.5 hover:bg-surface-border/50 hover:text-text-primary transition-colors"
                title={isExpanded ? t("lumiChat.collapse") : t("lumiChat.expand")}
                aria-label={isExpanded ? t("lumiChat.collapse") : t("lumiChat.expand")}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "ml-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors touch-manipulation",
                  // Mobile: nút ✕ tròn nổi bật để thoát chế độ toàn màn hình
                  "bg-brand-primary/10 text-brand-primary active:bg-brand-primary/20 dark:bg-brand-light/15 dark:text-brand-light",
                  // Desktop: giữ kiểu thu gọn nhẹ như các nút khác trên header
                  "sm:ml-0 sm:h-auto sm:w-auto sm:rounded-lg sm:bg-transparent sm:p-1.5 sm:text-text-secondary sm:hover:bg-surface-border/50 sm:hover:text-text-primary sm:dark:bg-transparent sm:dark:text-text-secondary"
                )}
                title={t("lumiChat.close")}
                aria-label={t("lumiChat.close")}
              >
                <X className="h-5 w-5 sm:hidden" strokeWidth={2.5} />
                <ChevronDown className="hidden h-5 w-5 sm:block" />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn (Messages Thread) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="flex flex-col items-end max-w-[88%] sm:max-w-[85%]">
                      <div className="rounded-2xl rounded-tr-sm bg-brand-primary px-4 py-2.5 text-white shadow-sm text-xs sm:text-sm">
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="mt-1 text-[10px] text-text-secondary pr-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              // Tin nhắn của Lumi
              return (
                <div key={msg.id} className="flex items-start gap-2.5 max-w-[96%] sm:max-w-[92%]">
                  <div className="shrink-0 pt-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cream dark:bg-brand-primary/20 p-0.5 border border-brand-primary/20">
                      <Lumi mood={msg.mood ?? "happy"} className="h-full w-full object-contain" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="rounded-2xl rounded-tl-sm border border-surface-border bg-surface-warm/40 dark:bg-zinc-800/80 p-3.5 shadow-sm space-y-2 text-text-primary">
                      {/* Huy hiệu nổi bật nếu có */}
                      {msg.highlightBadge && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                              msg.highlightBadge.variant === "success" &&
                                "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
                              msg.highlightBadge.variant === "warning" &&
                                "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                              msg.highlightBadge.variant === "danger" &&
                                "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30",
                              msg.highlightBadge.variant === "brand" &&
                                "bg-brand-primary/15 text-brand-primary dark:text-brand-light border border-brand-primary/30"
                            )}
                          >
                            <Zap className="h-2.5 w-2.5" />
                            {msg.highlightBadge.label}
                          </span>
                        </div>
                      )}

                      {/* Nội dung tin nhắn đã format */}
                      {renderFormattedText(msg.text)}

                      {/* Bảng tóm tắt chỉ số định lượng nếu có */}
                      {msg.metrics && (
                        <div className="mt-2.5 rounded-xl border border-surface-border bg-surface-card dark:bg-zinc-900/80 p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          {msg.metrics.symbol && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.symbol")}:</span>
                              <span className="font-bold text-brand-primary dark:text-brand-light">
                                {msg.metrics.symbol}
                              </span>
                            </div>
                          )}
                          {msg.metrics.score && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.score")}:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {msg.metrics.score}
                              </span>
                            </div>
                          )}
                          {msg.metrics.trend && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.trend")}:</span>
                              <span className="font-semibold">{msg.metrics.trend}</span>
                            </div>
                          )}
                          {msg.metrics.support && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.support")}:</span>
                              <span className="font-medium text-text-primary">
                                {msg.metrics.support}
                              </span>
                            </div>
                          )}
                          {msg.metrics.resistance && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.resistance")}:</span>
                              <span className="font-medium text-text-primary">
                                {msg.metrics.resistance}
                              </span>
                            </div>
                          )}
                          {msg.metrics.action && (
                            <div>
                              <span className="text-text-secondary block">{t("lumiChat.metrics.action")}:</span>
                              <span className="font-bold text-brand-primary dark:text-brand-light">
                                {msg.metrics.action}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-text-secondary pl-1 block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Trạng thái Lumi đang suy nghĩ (Typing indicator) */}
            {isThinking && (
              <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="shrink-0 pt-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cream dark:bg-brand-primary/20 p-0.5 border border-brand-primary/20">
                    <Lumi mood="thinking" className="h-full w-full object-contain animate-bounce" />
                  </div>
                </div>

                <div className="rounded-2xl rounded-tl-sm border border-surface-border bg-surface-warm/40 dark:bg-zinc-800/80 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-medium">
                      {t("lumiChat.thinkingText")}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dải gợi ý câu hỏi nhanh (Quick Prompts Bar) */}
          <div className="border-t border-surface-border/60 bg-surface-warm/20 dark:bg-zinc-900/40 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 touch-pan-x">
              <span className="text-[11px] text-text-secondary font-medium shrink-0 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {t("lumiChat.suggestionsLabel")}
              </span>
              {QUICK_PROMPTS_CONFIG.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSendMessage(prompt.query)}
                  disabled={isThinking}
                  className="shrink-0 flex items-center gap-1 rounded-full border border-surface-border bg-surface-card dark:bg-zinc-800/80 px-2.5 py-1 text-xs text-text-primary hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-light active:bg-surface-border/50 transition-all disabled:opacity-50 active:scale-95 shadow-sm touch-manipulation"
                >
                  <span>{prompt.icon}</span>
                  <span>{t(`lumiChat.prompts.${prompt.labelKey}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Khung nhập nội dung (Chat Input Form) */}
          <div className="border-t border-surface-border bg-surface-card dark:bg-plum-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("lumiChat.inputPlaceholder")}
                disabled={isThinking}
                className={cn(
                  "flex-1 rounded-xl border border-surface-border bg-surface-bg/70 dark:bg-zinc-900/80 px-3.5 py-2",
                  "text-base sm:text-sm text-text-primary",
                  "placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary",
                  "disabled:opacity-60 transition-colors"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className={cn(
                  "flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl",
                  "bg-brand-primary text-white shadow-sm transition-all duration-150",
                  "hover:bg-brand-dark active:scale-95 disabled:pointer-events-none disabled:opacity-40 touch-manipulation"
                )}
                aria-label={t("lumiChat.sendAria")}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Dòng ghi chú chân trang */}
            <p className="mt-1.5 text-center text-[10px] text-text-secondary/70">
              {t("lumiChat.disclaimer")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
