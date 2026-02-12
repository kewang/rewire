## Context

GameBoard.tsx 目前 1958 行，是整個遊戲的核心控制器，集中了五大職責：

1. **模擬迴圈**（~180 行）：rAF tick、stepMulti、漏電事件處理、buzzing 管理、勝負判定
2. **迴路狀態**（~250 行）：circuitWires/Appliances/Crimps、wiring 拖曳、ELCB/phase toggle、接線完成/走線替換
3. **老屋邏輯**（~100 行 + handleSelectLevel/handleRetry 中的 ~150 行）：problemCircuits 衍生、preWiredCircuitIds、拆線、breaker 更換、快照
4. **平面圖互動**（~300 行）：房間 highlight、routing strategies、drop zone、popover、衍生 useMemo（assignments/connectedPaths/simulationState/problemRooms）
5. **規劃器狀態**（~300 行）：plannerCircuits CRUD、phase/elcb toggle、assignAppliance、confirmPlanning、成本/驗證

此外還有 ~200 行 handleSelectLevel + ~150 行 handleRetry + ~100 行 handleBackToLevels + ~400 行 JSX 渲染。

## Goals / Non-Goals

**Goals:**
- 將 GameBoard.tsx 從 1958 行降至 < 500 行
- 抽取 5 個 custom hooks 至 `src/hooks/` 目錄
- 每個 hook 職責清晰、介面明確
- 零功能變更（pure refactor）
- lint + build 通過

**Non-Goals:**
- 不改變任何遊戲行為或視覺呈現
- 不引入新的狀態管理庫
- 不重構 JSX 結構（僅搬移邏輯）
- 不拆分其他元件（如 CircuitDiagram）
- 不重構 CSS（另有 FR-L-C）

## Decisions

### D1: Hook 邊界劃分策略

**選擇：按功能領域（domain）拆分為 5 個 hooks**

| Hook | 主要 state | 主要 callbacks | 行數預估 |
|------|-----------|---------------|---------|
| `useSimulationLoop` | multiState, isPowered, result, starResult | tick, handlePowerToggle | ~250 |
| `useCircuitState` | circuitWires, circuitAppliances, circuitCrimps, wiring, circuitElcb, circuitPhases | handleDragStart/Move/End, handleCrimpComplete, handleToggleElcb/Phase, handleAddAppliance/Remove | ~300 |
| `useOldHouseLogic` | preWiredCircuitIds, circuitBreakers, oldHouseSnapshot, problemCircuits | handleUnwire, handleChangeBreaker, initOldHouse | ~200 |
| `useFloorPlanInteraction` | circuitRouteDistances, circuitRoutePaths, pendingRoutingCircuit, candidateRoutes, floorPlanHighlightedRoom, roomPopover, sidebarCollapsed | handleFloorPlanRoomClick/Hover, handleSelectRoutingStrategy, completeFloorPlanWiring + 衍生 useMemo | ~350 |
| `usePlannerState` | plannerCircuits, plannerNextId, selectedPlannerCircuitId, gamePhase | handleAddPlannerCircuit, handleConfirmPlanning, handleAssignAppliance 等 | ~300 |

**替代方案 — 按生命週期拆分（setup/run/teardown）**：不採用，因為同一領域的 state 和 handler 會分散到多個 hooks，增加理解成本。

### D2: Hook 間共享狀態的傳遞方式

**選擇：hooks 回傳 state + setters，GameBoard 負責銜接**

各 hook 回傳自己的 state 和 handler。需要跨 hook 協作時（例如 useSimulationLoop 需要 circuits 來自 useCircuitState），由 GameBoard 將一個 hook 的輸出作為另一個 hook 的輸入參數傳入。

```typescript
// GameBoard.tsx 組裝示範
const planner = usePlannerState({ currentLevel });
const circuitState = useCircuitState({ resolvedConfigs: planner.resolvedConfigs, ... });
const oldHouse = useOldHouseLogic({ currentLevel, circuitWires: circuitState.circuitWires, ... });
const floorPlan = useFloorPlanInteraction({ currentLevel, circuitIds, roomToCircuitMap, ... });
const sim = useSimulationLoop({ circuits: circuitState.circuits, isPowered, ... });
```

**替代方案 — Context / 全域 store**：不採用，違反專案「無狀態管理庫」慣例。

**替代方案 — 單一 useReducer**：不採用，將 1958 行的 setState 搬到 reducer 只是換個形式，不降低複雜度。

### D3: handleSelectLevel / handleRetry / handleBackToLevels 的處理

**選擇：保留在 GameBoard 中，呼叫各 hook 的 reset 方法**

這三個 handler 跨越所有五個 hook 的 state reset。拆入任何一個 hook 都會造成循環依賴。因此保留在 GameBoard 中，每個 hook 暴露一個 `reset()` 方法供 GameBoard 呼叫。

```typescript
// 每個 hook 暴露 reset
const handleRetry = () => {
  sim.reset();
  circuitState.reset(circuitIds, currentLevel);
  oldHouse.reset(currentLevel);
  floorPlan.reset();
  planner.reset(currentLevel);
};
```

### D4: Ref 同步模式

GameBoard 目前大量使用 `xxxRef` + `useEffect(() => { xxxRef.current = xxx })` 模式讓 rAF callback 讀取最新值。這些 ref 會隨對應的 state 移入各 hook。在 useSimulationLoop 中需要讀取其他 hook 的 state 時，透過參數傳入 ref 或直接傳值（由 hook 內部建 ref）。

**選擇：各 hook 管理自己的 ref，useSimulationLoop 接收必要的 ref 作為參數**

### D5: 型別定義位置

**選擇：各 hook 的參數與回傳型別定義在各自檔案中**

`GameResult` 和 `GamePhase` 型別搬到 `src/types/game.ts`（它們被多個 hook 使用）。每個 hook 定義自己的 `UseXxxParams` / `UseXxxReturn` 介面。

### D6: 工具函式位置

`createInitialWiring` 和 `createInitialCircuitWires` 兩個輔助函式目前在 GameBoard.tsx 頂部。搬到使用它們的 hook 檔案中（useCircuitState.ts），或保留為 GameBoard 內的 local function（如果多個 hook 都需要）。

**選擇：搬到 `src/hooks/useCircuitState.ts`**（這兩個函式只被 circuit state 管理使用）。

## Risks / Trade-offs

- **[風險] 跨 hook 依賴可能導致渲染次數增加** → 緩解：hooks 透過參數（非 context）傳遞，React 批次更新機制足以應對
- **[風險] rAF callback 中的 stale closure 風險增加** → 緩解：維持現有 ref 同步模式，確保 tick 函式讀取 ref 而非 state
- **[風險] 重構範圍大，可能引入迴歸** → 緩解：逐 hook 抽取、每步 lint + build 驗證、agent-browser smoke test
- **[取捨] GameBoard 仍需 ~400-500 行** → 接受：handleSelectLevel/Retry/BackToLevels 的跨 hook reset + JSX 渲染無法再減
