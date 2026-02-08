## Why

v0.2 只有單一迴路（1 個 NFB + 1 條線 + 1 組電器），策略空間有限。要實現 FR-B 多迴路 / 多 NFB 玩法，首先需要重構型別系統，讓資料模型能描述多迴路配電盤。這是多迴路功能的基礎，後續的引擎、UI、關卡都依賴此型別重構。

## What Changes

- **BREAKING**: `Circuit` 型別從單一迴路改為帶 `id` 和 `label` 的識別迴路
- **BREAKING**: `SimulationState` 從單一迴路狀態改為包含多迴路各自獨立狀態的 `MultiCircuitState`
- 新增 `CircuitState` 型別：每個迴路獨立的 wireHeat / breakerTripTimer / status
- 新增 `CircuitId` 型別：迴路識別用的 branded string
- **BREAKING**: `Level` 型別新增 `circuits` 陣列定義（描述迴路數量與 NFB 配置），`requiredAppliances` 改為按迴路分配
- **BREAKING**: `WiringState` 擴展為多迴路接線追蹤（每個迴路各自的 isWired / connectedWire）
- 現有 L01-L05 關卡以單迴路相容模式保留（1 個迴路 = 退化的多迴路）

## Capabilities

### New Capabilities
- `multi-circuit-data-model`: 多迴路資料模型型別定義，包含 CircuitId、Circuit（帶 id/label）、CircuitState（每迴路獨立狀態）、MultiCircuitState（整體模擬狀態）、多迴路 Level 定義、多迴路 WiringState

### Modified Capabilities
- `game-data-model`: Circuit 增加 id/label 欄位，Level 增加 circuits 定義，WiringState 擴展為多迴路
- `simulation-engine`: SimulationState 改為 MultiCircuitState，step 函式簽名需對應調整（此 change 只改型別，引擎實作在 multi-circuit-engine change）

## Impact

- `src/types/game.ts` — 核心型別重構
- `src/data/constants.ts` — DEFAULT_BREAKER 可能需擴展
- `src/data/levels.ts` — Level 定義適配新型別
- `src/engine/simulation.ts` — 型別 import 變更（函式實作留給 multi-circuit-engine）
- `src/components/GameBoard.tsx` — SimulationState 引用變更
- `src/components/*.tsx` — 所有引用 Circuit / SimulationState 的元件需適配
