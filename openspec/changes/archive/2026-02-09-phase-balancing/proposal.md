## Why

v0.4 目標之一是引入單相三線制相位平衡（FR-E），讓玩家理解「不只是電流大小，分配也很重要」。目前模擬引擎只關注個別迴路的負載，缺少紅相/黑相平衡與中性線過載的概念。FR-G 已完成材料擴充，現在有足夠的電器種類來設計相位平衡關卡。

## What Changes

- 型別系統：CircuitConfig 新增 `phase?: 'R' | 'T'`（110V 迴路相位）、Level 新增 `phaseMode?: 'auto' | 'manual'`
- MultiCircuitState 新增中性線狀態（neutralCurrent、neutralHeat）
- 模擬引擎：stepMulti() 加入中性線電流計算 `I_N = |Σ I_R − Σ I_T|` 與熱度模型
- 新失敗類型：`neutral-burned`（中性線燒毀）
- 相位平衡指示器 UI：顯示紅相/黑相總電流、中性線電流與狀態
- 手動模式：110V 迴路可切換 R↔T 相位
- 新增 L11（相位平衡入門，自動分配）和 L12（相位平衡進階，手動分配）

## Capabilities

### New Capabilities
- `phase-balancing`: 單相三線制相位平衡 — 中性線電流模型、相位分配、平衡指示器 UI

### Modified Capabilities
- `multi-circuit-data-model`: CircuitConfig 新增 phase 欄位、Level 新增 phaseMode、MultiCircuitState 新增中性線狀態
- `multi-circuit-simulation`: stepMulti() 加入中性線電流計算與熱度步進
- `scoring-and-levels`: 新增 L11、L12 關卡定義；新失敗類型 neutral-burned

## Impact

- `src/types/game.ts` — CircuitConfig、Level、MultiCircuitState 型別擴充
- `src/engine/simulation.ts` — stepMulti() 中性線模型、新失敗狀態
- `src/data/levels.ts` — 新增 L11、L12
- `src/data/constants.ts` — 中性線容量常數
- `src/components/GameBoard.tsx` — 相位狀態管理、手動切換、中性線失敗處理
- `src/components/StatusDisplay.tsx` — 相位平衡指示器
- `src/components/CircuitDiagram.tsx` — 相位標籤、手動切換按鈕
- `src/components/ResultPanel.tsx` — neutral-burned 失敗訊息
