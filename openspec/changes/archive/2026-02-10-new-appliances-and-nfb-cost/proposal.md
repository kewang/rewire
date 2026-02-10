## Why

v0.6 所有 110V 電器電流 ≤ 13.6A，單一電器永遠不需要超過 1.6mm²（15A），導致線材選擇毫無挑戰。同時 L05 存在烘衣機(220V)放在 110V 迴路的 bug，以及 v0.7 自由配迴路需要 NFB 收費機制來建立迴路數量 vs 線材粗細的經濟取捨。

## What Changes

- **新增 3 種電器**：電暖器(1800W/110V/16.4A)、烤箱(1500W/110V/13.6A)、除濕機(600W/110V/5.5A)，附加到 `DEFAULT_APPLIANCES` 陣列末尾
- **新增 NFB 成本常數**：`NFB_COST_15A = 10`、`NFB_COST_20A = 15`、`NFB_COST_30A = 20`，僅自由配迴路關卡計入成本
- **修復 L05 bug**：將烘衣機(220V) 替換為電暖器(1800W/110V) + 快煮壺(1500W/110V)，總電流 30A，描述更新為正確內容
- **L05 預算/NFB 調整**：因電器改變，重新調整預算與 NFB 規格（改用 BREAKER_30A，預算 $130）

## Capabilities

### New Capabilities
- `nfb-cost`: NFB 每規格單價常數定義（$10/$15/$20），為自由配迴路成本計算提供基礎

### Modified Capabilities
- `game-data-model`: 新增 3 種電器到 Appliance 資料，DEFAULT_APPLIANCES 擴充為 13 種
- `scoring-and-levels`: 修復 L05 電器組合 bug + 調整預算/NFB 規格

## Impact

- `src/data/constants.ts` — 新增 3 電器 + 3 NFB 成本常數
- `src/data/levels.ts` — L05 電器/描述/預算/NFB 修改
- `src/types/game.ts` — 無變更（Appliance 型別已足夠）
- 下游影響：後續 change（free-circuit-data-model）將使用 NFB 成本常數進行成本計算
