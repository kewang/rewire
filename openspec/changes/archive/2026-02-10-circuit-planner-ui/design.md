## Context

v0.7 的核心玩法是自由配迴路：玩家自己決定開幾條迴路、指派電器、選 NFB 和線材。型別已在 `free-circuit-data-model` change 中定義（`FreeCircuitLevel`, `Room`, `PanelConfig`），GameBoard 目前對 FreeCircuitLevel 直接 return（L489 TODO）。

本 change 需要：
1. 建立規劃階段 UI（3 個新元件）
2. 整合到 GameBoard 的狀態機中（planning → wiring/crimp/routing → simulation）
3. 將玩家規劃結果轉換為既有 Circuit[] + CircuitConfig[] 格式

**約束**：
- 不改動 simulation engine（stepMulti 已支援 mainBreakerRating）
- 不做相位選擇器和 ELCB toggle（延至 `planner-phase-elcb` change）
- 不做關卡資料（延至 `free-circuit-levels` change）
- 保持既有固定迴路流程完全不變

## Goals / Non-Goals

**Goals:**
- 玩家可在自由配迴路關卡中建立/刪除迴路（選電壓 + NFB）
- 玩家可將電器指派到迴路（含電壓匹配檢查）
- 每條迴路可拖曳選擇線材
- 規劃完成後轉換為 Circuit[] 進入既有模擬流程
- 成本計算包含 NFB 費用
- 送電前置條件檢查

**Non-Goals:**
- 相位選擇器 / ELCB toggle（planner-phase-elcb change）
- 主開關跳脫模擬（main-breaker-simulation change，已完成）
- 關卡定義（free-circuit-levels change）
- 走線整理整合（走線與固定迴路流程一致，不需額外處理）

## Decisions

### D1: 規劃階段狀態管理 — GameBoard 內部 useState

**選擇**：在 GameBoard 新增 `plannerCircuits` state（自建迴路陣列）和 `plannerAssignments` state（電器指派映射），規劃完成時轉換為 circuitConfigs + circuitWires + circuitAppliances。

**替代方案**：獨立的 PlannerContext — 增加複雜度但規劃狀態可被多個子元件直接存取。考慮到 GameBoard 已是 flat useState 風格且規劃狀態只在規劃階段使用，保持一致性選擇在 GameBoard 管理。

**理由**：保持與既有架構一致（所有狀態在 GameBoard），避免引入新的狀態管理模式。

### D2: 規劃階段 UI 作為 GameBoard render 的一個分支

**選擇**：GameBoard 增加 `gamePhase` state（'planning' | 'wiring' | 'simulation'），FreeCircuitLevel 進入時 phase='planning'，完成規劃後切到 'wiring'（沿用既有 UI）。

**替代方案**：CircuitPlanner 作為獨立頁面（新 route）— 不適合，因為需要共用 GameBoard 的 wiring/crimp/routing 狀態機。

**理由**：最小化改動。固定迴路走既有 render path（無 planning phase），自由配迴路多一個前置 planning phase。

### D3: 玩家自建迴路的資料結構

```typescript
interface PlannerCircuit {
  id: CircuitId;          // 自動生成 'pc-1', 'pc-2', ...
  voltage: 110 | 220;
  breaker: Breaker;
  assignedAppliances: Appliance[];  // 直接在 planner circuit 上管理
}
```

**理由**：扁平化結構，不需要額外的 assignment mapping。每條 planner circuit 直接持有已指派的電器。ID 使用 'pc-' prefix 區分，但轉換時映射到 'c1', 'c2', ... 的慣例格式。

### D4: 電器指派 — 點擊指派（不用拖曳）

**選擇**：點擊未指派電器 → 彈出目標迴路選單（或直接指派到唯一匹配電壓的迴路）。點擊已指派電器 → 移除指派。

**替代方案**：拖曳指派 — 增加觸控複雜度，且已有線材拖曳，避免兩種不同的拖曳行為混淆。

**理由**：點擊比拖曳簡單、觸控友好、開發成本低。

### D5: 規劃完成 → 轉換流程

規劃完成時（點擊「確認」按鈕）：
1. 驗證所有送電前置條件
2. 從 PlannerCircuit[] 生成 CircuitConfig[]（id 映射、breaker、voltage、availableAppliances = assignedAppliances）
3. 設定 circuitWires / circuitAppliances / wiring 等既有 state
4. 切換 gamePhase 到 'wiring'（若 requiresCrimp）或直接可送電
5. 後續壓接 / 走線 / 模擬完全沿用既有流程

### D6: 成本計算

自由配迴路成本 = Σ(wire.costPerMeter × 10 + NFB_COSTS[breaker.ratedCurrent] + (elcb ? 35 : 0))

NFB 成本在規劃階段即時顯示。ELCB 成本在 planner-phase-elcb change 加入，本 change 先不處理。

## Risks / Trade-offs

- **[Risk] 規劃轉換後狀態不一致** → 轉換函式為純函式，寫明確的 mapping 邏輯，轉換後 circuitIds / wiring / circuitAppliances 全部重設
- **[Risk] 新 UI 與既有 CSS 變數衝突** → 規劃 UI 使用 `.circuit-planner-*` 命名空間隔離
- **[Risk] 大量 state 在 GameBoard 中** → GameBoard 已是 state-heavy 元件，這是既定模式。若未來過於臃腫可提取 custom hook
- **[Trade-off] 不在本 change 做相位/ELCB** → 規劃 UI 先只有基礎功能（電壓+NFB+電器+線材），後續 change 疊加。可能需要在 CircuitCard 預留 slot 或 prop
