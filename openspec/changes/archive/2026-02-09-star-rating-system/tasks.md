## 1. 型別定義

- [x] 1.1 在 `src/types/game.ts` 新增 `BonusCondition` discriminated union 型別（5 種類型）
- [x] 1.2 在 `src/types/game.ts` 的 `Level` 型別新增可選欄位 `bonusCondition?: BonusCondition`

## 2. 星等計算引擎

- [x] 2.1 新增 `src/engine/scoring.ts`，實作 `calcStars` 純函式，輸入遊戲結果context，輸出 `{ stars: number, details: StarDetail[] }`
- [x] 2.2 實作 5 種 bonusCondition 判定邏輯（no-warning / under-budget-ratio / time-margin / crimp-quality / no-trip）
- [x] 2.3 實作 localStorage 存取函式（`loadBestStars` / `saveBestStars`），key=`rewire-stars`

## 3. 關卡資料更新

- [x] 3.1 在 `src/data/levels.ts` 為 L01-L17 每關配置 `bonusCondition`（L01-L05: no-warning, L06-L10: under-budget-ratio 0.8, L11-L12: time-margin 3, L13-L15: no-trip, L16-L17: crimp-quality good）

## 4. GameBoard 整合

- [x] 4.1 在 GameBoard 新增 `hasWarningRef` 和 `hasTripRef` useRef，rAF loop 中偵測 warning/trip 事件設 flag
- [x] 4.2 在 GameBoard 結果判定流程中呼叫 `calcStars`，將星等傳給 ResultPanel
- [x] 4.3 通關時呼叫 `saveBestStars` 更新 localStorage

## 5. UI 呈現

- [x] 5.1 修改 ResultPanel：通關時顯示 3 顆星圖示（亮/暗）+ 每星條件文字（達成/未達成標示）
- [x] 5.2 修改 LevelSelect：關卡卡片顯示歷史最佳星等（3 顆小星，讀取 localStorage）
- [x] 5.3 在 `src/App.css` 新增星等相關樣式（星星圖示、亮暗狀態、條件文字）
