## 1. 隨機生成引擎

- [x] 1.1 建立 `src/engine/randomOldHouse.ts`，定義 generateRandomOldHouse(difficulty) 函式簽名
- [x] 1.2 實作迴路數量/電壓分配隨機邏輯
- [x] 1.3 實作電器隨機分配（依電壓匹配）
- [x] 1.4 實作線材/NFB 分配（正常 + 故意錯誤作為問題）
- [x] 1.5 實作問題隨機分配（依難度控制可用問題類型和數量）
- [x] 1.6 實作預算計算（修復成本 × 1.3）
- [x] 1.7 實作可解性驗證
- [x] 1.8 實作 loadRandomCompletions() / saveRandomCompletion() localStorage helpers

## 2. 型別擴充

- [x] 2.1 在 game.ts FixedCircuitLevel 新增 `randomDifficulty?: 1 | 2 | 3`

## 3. LevelSelect UI

- [x] 3.1 新增隨機老屋挑戰區塊（標題 + 3 難度卡片）
- [x] 3.2 每張卡片顯示難度名稱 + 說明 + 歷史通關次數
- [x] 3.3 點擊卡片呼叫 generateRandomOldHouse 並 onSelectLevel
- [x] 3.4 新增卡片 CSS 樣式（amber 主題 + hover 效果）

## 4. GameBoard 整合

- [x] 4.1 通關時偵測 randomDifficulty，呼叫 saveRandomCompletion()

## 5. 驗證

- [x] 5.1 TypeScript 編譯通過
- [x] 5.2 三個難度可正常生成並遊玩
- [x] 5.3 通關次數正確記錄
