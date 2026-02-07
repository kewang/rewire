## 1. StatusDisplay 倒數顯示

- [x] 1.1 修改 `src/components/StatusDisplay.tsx`：新增 `survivalTime` prop，將「通電時間」改為「剩餘時間」倒數顯示（`Math.max(0, survivalTime - elapsed).toFixed(1)`）

## 2. GameBoard 傳遞 prop

- [x] 2.1 修改 `src/components/GameBoard.tsx`：傳遞 `currentLevel.survivalTime` 給 StatusDisplay

## 3. 驗證

- [x] 3.1 執行 `npm run build` 確認編譯無錯誤
