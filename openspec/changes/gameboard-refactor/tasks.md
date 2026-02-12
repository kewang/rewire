## 1. 前置準備

- [ ] 1.1 將 `GameResult` 和 `GamePhase` 型別從 GameBoard.tsx 搬到 `src/types/game.ts` 並 export
- [ ] 1.2 建立 `src/hooks/` 目錄

## 2. 抽取 usePlannerState

- [ ] 2.1 建立 `src/hooks/usePlannerState.ts`，搬入 plannerCircuits/plannerNextId/selectedPlannerCircuitId state 及所有 planner handler（handleAddPlannerCircuit, handleDeletePlannerCircuit, handleChangePlannerVoltage, handleChangePlannerBreaker, handleSelectPlannerWire, handleAssignAppliance, handleUnassignPlannerAppliance, handleChangePlannerPhase, handleChangePlannerElcb, handleAssignRoomToCircuit, handleAddCircuitAndAssignRoom, handleUnassignRoom, handleConfirmPlanning）和衍生值（plannerTotalCost, plannerAllAssigned, plannerAllWired, plannerWetAreaMissingElcb, plannerCanConfirm, plannerConfirmTooltip），提供 reset 方法
- [ ] 2.2 在 GameBoard.tsx 中 import usePlannerState 並替換對應的 state/handler，驗證 lint + build 通過

## 3. 抽取 useCircuitState

- [ ] 3.1 建立 `src/hooks/useCircuitState.ts`，搬入 circuitWires/circuitAppliances/circuitCrimps/wiring/circuitElcb/circuitPhases state、createInitialWiring/createInitialCircuitWires 函式、circuits useMemo 衍生、所有 ref 同步（circuitWiresRef/circuitElcbRef/circuitPhasesRef/circuitCrimpsRef）、及 handler（handleDragStart, handleDragMove, handleDragEnd, handleCrimpComplete, handleTargetCircuitChange, handleToggleElcb, handleTogglePhase, handleAddAppliance, handleRemoveAppliance, prevWiringCircuitsSync 同步邏輯），提供 reset 方法
- [ ] 3.2 在 GameBoard.tsx 中 import useCircuitState 並替換對應邏輯，驗證 lint + build 通過

## 4. 抽取 useOldHouseLogic

- [ ] 4.1 建立 `src/hooks/useOldHouseLogic.ts`，搬入 preWiredCircuitIds/preWiredCircuitIdsRef/circuitBreakers/oldHouseSnapshot state、problemCircuits useMemo 衍生、handleUnwire/handleChangeBreaker handler、initOldHouse 方法（從 handleSelectLevel 中抽取老屋初始化邏輯），提供 reset 方法
- [ ] 4.2 在 GameBoard.tsx 中 import useOldHouseLogic 並替換對應邏輯，驗證 lint + build 通過

## 5. 抽取 useFloorPlanInteraction

- [ ] 5.1 建立 `src/hooks/useFloorPlanInteraction.ts`，搬入 circuitRouteDistances/circuitRoutePaths/pendingRoutingCircuit/candidateRoutes/floorPlanHighlightedRoom/floorPlanHighlightedRoomRef/sidebarCollapsed/roomPopover state、衍生 useMemo（floorPlanCircuitAssignments, floorPlanConnectedPaths, floorPlanCandidatePaths, floorPlanSimulationState, floorPlanProblemRooms, floorPlanRoomCircuitMap, floorPlanApplianceCounts, floorPlanApplianceDetails）、handler（handleFloorPlanRoomClick, handleFloorPlanRoomHover, handleSelectRoutingStrategy, handleCancelRoutingStrategy, completeFloorPlanWiring, initiateFloorPlanWiring），提供 reset 方法
- [ ] 5.2 在 GameBoard.tsx 中 import useFloorPlanInteraction 並替換對應邏輯，驗證 lint + build 通過

## 6. 抽取 useSimulationLoop

- [ ] 6.1 建立 `src/hooks/useSimulationLoop.ts`，搬入 multiState/isPowered/result/starResult state、所有 rAF 相關 ref（rafRef/prevTimeRef/multiStateRef/buzzingRef/hasWarningRef/hasTripRef/firedLeakageEventsRef/resolvedLeakageEventsRef/tickRef）、tick callback（含漏電事件/buzzing/終態/勝利判定）、handlePowerToggle、cleanup useEffect，提供 reset 方法
- [ ] 6.2 在 GameBoard.tsx 中 import useSimulationLoop 並替換對應邏輯，驗證 lint + build 通過

## 7. GameBoard 瘦身與收尾

- [ ] 7.1 重構 handleSelectLevel/handleRetry/handleBackToLevels 改為呼叫各 hook 的 reset 方法
- [ ] 7.2 清理 GameBoard.tsx 中已不需要的 import、移除空白行，確認行數 < 500
- [ ] 7.3 執行 `npm run lint` 確認零 error/warning
- [ ] 7.4 執行 `npm run build` 確認建置成功
- [ ] 7.5 agent-browser smoke test：驗證基本遊戲流程（選關→接線→送電→結果）無回歸
