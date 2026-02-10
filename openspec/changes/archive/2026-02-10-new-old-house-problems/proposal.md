## Why

v0.5 老屋驚魂模式僅有 3 種問題類型（bare-wire、wrong-wire-gauge、oxidized-splice），全部需要拆線重接。v0.8 需擴充至 5 種問題，新增不需拆線的修復方式（更換 NFB、安裝 ELCB），增加遊戲多樣性與教育價值，並新增 L24–L25 關卡。

## What Changes

- 擴充 `OldHouseProblemType` 新增 `overrated-breaker`（NFB 規格過大）與 `missing-elcb`（潮濕區缺漏電保護）
- 新增 NFB 更換機制：GameBoard `circuitBreakers` state + `BreakerSelector` UI 元件，讓玩家在老屋 overrated-breaker 迴路更換 NFB 規格
- 擴充問題解決邏輯：overrated-breaker 透過更換正確 NFB 解決（不需拆線）；missing-elcb 透過安裝 ELCB 解決（不需拆線）
- CircuitDiagram 新增 overrated-breaker 視覺（NFB ⚠️ + 紅色邊框）與 missing-elcb 視覺（💧⚠️）
- 新增 L24（保護力缺失：首次體驗 overrated-breaker）與 L25（潮濕陷阱：首次體驗 missing-elcb + 隨機漏電）

## Capabilities

### New Capabilities
- `breaker-selector`: NFB 規格選擇器 UI 元件，供老屋 overrated-breaker 迴路更換 NFB（15A/20A/30A 選項卡片、相容性標示、更換動畫）
- `new-old-house-problem-types`: overrated-breaker 與 missing-elcb 問題類型定義、效果、解決邏輯、視覺標示

### Modified Capabilities
- `old-house-mode`: 擴充 OldHouseProblemType union、新增 circuitBreakers state、擴充問題解決判定（NFB 更換 / ELCB 安裝路徑）、擴充老屋初始化（overrated-breaker 迴路設定過大 NFB）
- `old-house-levels`: 新增 L24–L25 關卡定義（含 overrated-breaker / missing-elcb 問題 + 預接線狀態）

## Impact

- `src/types/game.ts` — OldHouseProblemType 擴充、PreWiredCircuit 可能擴充 breaker 欄位
- `src/data/constants.ts` — 若需新增常數
- `src/components/GameBoard.tsx` — circuitBreakers state、問題解決邏輯擴充、老屋初始化擴充
- `src/components/CircuitDiagram.tsx` — overrated-breaker / missing-elcb 視覺標示、NFB 點擊觸發 BreakerSelector
- `src/components/BreakerSelector.tsx` — 新增 NFB 選擇器元件
- `src/data/levels.ts` — L24、L25 關卡定義
- `src/App.css` — BreakerSelector 樣式、新問題類型視覺樣式
