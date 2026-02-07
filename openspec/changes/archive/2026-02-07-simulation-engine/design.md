## Context

遊戲型別（Wire, Appliance, Breaker, Circuit, SimulationStatus）和預設常數已定義完成。PRD FR-4 規定模擬迴圈需要在每個時間步長 dt 更新電流、跳脫判定和線材熱度。最終 UI 會透過 requestAnimationFrame 驅動，但引擎本身應為純函式，不依賴瀏覽器 API。

## Goals / Non-Goals

**Goals:**
- 實作純函式模擬引擎，輸入 Circuit + 當前狀態 + dt，輸出新狀態
- 所有計算可重現（相同輸入 = 相同輸出），符合 PRD 非功能需求
- 引擎與 UI/框架完全解耦

**Non-Goals:**
- 不處理 UI 渲染或動畫
- 不處理狀態管理（Zustand/Redux）
- 不處理使用者輸入或事件
- 不實作多迴路（v0.2 範圍）

## Decisions

### Decision 1: 純函式設計（無副作用）

模擬引擎所有函式皆為純函式：`(state, input) => newState`。不使用 class 或可變狀態。理由：容易測試、結果可重現、未來容易與任何狀態管理方案整合。

替代方案：OOP 模擬器 class。缺點是狀態可變性增加測試難度，且與 React 的不可變資料流不一致。

### Decision 2: SimulationState 物件承載所有動態數據

定義 `SimulationState` 介面，包含：
- `status`: SimulationStatus（normal/warning/tripped/burned）
- `totalCurrent`: 當前總電流 (A)
- `wireHeat`: 線材熱度（0.0 ~ 1.0，1.0 = 燒毀）
- `elapsed`: 已通電時間（秒）
- `breakerTripTimer`: 跳脫計時器（超過額定時開始累計）

每次 step 產生新的 SimulationState，不修改原物件。

### Decision 3: 熱度模型簡化為線性累積/冷卻

- 電流 > 線材安全電流時：`heat += (I / maxCurrent - 1) * heatRate * dt`
- 電流 ≤ 線材安全電流時：`heat -= coolRate * dt`
- heat clamp 在 [0, 1]，達到 1.0 即燒毀
- heatRate 和 coolRate 為可調常數

理由：v0.1 不需要精確的物理模型，線性模型足以產生「過載約 3 秒燒毀」的體驗（PRD 要求）。

## Risks / Trade-offs

- **熱度模型過於簡化** → v0.1 可接受，後續可替換為更真實的模型而不影響介面。
- **dt 精度問題** → requestAnimationFrame 的 dt 不固定，但純函式設計使得固定步長或可變步長都可支援。
