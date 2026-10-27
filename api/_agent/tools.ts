import { tool } from "ai";
import { z } from "zod";
import { callTool } from "./backend.js";

/**
 * Tools the assistant can call. Data tools go through eyeapp-backend with the
 * user's token; chart tools only echo their input — the browser applies them to
 * the Vela chart (see ChatPanel → chart:command / chart:indicator events).
 * Ported from the ta-agent web app (fundamental-ui) minus `getPortfolio`, which
 * reads a per-ta-agent-account portfolio that eyeapp users do not have.
 */

export type TradeSetup = {
  ticker: string;
  direction: "long" | "short";
  entry: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  risk_reward_ratio: number;
  recommendation: "BUY" | "SELL" | "WATCH";
  reasoning: string;
};

const chartCommandSchema = z.object({
  type: z
    .enum(["hline", "trendline", "zone", "fibretracement"])
    .describe(
      "hline = đường ngang (hỗ trợ/kháng cự), trendline = đường xu hướng 2 điểm, zone = vùng cung/cầu (box), fibretracement = Fibonacci Retracement (cần price_from=đáy, price_to=đỉnh, time_from, time_to)",
    ),
  price: z.number().optional().describe("Mức giá cho hline"),
  price_from: z.number().optional().describe("Giá bắt đầu (trendline/zone) hoặc giá đáy (fibretracement)"),
  price_to: z.number().optional().describe("Giá kết thúc (trendline/zone) hoặc giá đỉnh (fibretracement)"),
  time_from: z.number().optional().describe("Epoch ms cho điểm đầu (nếu không sẽ dùng 30 ngày trước)"),
  time_to: z.number().optional().describe("Epoch ms cho điểm cuối (nếu không sẽ dùng hôm nay)"),
  color: z
    .string()
    .optional()
    .describe(
      'Ý nghĩa đường vẽ, không phải mã màu: "resistance" (kháng cự), "support" (hỗ trợ), "target" (mục tiêu chốt lời), "entry" (điểm vào lệnh), hoặc "neutral" (mặc định).',
    ),
  label: z.string().optional().describe("Nhãn hiển thị trên đường vẽ"),
});

const indicatorSchema = z.object({
  type: z
    .enum([
      "sma", "ema", "moving-average", "bollinger-bands",
      "rsi", "macd", "stochastic", "stoch-rsi", "cci", "williams-r", "mfi", "cmf", "obv",
      "adx", "atr", "supertrend", "vwap", "volume",
    ])
    .describe('Loại chỉ báo. Dùng "sma" cho MA đơn giản, "ema" cho MA hàm mũ, "bollinger-bands" cho BB, "rsi", "macd", v.v.'),
  inputs: z
    .record(z.string(), z.union([z.number(), z.string()]))
    .optional()
    .describe('Tham số chỉ báo. VD: {"length": 10} cho SMA(10), {"length": 20, "mult": 2} cho BB(20,2).'),
});

export function createAgentTools(token: string) {
  const getStockData = tool({
    description:
      "Lấy dữ liệu phân tích kỹ thuật cho 1 mã cổ phiếu: giá, chỉ báo (RSI, MACD, MA, Bollinger), tín hiệu, và điểm FA nếu cần.",
    inputSchema: z.object({
      ticker: z.string().describe("Mã cổ phiếu, VD: VIC, HPG, VNM"),
      include_fa: z.boolean().default(true).describe("Có kèm dữ liệu phân tích cơ bản không"),
    }),
    execute: ({ ticker, include_fa }) =>
      callTool(token, "stock-data", { ticker: ticker.toUpperCase(), question: null, include_fa }),
  });

  const queryDatabase = tool({
    description: `Truy vấn dữ liệu tài chính từ database. Các loại truy vấn:
- financial_ratios: ROE, ROA, PE_TTM, PB, NET_MARGIN, GROSS_MARGIN, DEBT_TO_EQUITY, EPS_TTM, MARKET_CAP, FREE_CASH_FLOW, REVENUE_YOY, NPAT_YOY, CURRENT_RATIO
- financial_metrics: REVENUE, NPAT, TOTAL_ASSETS, TOTAL_EQUITY, TOTAL_LIABILITIES, CFO, CAPEX
- fa_scores: Điểm FA tổng hợp (growth, profitability, valuation, solvency, cashflow, overall) và rating
- income_statement, balance_sheet, cash_flow: Các báo cáo tài chính
- price_history: Giá OHLCV lịch sử
- signals: Tín hiệu kỹ thuật (BUY/SELL/WATCH)
- company_info: Thông tin công ty
- financial_health: Sức khỏe tài chính tổng hợp`,
    inputSchema: z.object({
      query_type: z.enum([
        "financial_ratios", "financial_metrics", "fa_scores", "income_statement", "balance_sheet",
        "cash_flow", "price_history", "signals", "company_info", "financial_health",
      ]),
      tickers: z.array(z.string()).min(1).max(10).describe("Danh sách mã cổ phiếu"),
      metrics: z.array(z.string()).optional().describe('Lọc theo mã chỉ số cụ thể, VD: ["ROE","PE_TTM","NET_MARGIN"]'),
      periods: z.array(z.string()).optional().describe('Lọc theo kỳ báo cáo, VD: ["2026Q2","2026Q1"]'),
      days: z.number().optional().describe("Số ngày lịch sử (cho price_history)"),
      limit: z.number().default(20),
    }),
    execute: (input) =>
      callTool(token, "query", { ...input, tickers: input.tickers.map((t) => t.toUpperCase()) }),
  });

  const compareStocks = tool({
    description: "So sánh song song 2-5 mã cổ phiếu trên các chỉ số chính: giá, P/E, P/B, ROE, ROA, biên lợi nhuận, điểm FA.",
    inputSchema: z.object({
      tickers: z.array(z.string()).min(2).max(5).describe("Danh sách mã cổ phiếu cần so sánh"),
      include_fa: z.boolean().default(true),
    }),
    execute: async ({ tickers, include_fa }) => {
      const upper = tickers.map((t) => t.toUpperCase());
      const [ratios, scores, prices] = await Promise.all([
        callTool(token, "query", {
          query_type: "financial_ratios",
          tickers: upper,
          metrics: ["ROE", "ROA", "PE_TTM", "PB", "NET_MARGIN", "GROSS_MARGIN", "DEBT_TO_EQUITY", "EPS_TTM"],
          limit: 100,
        }),
        include_fa ? callTool(token, "query", { query_type: "fa_scores", tickers: upper, limit: 10 }) : [],
        callTool(token, "query", { query_type: "price_history", tickers: upper, days: 1, limit: upper.length }),
      ]);
      return { tickers: upper, ratios, fa_scores: scores, latest_prices: prices };
    },
  });

  const screenStocks = tool({
    description: "Lọc cổ phiếu theo nhiều tiêu chí: ngành, sàn, tín hiệu kỹ thuật (BUY/SELL), xếp hạng FA, watchlist.",
    inputSchema: z.object({
      industry: z.string().optional().describe('Ngành ICB level 1, VD: "Bất động sản"'),
      sector_model: z.string().optional().describe("Sector model: GENERAL, BANK, SECURITIES, INSURANCE, REAL_ESTATE"),
      exchange: z.string().optional().describe("Sàn: HOSE, HNX, UPCOM"),
      signal_group: z.string().optional().describe("Nhóm tín hiệu: BUY, SELL, WATCH"),
      fa_rating: z.string().optional().describe("Xếp hạng FA: STRONG_FA, GOOD_FA, FAIR_FA, WEAK_FA, POOR_FA"),
      watched_only: z.boolean().default(false).describe("Chỉ lọc trong danh sách theo dõi (VN100+)"),
      limit: z.number().default(20),
    }),
    execute: (input) => callTool(token, "screener", input),
  });

  const drawOnChart = tool({
    description:
      "Vẽ các đường kỹ thuật lên biểu đồ: hỗ trợ (hline), kháng cự (hline), vùng cung cầu (zone), đường xu hướng (trendline), Fibonacci Retracement (fibretracement). LUÔN gọi tool này khi phân tích hỗ trợ/kháng cự, xu hướng, hoặc Fibonacci.",
    inputSchema: z.object({ commands: z.array(chartCommandSchema).min(1).max(10) }),
    execute: async ({ commands }) => ({ success: true, drawn_count: commands.length, commands }),
  });

  const createTradeSetup = tool({
    description: "Tạo thẻ kế hoạch giao dịch (Trading Card) với Entry/SL/TP và R:R. Luôn dùng khi đưa khuyến nghị mua/bán.",
    inputSchema: z.object({
      ticker: z.string(),
      direction: z.enum(["long", "short"]),
      entry: z.number().describe("Giá vào lệnh (VND)"),
      stop_loss: z.number().describe("Giá cắt lỗ (VND)"),
      take_profit_1: z.number().describe("Mục tiêu chốt lời 1 (VND)"),
      take_profit_2: z.number().optional().describe("Mục tiêu chốt lời 2 (VND)"),
      reasoning: z.string().default("").describe("Lý do đề xuất"),
    }),
    execute: async ({ ticker, direction, entry, stop_loss, take_profit_1, take_profit_2, reasoning }): Promise<TradeSetup> => {
      const risk = Math.abs(entry - stop_loss);
      const reward = Math.abs(take_profit_1 - entry);
      return {
        ticker: ticker.toUpperCase(),
        direction,
        entry,
        stop_loss,
        take_profit_1,
        take_profit_2,
        risk_reward_ratio: risk > 0 ? Math.round((reward / risk) * 100) / 100 : 0,
        recommendation: direction === "long" ? "BUY" : "SELL",
        reasoning,
      };
    },
  });

  const addIndicator = tool({
    description:
      "Thêm chỉ báo kỹ thuật lên biểu đồ (MA, EMA, Bollinger Bands, RSI, MACD, Stochastic, ADX, ATR, …). LUÔN gọi tool này khi user yêu cầu vẽ chỉ báo. VD: SMA(10) + SMA(20) = một lần gọi với 2 phần tử.",
    inputSchema: z.object({ indicators: z.array(indicatorSchema).min(1).max(10).describe("Danh sách chỉ báo cần thêm") }),
    execute: async ({ indicators }) => ({ success: true, added_count: indicators.length, indicators }),
  });

  return { getStockData, queryDatabase, compareStocks, screenStocks, drawOnChart, createTradeSetup, addIndicator };
}
