## Context

L22（5 迴路）和 L23（6 迴路）的電路圖 SVG 在桌面版三欄佈局下嚴重縮小。

根因分析：
1. SVG `maxWidth` 設為 `n × 260`（5 迴路 = 1300px，6 迴路 = 1560px）
2. `.game-board.multi-circuit` max-width 為 1280px
3. `.game-main` grid 為 `180px 1fr 220px`，扣除側欄+gap 後中欄只剩 ~830px
4. SVG `width="100%"` 被容器限制，整個等比縮小
5. 所有迴路排成一橫列，迴路數增加時只會無限延伸寬度

## Goals / Non-Goals

**Goals:**
- 4+ 迴路的電路圖在桌面版可清楚辨識 NFB、插座、線材
- 未來 8、10+ 迴路也能自然 scale
- 不破壞 1-3 迴路的現有佈局
- 平板和手機版不受影響（已是 flex column 全寬）

**Non-Goals:**
- 不改變 SingleCircuitSVG 繪圖邏輯（每個迴路內部 200×280 不變）
- 不改變三欄→兩欄→單欄的斷點策略

## Decisions

### Decision 1: SVG 內部多行排列（MAX_CIRCUITS_PER_ROW = 4）

**選擇**：在 CircuitDiagram 內部，當迴路數超過 MAX_CIRCUITS_PER_ROW（4）時，自動換行排列。

- viewBox 寬度 = `min(n, MAX_PER_ROW) × CIRCUIT_WIDTH`
- viewBox 高度 = `rows × CIRCUIT_HEIGHT + (rows-1) × ROW_GAP`
- 每個 SingleCircuitSVG 的 x = `(i % MAX_PER_ROW) × CIRCUIT_WIDTH`
- 每個 SingleCircuitSVG 的 y = `floor(i / MAX_PER_ROW) × (CIRCUIT_HEIGHT + ROW_GAP)`

範例：6 迴路 → 第一排 4 個、第二排 2 個
```
[c1] [c2] [c3] [c4]
[c5] [c6]
```

**替代方案**：
- A) CSS flex-wrap 多個獨立 SVG → 需大幅重構（電源開關、拖曳互動都在同一 SVG 內）
- B) 桌面版改垂直堆疊 → 只解決容器問題，8+ 迴路一橫列仍然擠
- C) 水平捲動 → UX 差，看不到全貌

**理由**：保持 SVG 架構不變，只改排列座標計算。電源開關、拖曳互動等共享元素都在同一 SVG 內，不需重構。未來迴路再多也能自然排成 3、4 行。

### Decision 2: SVG maxWidth 跟隨實際欄數

**選擇**：`maxWidth = min(n, MAX_PER_ROW) × 260`，不再是 `n × 260`。

**理由**：多行排列後，寬度由每行迴路數決定（最多 4 個 = 1040px），在中欄 830px 或全寬都能合理顯示。

### Decision 3: 多迴路（≥4）桌面版改為 flex column

**選擇**：當迴路數 ≥ 4 時，桌面版 `.game-main` 改為垂直堆疊，電路圖佔全寬。

**理由**：4×260=1040px 在三欄中欄 830px 放不下，改全寬後有充裕空間。2-3 迴路不受影響。

## Risks / Trade-offs

- [風險] 多行排列後頁面較長 → 可接受，每行 280px 高度，2 行約 580px
- [風險] 拖曳 drop zone 的 circuitIndex 計算需配合多行 → 需更新 svgX/svgY 判定
- [風險] 全域電源開關位置需調整 → 放在第一行上方即可
