## Why

v0.1 只有 3 種線材（1.6/2.0/5.5mm²）和 3 種 110V 電器，策略空間有限。缺少台灣常用的 3.5mm² 和 8mm² 線材，也沒有 220V 電器。關卡只有 3 關，玩家很快就能全破。需要擴充材料與關卡來增加遊戲深度。

## What Changes

- 新增 2 種線材：3.5mm²（25A, $8/米）和 8mm²（45A, $18/米）
- 新增 2 種電器：廚下加熱器（800W/110V）和烘衣機（2200W/220V）
- 新增 3 個關卡：L04 低功率陷阱、L05 220V 專用迴路、L06 混合電壓挑戰
- 模擬引擎的電流計算已支援不同電壓（I=P/V），無需修改

## Capabilities

### New Capabilities

（無新增獨立能力，皆為既有能力的擴充）

### Modified Capabilities

- `game-data-model`: 預設線材常數從 3 種擴充為 5 種，預設電器常數從 3 種擴充為 5 種（含首款 220V 電器）
- `scoring-and-levels`: 關卡從 3 關擴充為 6 關（L04-L06 使用新材料）

## Impact

- `src/data/constants.ts` — 新增線材與電器常數
- `src/data/levels.ts` — 新增 L04-L06 關卡定義
- 模擬引擎（`src/engine/simulation.ts`）不需修改，已正確使用 `power / voltage` 計算電流
- UI 元件自動從常數讀取，無需修改（WireSelector、AppliancePanel、LevelSelect）
