## Why

v0.6 Change 1（panel-interior-view）和 Change 2（wire-routing-aesthetics）已建立整線系統的基礎設施（PanelInteriorView、aesthetics.ts、GameBoard routing flow），但尚無任何關卡啟用 `requiresRouting`。需要新增 L21–L23 關卡讓玩家體驗整線功能，同時擴充 BonusCondition 支援 `aesthetics-score` 類型以整合三星評分。

## What Changes

- 新增 BonusCondition `aesthetics-score` 類型（`{ type: 'aesthetics-score', minScore: number }`）
- 擴充 `calcStars` 的 `checkBonus` 函式支援 `aesthetics-score` 條件判定
- 擴充 `bonusLabel` 函式顯示整線分數條件描述文字
- 新增 L21「整線入門」（3 迴路 / auto 相位 / requiresRouting）
- 新增 L22「交叉迷宮」（5 迴路 / manual 相位 / 混合電壓 / requiresRouting）
- 新增 L23「完美配電箱」（6 迴路 / manual 相位 / ELCB + wetArea / random 漏電 / requiresRouting）— v0.6 畢業考

## Capabilities

### New Capabilities
- `routing-levels`: L21–L23 關卡定義，整線系統的實際遊戲內容

### Modified Capabilities
- `star-rating`: BonusCondition 新增 `aesthetics-score` 類型 + calcStars/bonusLabel 擴充

## Impact

- `src/types/game.ts` — BonusCondition union 新增 `aesthetics-score` member
- `src/engine/scoring.ts` — checkBonus + bonusLabel 新增 case
- `src/data/levels.ts` — 新增 L21–L23 定義
- `src/data/constants.ts` — 可能新增 import（電器/線材/NFB 規格均已存在，無需新常數）
