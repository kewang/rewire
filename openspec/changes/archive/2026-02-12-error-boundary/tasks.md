## 1. ErrorBoundary 元件

- [x] 1.1 建立 `src/components/ErrorBoundary.tsx` — class component（getDerivedStateFromError + componentDidCatch），接受 `fallback` render prop 和 `onReset` callback
- [x] 1.2 實作 GameBoard 層 fallback UI（錯誤訊息 + ⚠️ 圖示 + 「回到關卡選擇」按鈕），使用遊戲深色主題樣式
- [x] 1.3 實作 App 層 fallback UI（錯誤訊息 + 「重新整理」按鈕），hardcode 英文預設值

## 2. 整合與 i18n

- [x] 2.1 修改 `src/App.tsx` — GameBoard 外包 ErrorBoundary（遊戲層），App 外包 ErrorBoundary（全域層）
- [x] 2.2 六語翻譯檔新增 error boundary 相關 key（error.title / error.message / error.backToLevels / error.reload）
- [x] 2.3 ErrorBoundary fallback 使用 `useTranslation` hook（透過 fallback render prop 注入）

## 3. 樣式與驗證

- [x] 3.1 在 `src/App.css` 新增 error fallback 樣式（深色主題、置中佈局、按鈕 hover/focus-visible）
- [x] 3.2 執行 `npm run build` 確認建置通過
- [x] 3.3 執行 `npm run lint` 確認無 error/warning
