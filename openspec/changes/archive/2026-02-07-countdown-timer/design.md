## Context

StatusDisplay 目前顯示「通電時間」（`state.elapsed`），但過關條件是存活指定秒數（`level.survivalTime`）。玩家需要自行心算剩餘時間，體驗不佳。

## Goals / Non-Goals

**Goals:**
- 在 StatusDisplay 中顯示剩餘時間倒數，取代或補充「通電時間」
- 計算方式：`remainingTime = max(0, survivalTime - elapsed)`

**Non-Goals:**
- 不修改模擬引擎邏輯
- 不新增獨立的倒數計時器元件（直接在 StatusDisplay 中處理）

## Decisions

### Decision 1: 在 StatusDisplay 中直接計算剩餘時間

新增 `survivalTime` prop，在元件內計算 `remainingTime = survivalTime - elapsed`。不需要在 SimulationState 中新增欄位，保持引擎純粹。

### Decision 2: 替換通電時間為剩餘時間

將原本的「通電時間」欄位改為「剩餘時間」倒數顯示，因為剩餘時間對玩家更有意義。未送電時顯示完整的 survivalTime。

## Risks / Trade-offs

- **未送電時的顯示** → 未送電時 elapsed 為 0，顯示完整 survivalTime，符合預期。
