## Context

目前 Rewire 所有關卡僅有「通關/失敗」二元結果。PRD v0.5 規劃三星評分系統，為 L01-L17（及後續 L18-L20）提供分層評等。評分為純 UI/邏輯層，不影響模擬引擎。

現有結果流程：GameBoard 計算 finalCost + worstStatus → 傳給 ResultPanel 顯示通關/失敗。

## Goals / Non-Goals

**Goals:**
- 為每關加入 1-3 星評分（通關→成本達標→獎勵目標）
- 5 種 bonusCondition 類型正確判定
- localStorage 持久化歷史最佳星等
- ResultPanel 與 LevelSelect 呈現星等視覺

**Non-Goals:**
- 不改動模擬引擎（simulation.ts）
- 不新增後端儲存
- 不做成就系統或排行榜

## Decisions

### 1. 星等計算放在 GameBoard 結果判定時

**選擇**：在 GameBoard 的結果判定流程（送電結束 / 燒線 / 時間到）計算星等，與 finalCost、worstStatus 一起傳給 ResultPanel。

**理由**：GameBoard 已掌握所有遊戲狀態（成本、時間、迴路狀態、壓接品質、是否有 warning/trip），無需額外 hook 或 context。

**替代方案**：在 ResultPanel 內計算 — 但 ResultPanel 目前是純展示元件，不應承擔邏輯。

### 2. 追蹤 warning/trip 事件用 useRef flag

**選擇**：GameBoard 用 `hasWarningRef` 和 `hasTripRef` 的 useRef boolean，在 rAF loop 中偵測到 warning/tripped/elcb-tripped 時設為 true。

**理由**：bonusCondition `no-warning` 和 `no-trip` 需要知道「全程是否曾經」進入該狀態。useRef 不觸發 re-render，適合 rAF loop 內的累積偵測。

### 3. BonusCondition 為 discriminated union

**選擇**：`BonusCondition = { type: 'no-warning' } | { type: 'under-budget-ratio', ratio: number } | ...`

**理由**：TypeScript discriminated union 提供型別安全的 exhaustive check，各 condition 參數不同。

### 4. localStorage key 格式

**選擇**：單一 key `rewire-stars`，value 為 JSON `Record<number, 0|1|2|3>`（number = level index）。

**理由**：簡單、一次讀寫，不需 per-level key。level index（0-based）作為 key，與 levels array index 一致。

### 5. 星等計算函式獨立抽出

**選擇**：新增 `src/engine/scoring.ts`，export `calcStars(context): { stars: number, details: StarDetail[] }` 純函式。

**理由**：方便測試、不與 React 元件耦合。`StarDetail` 包含每顆星的條件文字與是否達成。

## Risks / Trade-offs

- **[Risk] bonusCondition 未定義的舊關卡** → Mitigation: bonusCondition 為可選欄位，未定義時 3 星不可達（最高 2 星），或可配置為預設 `no-warning`。依 PRD 規劃，L01-L17 全部配置 bonusCondition，不存在未定義情況。
- **[Risk] localStorage 被清除** → Mitigation: 星等歸零不影響遊戲功能，重玩即可恢復。
- **[Trade-off] 單一 localStorage key** → 大量關卡時 JSON 較大，但 20 關以內完全無性能問題。
