## Context

遊戲的模擬引擎和 UI 已完整，包含關卡系統。SimulationState 提供 wireHeat (0~1) 和 status，可以直接驅動視覺效果。PRD FR-5 要求線色變化、冒煙粒子、音效。

## Goals / Non-Goals

**Goals:**
- 用 SVG 繪製簡化的線路圖（NFB → 線 → 插座），嵌入 GameBoard 中央區域
- 線色根據 wireHeat 插值：白色(0) → 黃色(0.3) → 紅色(0.7) → 黑色(1.0)
- 過載/燒毀時加入 CSS 動畫（發光、煙霧效果）
- 用 Web Audio API 在狀態轉換時播放簡單提示音

**Non-Goals:**
- 不做精細的粒子系統（用 CSS 動畫模擬即可）
- 不做外部音檔載入（純程式產生的提示音）
- 不做拖拉接線互動

## Decisions

### Decision 1: SVG 內嵌於 React 元件

用 React 元件直接產生 SVG，方便根據 state 動態更新顏色和動畫。不使用 Canvas（SVG 更適合簡單的靜態線路圖）。

### Decision 2: 線色使用 HSL 插值

wireHeat 0→1 對應：
- 0.0: hsl(0, 0%, 90%) 白
- 0.3: hsl(45, 100%, 50%) 黃
- 0.7: hsl(0, 100%, 50%) 紅
- 1.0: hsl(0, 0%, 10%) 黑

用分段線性插值，讓顏色變化直覺且平滑。

### Decision 3: Web Audio API 產生提示音

使用 OscillatorNode 產生短促的提示音：
- warning: 中頻短音
- tripped: 低頻長音
- burned: 低頻漸弱
- won: 高頻上行音

不需要額外依賴。

## Risks / Trade-offs

- **Web Audio API 在某些瀏覽器需要使用者互動才能啟用** → NFB 送電按鈕的 click 事件即可滿足此條件。
- **SVG 線路圖較簡化** → v0.1 夠用，後續可升級為更精細的圖示。
