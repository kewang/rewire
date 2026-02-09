## Why

目前接線只看「線徑」一個維度，但實務中「接線品質」（壓接端子）同樣關鍵。未壓端子或壓接不良導致接觸電阻升高、加速過熱，是真實電氣火災的常見成因。v0.5 引入壓接端子系統，為後續老屋驚魂模式提供基礎機制。

## What Changes

- 新增 2 種端子類型（O 型環、Y 型叉），各有線徑相容規則
- 新增壓接品質模型（excellent/good/poor/none），品質影響接觸電阻倍率 → effectiveCurrent
- 新增壓接小遊戲 overlay（進度條甜蜜區判定品質）
- 修改 simulation engine：step() 用 effectiveCurrent 計算 wireHeat（NFB 跳脫仍看實際電流）
- 修改遊戲流程：拖曳接線後觸發壓接小遊戲 → 送電前檢查壓接完成
- 新增 Level.requiresCrimp 欄位控制是否要求壓接
- 新增 L16（壓接入門）、L17（端子品質大考驗）兩關
- 電路圖 SVG 端子圖示 + 品質色碼
- L01-L15 完全不受影響（requiresCrimp 預設 false）

## Capabilities

### New Capabilities
- `crimp-terminal`: 壓接端子型別、品質模型、相容性規則、壓接小遊戲 UI、電路圖端子視覺
- `crimp-levels`: L16-L17 壓接端子關卡定義

### Modified Capabilities
- `simulation-engine`: step() 函式新增 contactResistance 參數，用 effectiveCurrent 計算 wireHeat
- `game-data-model`: Circuit 型別新增 contactResistance 可選欄位；Level 型別新增 requiresCrimp 可選欄位
- `drag-drop-wiring`: 拖曳接線完成後觸發壓接小遊戲；送電前檢查壓接完成
- `scoring-and-levels`: 新增 L16-L17 關卡定義；成本計算不含端子成本（免費）

## Impact

- `src/types/game.ts` — 新增 CrimpTerminal、CrimpQuality 型別；Circuit 加 contactResistance；Level 加 requiresCrimp
- `src/data/constants.ts` — 新增端子常數、壓接品質倍率常數
- `src/data/levels.ts` — 新增 L16、L17
- `src/engine/simulation.ts` — step() 用 effectiveCurrent 計算 wireHeat
- `src/components/GameBoard.tsx` — circuitCrimps 狀態管理、壓接小遊戲觸發邏輯、送電前檢查
- `src/components/CircuitDiagram.tsx` — 端子圖示 SVG + 品質色碼
- `src/components/CrimpMiniGame.tsx` — 新元件：壓接小遊戲 overlay
- `src/App.css` — 壓接小遊戲樣式
