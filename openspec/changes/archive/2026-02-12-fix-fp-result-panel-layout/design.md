## Context

平面圖模式（fp-layout）採用 `height: 100vh` + `overflow: hidden` 的 flex column 佈局：

```
.game-board.fp-layout (height: 100vh, overflow: hidden, flex column)
├── header.game-header (flex-shrink: 0)
├── div.fp-main (flex: 1, min-height: 0, overflow: hidden)
│   ├── div.sidebar-collapsed
│   └── div.fp-center (flex: 1, overflow-y: auto)
│       ├── FloorPlanView (max-height: 100%)
│       └── routing-button
├── WireToolbar (flex-shrink: 0)
└── {overlays}  ← ResultPanel 在這裡，佔用 flex 空間
```

通關時 ResultPanel（inline 元素，非 position:fixed）作為 `.fp-layout` 的直接 flex 子元素渲染，擠壓 `.fp-main` 的空間配額，導致 FloorPlanView 被壓縮至極小。

## Goals / Non-Goals

**Goals:**
- 通關後 FloorPlanView 維持合理尺寸，不被 ResultPanel 壓縮
- ResultPanel 在平面圖模式中可捲動檢視
- 不影響 legacy 三欄佈局的行為

**Non-Goals:**
- 不重新設計整體 fp-layout 結構
- 不改動 ResultPanel 內部邏輯或樣式

## Decisions

### Decision 1: 將 ResultPanel 移入 `.fp-center` 內部

**選擇**: 在 fp-layout 分支中，ResultPanel 渲染在 `.fp-center` 內（FloorPlanView 下方），而非 `.fp-layout` 直接子元素。

**替代方案**:
- A) ResultPanel 改為 `position: fixed` overlay → 會遮擋平面圖，且與 legacy 佈局行為不一致
- B) `.fp-layout` 改為 `min-height: 100vh` + `overflow: auto` → 整個頁面可捲動，header/toolbar 會被捲走

**理由**: `.fp-center` 已有 `overflow-y: auto`，是天然的捲動容器。ResultPanel 放在裡面可以自然捲動，且 FloorPlanView 不會被壓縮。

### Decision 2: 拆分 overlays 為 resultPanel + modalOverlays

**選擇**: 將 GameBoard 中的 `overlays` 變數拆為 `resultPanel`（inline 內容）和 `modalOverlays`（position:fixed 彈窗），兩個佈局分支各自決定 resultPanel 放置位置。

**理由**: PanelInteriorView、RoutingStrategyPicker、CrimpMiniGame 是 fixed/absolute 定位的 overlay，不佔 flex 空間，可以留在原位。只有 ResultPanel 是 inline 元素需要特殊處理。

### Decision 3: FloorPlanView 加 min-height + fp-center 改用 flex-start

**選擇**: `.fp-center .floor-plan-view` 加 `min-height: 40vh`；`.fp-center` 的 `justify-content` 保留 `center` 但加上 `flex-shrink: 0` 給 FloorPlanView，確保有 ResultPanel 時仍可正常捲動。

**理由**: `min-height` 確保 FloorPlanView 即使在極端情況下也不會被壓縮到不可用。

## Risks / Trade-offs

- [Risk] `justify-content: center` + `overflow-y: auto` 可能導致頂部內容不可及 → Mitigation: FloorPlanView 使用 `flex-shrink: 0` 確保不被壓縮，容器內容超出時自然捲動到底部（scrollIntoView 已存在）
- [Risk] legacy 佈局行為改變 → Mitigation: legacy 分支仍使用原本的 overlays 結構（resultPanel + modalOverlays 拼在一起），行為不變
