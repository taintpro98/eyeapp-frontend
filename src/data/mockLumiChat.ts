/**
 * Dữ liệu giả lập và kiến thức định lượng cho trợ lý Lumi của ALumiEye.
 * Ngôn ngữ trong box chat luôn là Tiếng Việt theo định hướng người dùng.
 */

export type ChatMessage = {
  id: string;
  sender: "user" | "lumi";
  text: string;
  timestamp: string;
  mood?: "thinking" | "happy";
  highlightBadge?: {
    label: string;
    variant: "success" | "warning" | "danger" | "brand" | "neutral";
  };
  metrics?: {
    symbol?: string;
    score?: string;
    trend?: string;
    support?: string;
    resistance?: string;
    action?: string;
  };
};

export type QuickPrompt = {
  id: string;
  /** Khoá i18n trong `lumiChat.prompts` */
  labelKey: string;
  icon: string;
  query: string;
};

/** Hàm tiện ích cho phép mở box chat Lumi từ bất cứ component nào */
export function openLumiChat(query?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-lumi-chat", {
        detail: { query },
      })
    );
  }
}

export const QUICK_PROMPTS_CONFIG: QuickPrompt[] = [
  {
    id: "vnindex",
    labelKey: "vnindex",
    icon: "📈",
    query: "Xu hướng VN-Index và dòng tiền hôm nay thế nào?",
  },
  {
    id: "fpt-hpg",
    labelKey: "fptHpg",
    icon: "🚀",
    query: "Phân tích kỹ thuật và tín hiệu mã FPT và HPG",
  },
  {
    id: "breakout",
    labelKey: "breakout",
    icon: "⚡",
    query: "Hôm nay hệ thống phát hiện các cổ phiếu Breakout nào?",
  },
  {
    id: "risk",
    labelKey: "risk",
    icon: "🛡️",
    query: "Làm sao để quản trị rủi ro danh mục trong giai đoạn này?",
  },
  {
    id: "alumiscore",
    labelKey: "alumiscore",
    icon: "💡",
    query: "Giải thích cách tính và ý nghĩa của chỉ số AlumiScore",
  },
  {
    id: "banks",
    labelKey: "banks",
    icon: "🏦",
    query: "Dòng tiền lớn đang vào nhóm cổ phiếu Ngân hàng nào?",
  },
];

export function getInitialChatMessages(): ChatMessage[] {
  return [
    {
      id: "msg-welcome",
      sender: "lumi",
      text: `Xin chào! Mình là **Lumi** 🦉 — Trợ lý Phân tích Định lượng của **ALumiEye**!

Mình luôn sẵn sàng giúp bạn theo dõi nhịp đập thị trường, bóc tách tín hiệu kỹ thuật (Trend Following, Breakout, Pocket Pivot), tính toán **AlumiScore** và hỗ trợ quản trị rủi ro danh mục.

Hôm nay bạn muốn Lumi hỗ trợ mã cổ phiếu nào hoặc xem cập nhật thị trường gì nhé?`,
      timestamp: "10:30",
      mood: "happy",
      highlightBadge: {
        label: "Lumi Sẵn Sàng",
        variant: "brand",
      },
    },
    {
      id: "msg-sample-user",
      sender: "user",
      text: "Mã FPT phiên nay có tín hiệu gì đáng chú ý không Lumi?",
      timestamp: "10:31",
    },
    {
      id: "msg-sample-lumi",
      sender: "lumi",
      text: `Dựa trên dữ liệu định lượng thời gian thực của **ALumiEye**:

🎯 **Cổ phiếu FPT (Công nghệ Thông tin):**
• **Giá hiện tại:** 138,500đ (+2.2%) | Khối lượng: 4.2M (vượt 135% TB 20 phiên)
• **AlumiScore:** **9.2 / 10** ⭐ (Thuộc Top 5% sức mạnh giá RS toàn thị trường)
• **Tín hiệu ALumiEye:** **Breakout Nền Giá (VCP)** kết hợp Pocket Pivot
• **Chỉ số kỹ thuật:**
  - **RSI (14):** 61.5 (Vùng tăng trưởng xung lực khỏe, chưa chạm quá mua)
  - **MACD:** Histogram phân kỳ dương mở rộng, đường MACD nằm vững trên Signal Line
  - **Vùng hỗ trợ động:** 134,000đ (MA20 ngày)
  - **Vùng kháng cự mục tiêu:** 148,000đ - 150,000đ

💡 **Gợi ý hành động:**
Vị thế gia tăng tỷ trọng khi rung lắc kiểm định quanh 136,000 - 137,000đ. Đặt ngưỡng cắt lỗ kỷ luật (Stoploss) tại 132,500đ.`,
      timestamp: "10:31",
      mood: "happy",
      highlightBadge: {
        label: "Tín hiệu MUA MẠNH",
        variant: "success",
      },
      metrics: {
        symbol: "FPT",
        score: "9.2/10",
        trend: "Tăng mạnh (Uptrend)",
        support: "134,000đ",
        resistance: "150,000đ",
        action: "MUA GIA TĂNG",
      },
    },
  ];
}

/**
 * Sinh phản hồi thông minh mô phỏng của Lumi bằng Tiếng Việt
 */
export function getMockLumiReply(query: string): ChatMessage {
  const q = query.toLowerCase().trim();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // 2. Phân tích mã HPG / ngành Thép
  const hpgReply = (): ChatMessage => ({
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `Dữ liệu định lượng mã **HPG (Tập đoàn Hòa Phát)**:

🎯 **Đánh giá sức mạnh dòng tiền:**
• **Giá hiện tại:** 29,800đ (+1.9%) | Khối lượng: 38.5M cổ phiếu (tăng 180% TB 20 phiên)
• **AlumiScore:** **8.8 / 10** ⭐
• **Tín hiệu ALumiEye:** **Volume Accumulation** bứt phá khỏi hộp tích lũy Darvas 6 tuần
• **RSI (14):** 57.8 (Đang hướng lên mạnh mẽ từ vùng trung tính)
• **Hỗ trợ kỹ thuật:** 28,500đ | **Kháng cự ngắn hạn:** 31,500đ - 32,000đ

💡 **Nhận định từ Lumi:**
Dòng tiền tổ chức (Smart Money) có dấu hiệu gom mạnh khi giá lùi về MA50. Phù hợp cho chiến lược mua tích lũy theo sóng ngành hoặc gia tăng khi vượt hẳn 30,200đ. Ngưỡng cắt lỗ vi phạm tại 28,000đ.`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Dòng tiền lớn gom",
        variant: "success",
      },
      metrics: {
        symbol: "HPG",
        score: "8.8/10",
        trend: "Breakout hộp Darvas",
        support: "28,500đ",
        resistance: "32,000đ",
        action: "MUA TÍCH LŨY",
      },
  });

  // 3. Phân tích mã FPT
  const fptReply = (): ChatMessage => ({
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `Dữ liệu định lượng mã **FPT (CTCP FPT)**:

🎯 **Chỉ số kỹ thuật & Dòng tiền:**
• **Giá hiện tại:** 138,500đ (+2.2%) | Khối lượng: 4.2M (vượt 135% TB 20 phiên)
• **AlumiScore:** **9.2 / 10** ⭐ (Thuộc Top 5% sức mạnh giá RS toàn thị trường)
• **Tín hiệu ALumiEye:** **Breakout Nền Giá (VCP)** kết hợp Pocket Pivot
• **RSI (14):** 61.5 (Vùng tăng trưởng xung lực khỏe, chưa chạm quá mua)
• **MACD:** Histogram phân kỳ dương mở rộng, đường MACD nằm vững trên Signal Line
• **Vùng hỗ trợ động:** 134,000đ (MA20 ngày) | **Vùng kháng cự:** 148,000đ - 150,000đ

💡 **Kế hoạch hành động:**
Phù hợp gia tăng tỷ trọng khi rung lắc kiểm định quanh 136,000 - 137,000đ. Đặt ngưỡng cắt lỗ kỷ luật tại 132,500đ.`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Tín hiệu MUA MẠNH",
        variant: "success",
      },
      metrics: {
        symbol: "FPT",
        score: "9.2/10",
        trend: "Uptrend mạnh",
        support: "134,000đ",
        resistance: "150,000đ",
        action: "MUA GIA TĂNG",
      },
  });

  const isHpg = q.includes("hpg") || q.includes("thép") || q.includes("hòa phát");
  const isFpt = q.includes("fpt");
  if (isHpg && isFpt) {
    // Hỏi cả hai mã (vd: gợi ý "Tín hiệu FPT & HPG"): gộp hai phần phân tích
    const fpt = fptReply();
    return {
      ...fpt,
      text: `${fpt.text}\n\n${hpgReply().text}`,
      metrics: undefined,
    };
  }
  if (isHpg) return hpgReply();
  if (isFpt) return fptReply();

  // 4. Phân tích nhóm Ngân hàng (MBB, TCB, VCB,...)
  if (
    q.includes("ngân hàng") ||
    q.includes("bank") ||
    q.includes("mbb") ||
    q.includes("tcb") ||
    q.includes("vcb")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `Dữ liệu định lượng **Nhóm Cổ phiếu Ngân hàng**:

🏦 **Điểm sáng dòng tiền ngành Bank:**
• **Top mã mạnh nhất:**
  - **MBB (24,800đ):** AlumiScore **8.9 / 10** — Vượt cản MA20, tự doanh mua ròng +65 tỷ.
  - **TCB (23,900đ):** AlumiScore **8.7 / 10** — Giữ vững nền giá cao, RSI = 59.
  - **VCB (92,000đ):** Đóng vai trò trụ giữ nhịp chỉ số VN-Index quanh vùng 1,280.

🔍 **Tín hiệu hệ thống ALumiEye:**
Chỉ số sức mạnh ngành Ngân hàng (Sector Relative Strength) đang đảo chiều từ suy yếu sang **Tích cực (Improving)**. Thanh khoản ngành chiếm 26% toàn thị trường.

💡 **Khuyến nghị của Lumi:**
Ưu tiên chọn các mã có tăng trưởng tín dụng và CASA vượt trội như **MBB, TCB**. Tránh các mã nợ xấu cao chưa rõ xu hướng.`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Dòng tiền đón đầu",
        variant: "brand",
      },
      metrics: {
        symbol: "NGÀNH BANK",
        score: "8.5/10",
        trend: "Improving",
        support: "MA20 Ngành",
        resistance: "Đỉnh cũ 2024",
        action: "ƯU TIÊN MBB, TCB",
      },
    };
  }

  // 5. Top Breakout / Tín hiệu mới nhất
  if (
    q.includes("breakout") ||
    q.includes("tín hiệu") ||
    q.includes("signal") ||
    q.includes("mới nhất") ||
    q.includes("bứt phá")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `⚡ **Top 3 cổ phiếu xuất hiện tín hiệu Breakout đạt chuẩn ALumiEye phiên nay:**

1. **HPG (Thép):** Breakout khỏi nền tích lũy 6 tuần, Vol đạt 180% TB20. *AlumiScore: 8.8* (Độ tin cậy: 87%)
2. **SSI (Chứng khoán):** Vượt cản chéo ngắn hạn, RSI cắt lên trên 55 cùng thanh khoản bùng nổ. *AlumiScore: 8.5* (Độ tin cậy: 82%)
3. **MBB (Ngân hàng):** Bật tăng từ đường hỗ trợ MA50 với lực gom mạnh từ khối ngoại và tự doanh. *AlumiScore: 8.9* (Độ tin cậy: 91%)

👉 *Mẹo nhỏ từ Lumi: Bạn có thể vào tab **Tín hiệu (Signals)** trong menu bên trái để lọc theo từng loại mô hình kỹ thuật chi tiết nhé!*`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "3 Tín hiệu Breakout",
        variant: "success",
      },
    };
  }

  // 6. Quản trị rủi ro danh mục
  if (
    q.includes("rủi ro") ||
    q.includes("quản trị") ||
    q.includes("cắt lỗ") ||
    q.includes("stoploss") ||
    q.includes("danh mục")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `🛡️ **Bộ quy tắc Quản trị Rủi ro Định lượng từ ALumiEye:**

1. **Quy tắc 2% Rủi ro (2% Risk Rule):** Không bao giờ để mức lỗ tiềm năng của 1 vị thế vượt quá **2% tổng NAV** của bạn.
2. **Quy mô vị thế (Position Sizing):** Mỗi mã cổ phiếu chỉ nên chiếm tối đa **20% - 25% NAV**, duy trì danh mục tối ưu từ 3 - 5 mã để dễ dàng kiểm soát.
3. **Ngưỡng dừng lỗ kỷ luật (Stoploss):** Cắt lỗ dứt khoát tại mức vi phạm **-7% đến -8%** tính từ điểm mua chuẩn, hoặc khi thủng đường MA50 đi kèm thanh khoản lớn.
4. **Hạ đòn bẩy Margin:** Khi chỉ số VN-Index tiến sát vùng kháng cự mạnh (1,300), nên đưa tỷ lệ Margin về mức an toàn (< 0.5) để phòng ngừa các nhịp 'shakeout' bất ngờ.`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "An toàn vốn",
        variant: "warning",
      },
    };
  }

  // 7. AlumiScore là gì
  if (
    q.includes("alumiscore") ||
    q.includes("điểm số") ||
    q.includes("cách tính") ||
    q.includes("tính điểm")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `💡 **Chỉ số AlumiScore là gì?**

**AlumiScore** (thang điểm 1 đến 10) là chỉ số định lượng độc quyền của **ALumiEye**, được thuật toán tổng hợp tự động mỗi ngày từ 4 nhân tố trọng yếu:

• **35% - Sức mạnh giá tương đối (RS Score):** Đo lường hiệu suất vượt trội của cổ phiếu so với VN-Index trong 1, 3, 6 tháng.
• **25% - Dòng tiền thông minh (Volume Accumulation):** Nhận diện hành vi gom hoặc xả hàng của Big Boys.
• **20% - Đồng thuận xu hướng (Trend Alignment):** Trạng thái sắp xếp lý tưởng của các đường MA10, MA20, MA50 và MA200.
• **20% - Tăng trưởng cơ bản (Fundamental Filter):** Điểm số EPS, ROE và tính lành mạnh của báo cáo tài chính.

⭐ **Thang đánh giá hành động:**
- **8.5 - 10.0:** Cổ phiếu dẫn dắt thị trường (Leader) 🚀
- **7.0 - 8.4:** Đang tích lũy xung lực tốt, cân nhắc giải ngân 📈
- **< 6.0:** Xung lực yếu hoặc có dấu hiệu phân phối, nên đứng ngoài ⚠️`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Mô hình Độc Quyền",
        variant: "brand",
      },
    };
  }

  // 1. Phân tích VN-INDEX / Toàn cảnh thị trường — xét sau mã & ngành vì từ khoá rất chung ("dòng tiền", "xu hướng")
  if (
    q.includes("vnindex") ||
    q.includes("vn-index") ||
    q.includes("thị trường") ||
    q.includes("index") ||
    q.includes("xu hướng") ||
    q.includes("dòng tiền")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `Dựa trên mô hình định lượng thời gian thực của **ALumiEye**:

📈 **Tổng quan VN-Index:**
• **Điểm số:** 1,288.6 (+8.42 điểm, +0.66%)
• **Thanh khoản:** 19,450 tỷ VNĐ (vượt +14.2% so với trung bình 20 phiên)
• **Độ rộng thị trường:** 285 mã tăng / 138 mã giảm — Dòng tiền lan tỏa mạnh sang nhóm Midcap và Chứng khoán.

🔍 **Đánh giá xu hướng định lượng từ Lumi:**
• **Regime thị trường:** **Tích lũy hướng lên (Bullish Consolidation)**.
• **Vùng hỗ trợ then chốt:** 1,270 - 1,275 điểm (MA20 ngày nâng đỡ tốt).
• **Vùng cản tâm lý:** 1,300 - 1,305 điểm.
• **Dòng tiền khối ngoại:** Mua ròng nhẹ +182 tỷ VNĐ (tập trung FPT, MWG, TCB).

💡 **Chiến lược hành động:**
Tỷ trọng cổ phiếu an toàn khuyến nghị ở mức **65% - 75% NAV**. Ưu tiên nắm giữ các mã giữ vững xu hướng trên MA20, tránh mua đuổi khi chỉ số chạm sát vùng 1,300 điểm.`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Bullish Consolidation",
        variant: "brand",
      },
      metrics: {
        symbol: "VN-INDEX",
        score: "7.8/10",
        trend: "Tích lũy tăng",
        support: "1,270 điểm",
        resistance: "1,300 điểm",
        action: "DUY TRÌ 70% CỔ PHIẾU",
      },
    };
  }

  // 8. Chào hỏi thân thiện
  if (
    q.includes("chào") ||
    /\b(hello|hi)\b/.test(q) ||
    q.includes("bạn là ai") ||
    q.includes("lumi là ai")
  ) {
    return {
      id: `msg-lumi-${Date.now()}`,
      sender: "lumi",
      text: `Chào bạn! Mình là chú cú mèo **Lumi** 🦉 — người bạn đồng hành định lượng của bạn tại **ALumiEye**!

Đôi mắt tròn của mình luôn theo dõi từng mili-giây biến động giá, thanh khoản và dòng tiền trên thị trường để giúp bạn đưa ra quyết định đầu tư lý trí và kỷ luật nhất.

Bạn có thể hỏi mình về:
1. Nhận định thị trường & VN-Index
2. Phân tích kỹ thuật các mã cổ phiếu cụ thể (FPT, HPG, MBB, SSI,...)
3. Quét tín hiệu Breakout, Pocket Pivot
4. Tư vấn quản trị rủi ro danh mục

Bạn muốn bắt đầu từ đâu nào? 😊`,
      timestamp: timeStr,
      mood: "happy",
      highlightBadge: {
        label: "Lumi 🦉",
        variant: "brand",
      },
    };
  }

  // 9. Phản hồi định lượng thông minh mặc định bằng Tiếng Việt
  return {
    id: `msg-lumi-${Date.now()}`,
    sender: "lumi",
    text: `Cảm ơn bạn đã hỏi Lumi về: **"${query}"**! 🦉

🔍 **Bóc tách góc nhìn định lượng từ ALumiEye:**
• **Động lượng dòng tiền:** Hệ thống ghi nhận thị trường hiện tại đang phân hóa mạnh. Dòng tiền thông minh chỉ tập trung vào các cổ phiếu có câu chuyện tăng trưởng lợi nhuận và giữ được kênh xu hướng MA20.
• **Độ biến động (ATR):** Ở mức trung bình 1.4%, cho thấy tâm lý nhà đầu tư tương đối ổn định, chưa có hiện tượng bán tháo hoảng loạn.
• **Ngưỡng rủi ro:** Khuyến nghị đặt tỷ lệ R/R (Risk/Reward) tối thiểu là **1 : 2.5** cho bất kỳ vị thế mở mới nào.

💡 **Gợi ý tiếp theo:**
Bạn có thể nhập tên cụ thể của một mã cổ phiếu (ví dụ: **FPT**, **HPG**, **SSI**, **MBB**) để Lumi hiển thị đầy đủ điểm số **AlumiScore**, hỗ trợ, kháng cự và tín hiệu vào lệnh chi tiết nhé!`,
    timestamp: timeStr,
    mood: "happy",
    highlightBadge: {
      label: "Phân tích Định lượng",
      variant: "brand",
    },
  };
}
