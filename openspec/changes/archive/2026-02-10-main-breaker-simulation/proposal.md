## Why

自由配迴路模式中，玩家可自由規劃迴路數量與電器配置。若無全域限制，玩家可無限開迴路把所有電器各自獨立——缺乏配電設計的「總容量預算」約束。主開關跳脫機制（FR-C）為配電箱增加全域電流上限，讓「迴路規劃」本身成為有意義的取捨決策。

## What Changes

- `stepMulti` 新增 `mainBreakerRating` 參數，計算所有非跳脫迴路的 totalPanelCurrent
- 當 totalPanelCurrent 超過 mainBreakerRating × 1.25 持續 1.5 秒，觸發 `'main-tripped'`（severity=3，遊戲失敗）
- `MultiCircuitState.mainBreakerTripTimer` 已在前面 change 定義，本 change 實作計算邏輯
- StatusDisplay 新增主開關負載指示器（「主開關：42A / 50A」），≥80% 橘色、≥100% 紅色
- GameBoard rAF loop 傳遞 mainBreakerRating 給 stepMulti
- ResultPanel 支援 main-tripped 結果顯示

## Capabilities

### New Capabilities
- `main-breaker`: 主開關跳脫模擬邏輯（tripTimer 累積 + totalPanelCurrent 計算 + 跳脫判定）

### Modified Capabilities
- `multi-circuit-simulation`: stepMulti 新增 mainBreakerRating 參數與主開關跳脫計算
- `game-ui`: StatusDisplay 新增主開關負載指示器、ResultPanel 支援 main-tripped

## Impact

- `src/engine/simulation.ts` — stepMulti 函式簽名擴充 + 主開關邏輯
- `src/components/StatusDisplay.tsx` — 主開關負載 UI
- `src/components/ResultPanel.tsx` — main-tripped 結果文案
- `src/components/GameBoard.tsx` — rAF loop 傳遞 mainBreakerRating
- `src/types/game.ts` — 型別已定義（mainBreakerTripTimer, main-tripped），無需額外修改
- `src/App.css` — 主開關指示器樣式
