## Why

模擬引擎和 UI 元件都需要共用一致的資料結構來描述線材、電器、NFB、迴路和遊戲狀態。在開始實作任何遊戲邏輯之前，需要先定義這些 TypeScript 型別，作為各模組之間的共同語言。

## What Changes

- 定義線材（Wire）型別：線徑、安全電流上限、成本
- 定義電器（Appliance）型別：名稱、功率、電壓、電流
- 定義 NFB 斷路器型別：額定電流、跳脫延遲
- 定義迴路（Circuit）型別：NFB + 線材 + 插座 + 電器的組合
- 定義模擬狀態（SimulationState）型別：Normal / Warning / Tripped / Burned
- 定義關卡（Level）型別：目標電器、預算、過關條件
- 提供 PRD 數據表的預設常數資料

## Capabilities

### New Capabilities
- `game-data-model`: 遊戲核心資料型別定義與預設常數

### Modified Capabilities

## Impact

- 新增 `src/types/game.ts`：所有遊戲相關型別定義
- 新增 `src/data/constants.ts`：PRD 數據表對應的預設常數
