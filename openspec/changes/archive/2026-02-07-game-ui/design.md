## Context

模擬引擎（`src/engine/simulation.ts`）已完成，提供 `step()` 純函式和 `createInitialState()`。資料常數在 `src/data/constants.ts`。PRD 第 7 節定義了 UI 佈局：上方狀態列、左側配電箱、中央線路區、右側插座區、下方材料庫。v0.1 為單迴路、單 NFB。

## Goals / Non-Goals

**Goals:**
- 建立可互動的遊戲介面，讓玩家走完完整的 core loop
- 用 requestAnimationFrame 驅動模擬引擎
- 所有操作僅需滑鼠完成（PRD 非功能需求）
- 失敗時顯示原因與關鍵數字

**Non-Goals:**
- 不做拖拉接線的視覺化（v0.1 簡化為選擇式 UI）
- 不做 SVG/Canvas 線路繪圖（留給後續）
- 不做動畫特效或音效（FR-5 部分留給後續）
- 不引入 Zustand/Redux（useState 足夠 v0.1 單迴路）
- 不做關卡系統 UI（先做單一自由模式）

## Decisions

### Decision 1: 簡化為選擇式 UI 而非拖拉式

v0.1 不實作拖拉接線，改用按鈕/卡片選擇。理由：拖拉需要 SVG/Canvas 和複雜的互動邏輯，v0.1 的目標是驗證模擬引擎可以運作，選擇式 UI 能最快達到「可玩」。

### Decision 2: 元件拆分策略

```
App
└── GameBoard（主畫面，持有所有遊戲狀態）
    ├── StatusDisplay（上方：電流、熱度、狀態）
    ├── WireSelector（左側：選擇線材）
    ├── AppliancePanel（右側：加入/移除電器）
    ├── NFB 開關（內嵌於 GameBoard）
    └── ResultPanel（模態：失敗結果）
```

GameBoard 是唯一持有狀態的元件，子元件全部透過 props 接收資料和 callbacks。

### Decision 3: requestAnimationFrame 驅動模擬

送電時啟動 rAF loop，每幀呼叫 `step(circuit, state, dt)`。斷電或終態時停止 loop。使用 `useRef` 追蹤前一幀時間戳計算 dt。

### Decision 4: CSS 簡潔排版

使用 CSS Grid 或 Flexbox 做基本排版，不引入 CSS 框架。v0.1 只需功能性排版，視覺美化留給後續。

## Risks / Trade-offs

- **選擇式 UI 體驗較差** → v0.1 可接受，核心是驗證模擬引擎，拖拉式 UI 可在後續 change 疊加。
- **useState 可能在複雜化後不夠用** → 單迴路 + 單元件狀態下足夠，v0.2 多迴路時再評估 Zustand。
