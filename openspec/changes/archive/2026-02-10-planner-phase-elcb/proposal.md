## Why

CircuitPlanner 目前只支援電壓切換、NFB 選擇、線材選擇。但 v0.7 的自由配迴路關卡（L11-L12 相位平衡、L13-L15 ELCB 漏電）需要玩家在規劃階段就能選擇相位（R/T）與切換 ELCB。缺少這兩個控制項，相位平衡和漏電保護的自由配迴路關卡無法運作。

## What Changes

- CircuitCard 新增**相位選擇器**（R/T toggle），僅在 `phaseMode` 存在且迴路為 110V 時顯示
- CircuitCard 新增 **ELCB toggle**，當迴路包含 wetArea 房間電器時出現；wetArea 迴路必須啟用 ELCB 才能送電
- PlannerCircuit 型別擴充 `phase` 和 `elcbEnabled` 欄位
- CircuitPlanner 摘要區新增**相位平衡預估**面板（R 相 / T 相 / N 線電流預估）
- GameBoard 確認配置時：從 PlannerCircuit 提取 phase → circuitPhases、elcb → circuitElcb
- GameBoard 確認配置時：動態解析 scripted leakageEvent 的 circuitId（映射到包含 wetArea 電器的實際迴路）
- 送電前置條件新增：所有 wetArea 迴路已啟用 ELCB
- 成本計算新增 ELCB 費用（$35/迴路）

## Capabilities

### New Capabilities
- `planner-phase-selector`: CircuitCard 內的相位選擇器 UI，支援 R/T 切換、110V 限定、phaseMode 條件顯示
- `planner-elcb-toggle`: CircuitCard 內的 ELCB 開關，wetArea 條件顯示、送電前強制驗證、成本計算整合
- `planner-phase-balance-preview`: CircuitPlanner 摘要區的相位平衡預估面板，即時計算 R/T/N 電流

### Modified Capabilities
- `circuit-planner`: PlannerCircuit 型別擴充 phase/elcbEnabled 欄位
- `planner-game-integration`: 確認配置時提取 phase/elcb 狀態、解析 leakageEvent circuitId、wetArea ELCB 送電驗證

## Impact

- `src/types/game.ts` — PlannerCircuit 新增 phase / elcbEnabled
- `src/components/CircuitCard.tsx` — 新增相位選擇器 + ELCB toggle
- `src/components/CircuitPlanner.tsx` — 新增 props + 相位平衡預估面板
- `src/components/GameBoard.tsx` — 確認配置邏輯 + leakageEvent 映射 + 前置條件驗證
- `src/App.css` — 新 UI 元件樣式
