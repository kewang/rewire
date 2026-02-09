## Why

目前所有關卡只有「通關 / 失敗」二元結果，缺乏重玩動機與成就感。加入三星評分系統讓玩家追求更高評等（成本達標、獎勵目標），提升遊戲深度與黏著度。PRD v0.5 第二個 change，為後續老屋關卡（L18-L20）提供 bonusCondition 基礎。

## What Changes

- 新增三星評分邏輯：1 星=安全通關、2 星=成本達標(≤budget)、3 星=達成獎勵目標(bonusCondition)
- 新增 5 種 bonusCondition 類型：`no-warning`、`under-budget-ratio`、`time-margin`、`crimp-quality`、`no-trip`
- Level 型別新增可選 `bonusCondition` 欄位，L01-L17 各自配置對應的 bonusCondition
- ResultPanel 通關時顯示 1-3 星視覺（星星圖示 + 各星條件文字）
- LevelSelect 關卡卡片顯示歷史最佳星等（亮/暗星圖示）
- localStorage 儲存每關歷史最佳星等（key: `rewire-stars`）

## Capabilities

### New Capabilities
- `star-rating`: 三星評分計算邏輯、bonusCondition 判定、localStorage 存取、UI 呈現（ResultPanel 星星 + LevelSelect 歷史星等）

### Modified Capabilities
- `scoring-and-levels`: Level 型別新增 bonusCondition 欄位，L01-L17 各關配置 bonusCondition

## Impact

- `src/types/game.ts` — 新增 BonusCondition 型別、Level 新增 bonusCondition 欄位
- `src/data/levels.ts` — L01-L17 各關新增 bonusCondition 設定
- `src/components/ResultPanel.tsx` — 通關時顯示星等
- `src/components/LevelSelect.tsx` — 顯示歷史最佳星等
- `src/components/GameBoard.tsx` — 計算星等並傳遞給 ResultPanel、儲存至 localStorage
- `src/App.css` — 星星相關樣式
