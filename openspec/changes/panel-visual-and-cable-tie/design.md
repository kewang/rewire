## Context

PanelInteriorView 繪製配電箱 SVG，目前走線全部使用線徑色（wireGaugeColor），玩家看不出哪條線接 R、哪條接 T。中性線完全沒畫。束帶放置是單純 click toggle，缺乏遊戲性。壓接小遊戲（CrimpMiniGame）已建立進度條甜蜜區的 pattern，可作為束帶小遊戲的參考。

## Goals / Non-Goals

**Goals:**
- 讓玩家從 SVG 一眼看出每條線的相位歸屬（R/T/220V）
- 讓玩家理解每個迴路包含火線+中性線回路
- 束帶放置增加技巧性互動，提升遊戲性
- 束帶品質結果影響整線分數

**Non-Goals:**
- 不重新設計走線區拖曳機制
- 不改變交叉偵測邏輯
- 不修改 GameBoard 或 simulation engine
- 不增加束帶種類選擇（與壓接端子區別）

## Decisions

### D1: 走線相位色漸層

走線路徑分三段：匯流排→走線區入口（上段）、走線區（中段）、走線區出口→NFB（下段）。

- **上段**：使用相位色（R=#ef4444 紅、T=#60a5fa 藍、220V=#a855f7 紫）
- **中段**：用 SVG linearGradient 從相位色漸變到線徑色
- **下段**：使用線徑色（現有 wireGaugeColor）

替代方案：全程相位色 → 捨棄，因為線徑色是重要資訊（玩家需辨識用了哪種線材）。
替代方案：只在 tap point 加相位色圓點 → 捨棄，太不明顯。

### D2: 匯流排 tap point 放大 + 標注

現有 tap point 是 r=3 的小圓點，改為：
- 放大至 r=5，加上相位色填充（而非統一橘色）
- tap point 旁加上小文字標籤「R」或「T」（跟隨相位色）
- 220V 迴路在 R 和 T 銅排上都有 tap point，中間用短虛線連接

### D3: 中性線回路虛線

每個 110V 迴路新增一條灰色虛線（strokeDasharray="4 4"），從 NFB 下方接到 N 匯流排。路徑：NFB 底部 → 垂直向下延伸 → 水平到 N 匯流排 tap point。

- 使用 opacity 0.3，不干擾主要走線視覺
- 220V 迴路不畫 N 回路（跨 R-T，無中性線）
- N 匯流排 tap point 也放大並標注

替代方案：N 回路走在走線區內 → 捨棄，太擁擠且混淆交叉偵測。

### D4: 束帶拉緊度小遊戲

參考 CrimpMiniGame 的進度條模式，但簡化為單步驟（無端子選擇）：

1. 點擊束帶放置點 → 彈出 inline 小遊戲（非 overlay，就在放置點旁邊展開）
2. 進度條自動來回掃描（0→1→0 循環），速度 BAR_SPEED=1.0（比壓接稍快）
3. 玩家點擊停止：
   - 甜蜜區中央（0.45-0.55）= tight（完美）：+0 分扣（滿分）
   - 好區域（0.30-0.70）= good（良好）：-2 分扣
   - 外圍（<0.30 或 >0.70）= loose（太鬆）或 over-tight（太緊）：-5 分扣
4. 結果即時顯示 0.8 秒後自動關閉，束帶放置完成

語意：進度條左側=太鬆（LOOSE）、中間=適當（TIGHT）、右側=過緊（OVER-TIGHT）。

替代方案：拖曳纏繞手勢 → 捨棄，觸控/滑鼠行為差異大，實作複雜。
替代方案：限量束帶資源 → 可未來追加，本次不做。

### D5: 束帶品質影響評分

修改 `calcAestheticsScore`：

- 現有：每個未束帶 pair 扣 UNBUNDLED_PENALTY(5) 分
- 新增：已束帶 pair 的品質影響分數
  - tight: 不扣分（0）
  - good: 扣 CABLE_TIE_GOOD_PENALTY(2) 分
  - loose/over-tight: 扣 CABLE_TIE_POOR_PENALTY(5) 分（等同未束帶）

資料結構：`cableTies: Set<number>` → `cableTies: Map<number, CableTieQuality>`

### D6: CableTieQuality 型別

新增型別 `CableTieQuality = 'tight' | 'good' | 'loose' | 'over-tight'`，定義在 `src/types/game.ts`。

## Risks / Trade-offs

- [SVG 複雜度增加] → 中性線用低 opacity 虛線，相位色只在上段，控制視覺噪音
- [束帶小遊戲打斷拖曳流程] → 使用 inline 展開而非 overlay，保持上下文；0.8 秒自動關閉減少中斷感
- [cableTies 型別從 Set 改 Map] → 需同步修改 GameBoard 的 cableTies state 和 PanelInteriorView props，影響面可控
- [進度條速度太快/太慢] → 設為常數 BAR_SPEED，方便後續調整
