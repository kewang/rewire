## Why

GameBoard.tsx 目前有 1958 行，集中了模擬迴圈、迴路狀態管理、老屋邏輯、平面圖互動、規劃器狀態等五大職責，已成為維護瓶頸。PRD v0.10 FR-L-B 要求將其拆分為獨立 custom hooks，降至 < 500 行，提升可維護性，且零功能變更。

## What Changes

- 從 GameBoard.tsx 抽取 5 個 custom hooks 至 `src/hooks/` 目錄：
  - `useSimulationLoop` — rAF loop、step/stepMulti 呼叫、漏電事件處理、計時、buzzing 控制
  - `useCircuitState` — circuitWires/Appliances/Crimps/Breakers、wiring state、接線/拖曳操作、ELCB/phase toggle
  - `useOldHouseLogic` — problemCircuits、preWiredCircuitIds、拆線/修復、BreakerSelector、老屋快照
  - `useFloorPlanInteraction` — 拖曳 drop zone、房間 highlight、routing strategies/distances/paths、popover 狀態、FloorPlanView 衍生資料（assignments/connectedPaths/simulationState/problemRooms）
  - `usePlannerState` — plannerCircuits CRUD、phase/elcb toggle、assignAppliance/unassign、confirmPlanning、成本/驗證計算
- GameBoard.tsx 僅保留 hook 組裝 + JSX 渲染（目標 < 500 行）
- 純重構，零功能變更

## Capabilities

### New Capabilities
- `gameboard-hooks`: Custom hooks 抽取架構，定義各 hook 的職責邊界、介面契約、與 GameBoard 的互動方式

### Modified Capabilities
（無需求層級變更，純內部重構）

## Impact

- `src/components/GameBoard.tsx` — 大幅瘦身（1958 → <500 行）
- 新增 `src/hooks/useSimulationLoop.ts`
- 新增 `src/hooks/useCircuitState.ts`
- 新增 `src/hooks/useOldHouseLogic.ts`
- 新增 `src/hooks/useFloorPlanInteraction.ts`
- 新增 `src/hooks/usePlannerState.ts`
- 無 API/型別/依賴/外部系統變更
