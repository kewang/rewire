## 1. 關卡資料

- [x] 1.1 建立 `src/data/levels.ts`，定義 L01/L02/L03 三個關卡（requiredAppliances, budget, survivalTime）

## 2. 關卡選擇 UI

- [x] 2.1 建立 `src/components/LevelSelect.tsx`：顯示關卡列表卡片，點選進入關卡

## 3. GameBoard 整合關卡與結算

- [x] 3.1 修改 GameBoard：加入 currentLevel 狀態，初始顯示 LevelSelect
- [x] 3.2 加入成本計算與預算顯示（StatusDisplay 加入 cost/budget）
- [x] 3.3 實作過關判定：elapsed >= survivalTime 且狀態正常時判定過關
- [x] 3.4 實作超預算判定：過關但成本 > 預算時判定失敗

## 4. 結果面板擴充

- [x] 4.1 修改 ResultPanel：加入過關成功面板（花費、預算差額）
- [x] 4.2 修改 ResultPanel：加入超預算失敗面板
- [x] 4.3 加入「返回關卡選擇」按鈕

## 5. 驗證

- [x] 5.1 執行 `npm run build` 確認編譯無錯誤
