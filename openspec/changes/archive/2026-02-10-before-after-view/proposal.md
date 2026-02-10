## Why

老屋驚魂模式玩家修復完成後，缺乏「修復前 vs 修復後」的視覺對比回饋。玩家看不到自己做了什麼改善，削弱了成就感與教育效果。新增 Before/After 對比視圖，讓玩家在通關時清楚看到每個問題的修復方式與結果，強化「診斷→修復→驗證」的學習閉環。

## What Changes

- 新增 **Before 快照機制**：進入老屋關卡時自動擷取初始狀態（問題清單、各迴路線材/壓接/NFB/ELCB）
- 新增 **BeforeAfterView 元件**：在 ResultPanel 下方顯示修復前後對比，僅老屋關卡且通關時觸發
- Before/After **並排佈局**（桌面左右、手機上下堆疊）
- **修復摘要文字**：列出每個問題的修復方式（如「✓ c1 廚房：更換 NFB 30A → 20A」）
- Before 側紅色高亮問題 + 問題圖示；After 側全綠 ✓ + 修復後狀態
- 過渡動畫：Before → After 漸變、問題圖示消失、✓ 出現

## Capabilities

### New Capabilities

- `before-after-snapshot`: Before 快照的資料擷取與儲存機制（進入老屋關卡時自動快照、快照資料結構定義）
- `before-after-view`: BeforeAfterView 元件的視覺呈現（並排佈局、修復摘要文字、問題高亮、動畫效果、響應式設計）

### Modified Capabilities

- `old-house-mode`: ResultPanel 整合——老屋關卡通關時在結果面板下方顯示 BeforeAfterView

## Impact

- **新增元件**：`src/components/BeforeAfterView.tsx`
- **修改元件**：`GameBoard.tsx`（新增 snapshot state + 傳遞給 ResultPanel）、`ResultPanel.tsx`（新增 BeforeAfterView 插槽）
- **新增型別**：`OldHouseSnapshot` 介面（game.ts 或 BeforeAfterView 內部）
- **CSS**：新增 BeforeAfterView 相關樣式（並排/堆疊佈局 + 動畫）
- **無 breaking changes**：非老屋關卡完全不受影響
