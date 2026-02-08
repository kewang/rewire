## Why

v0.1-v0.2 的五個關卡（L01-L05）全部是單迴路設計，玩家只需選一條線撐住所有電器。多迴路型別系統、模擬引擎和 UI 已在 v0.3 FR-B 前三個 change 中完成，但目前沒有任何關卡實際使用多迴路——玩家完全無法體驗「分配電器到不同迴路」的核心策略。

## What Changes

- 新增 L06-L08 三個多迴路關卡，涵蓋 2-3 迴路場景
- L06：雙迴路入門——廚房 + 客廳，學習基本分迴路概念
- L07：三迴路預算壓力——需精打細算不同線徑搭配
- L08：三迴路高負載耐久——每條迴路都接近臨界，考驗電器分配策略
- 各關卡的 circuitConfigs 定義不同的 NFB 額定、可用電器、預算與存活時間
- LevelSelect 元件已支援動態關卡列表，無需修改 UI

## Capabilities

### New Capabilities
- `multi-circuit-levels`: 多迴路關卡定義（L06-L08），包含各關卡的迴路配置、電器分配規則、預算限制與過關條件

### Modified Capabilities
- `scoring-and-levels`: 擴展現有關卡定義，新增 L06-L08 的 Level 物件到 LEVELS 陣列

## Impact

- `src/data/levels.ts` — 新增 L06-L08 關卡定義（主要變更）
- `src/data/constants.ts` — 可能新增 30A NFB 常數（多迴路關卡用）
- 不影響型別系統、模擬引擎或 UI 元件（已在前三個 change 支援多迴路）
