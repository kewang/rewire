## Context

目前 NFB 送電控制是 GameBoard 內的一個獨立 `<button>` 元素（`.nfb-switch`），位於 CircuitDiagram 下方。操作方式為點擊切換 ON/OFF，缺乏配電箱操作的真實感。

真實 NFB 的操作是透過撥桿上扳（ON）/ 下扳（OFF），跳脫時撥桿會自動彈回中間或 OFF 位置。FR-D 要將此操作感帶入遊戲。

## Goals / Non-Goals

**Goals:**
- NFB 從按鈕改為 SVG 撥桿，整合在 CircuitDiagram 內
- 支援拖曳扳動與點擊切換兩種操作方式
- 送電/斷電有撥桿滑動動畫
- 跳脫/燒毀時撥桿自動彈回 OFF
- 撥桿禁用狀態有明確視覺區分

**Non-Goals:**
- 不做撥桿的物理模擬（彈簧、阻尼等）
- 不做觸覺回饋（vibration API）
- 不改變送電/斷電的邏輯條件（仍需接線 + 有電器）
- 不新增額外音效（沿用既有 playPowerOn / playTripped / playBurned）

## Decisions

### Decision 1：撥桿實作方式 — SVG 內嵌於 CircuitDiagram

**選擇：** 在 CircuitDiagram SVG 內新增撥桿圖形區域，取代 GameBoard 中的獨立 `<button>`。

**替代方案：**
- 獨立 SVG 元件放在 button 旁 → 位置割裂，不像真實配電箱
- CSS-only 模擬 toggle → 受限於 CSS 動畫能力，難以做撥桿拖曳

**理由：** 撥桿作為 NFB 的一部分，視覺上應與 NFB 矩形整合。放在 CircuitDiagram SVG 內最自然，也能利用既有 SVG 座標系統。

### Decision 2：撥桿操作方式 — 拖曳 + 點擊雙模式

**選擇：** 撥桿支援兩種操作：
1. **拖曳**：pointerdown 在撥桿上 → 上下拖曳 → 超過閾值切換狀態
2. **點擊**：快速 pointerdown + pointerup（無移動）→ 切換狀態

**替代方案：**
- 只有拖曳 → 增加操作步驟，快速測試時不方便
- 只有點擊 → 跟現在按鈕一樣，失去儀式感

**理由：** 雙模式兼顧儀式感與便利性。拖曳給沉浸感，點擊給效率。

### Decision 3：撥桿動畫 — CSS transition on SVG transform

**選擇：** 撥桿位置由 React state 決定（ON/OFF），透過 CSS `transition` on `transform: translateY()` 產生滑動動畫。

**替代方案：**
- requestAnimationFrame 手動動畫 → 過度複雜
- CSS @keyframes → 不適合 state-driven 的雙向動畫

**理由：** CSS transition 最簡單直接，React 控制狀態、CSS 控制動畫，職責分明。

### Decision 4：跳脫彈回動畫 — 延遲 + transition

**選擇：** 跳脫/燒毀時，先播放終態音效，然後撥桿以 transition 彈回 OFF 位置。不需要額外 setTimeout，因為 isPowered 從 true → false 會自然觸發 transition。

**理由：** 跳脫瞬間 GameBoard 已設定 `setIsPowered(false)`，CircuitDiagram 接收到 isPowered=false 後撥桿自動回 OFF，CSS transition 自然產生彈回動畫。

### Decision 5：撥桿 SVG 佈局

**選擇：** 擴展 NFB 矩形區域，在其右側或內部新增撥桿軌道與撥桿把手：
- 撥桿軌道：垂直長條形（NFB 本體內）
- 撥桿把手：較粗的矩形色塊，在軌道內上下移動
- ON 位置：撥桿在上方，把手顯示綠色
- OFF 位置：撥桿在下方，把手顯示灰色/暗色
- 禁用狀態：把手顯示半透明，軌道暗淡

**理由：** 符合真實 NFB 的外觀慣例，玩家一看就懂操作方式。

## Risks / Trade-offs

- **[觸控精度]** 撥桿把手在手機上可能太小不好操作 → 確保把手有足夠大的 touch target（至少 44x44 CSS px），必要時用透明擴大點擊區
- **[既有 button 移除]** 移除 `.nfb-switch` button 後，GameBoard 的 JSX 會變更 → 需同步更新 handlePowerToggle 的觸發方式（改由 CircuitDiagram callback）
- **[SVG viewBox 空間]** 現有 viewBox="0 0 200 280"，NFB 只佔 y=10~50 的區域 → 撥桿需要在現有空間內排列，可能需微調 NFB 矩形大小
