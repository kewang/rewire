## 1. Loading Screen HTML/CSS

- [x] 1.1 在 `index.html` 的 `<div id="root">` 內新增 loading screen HTML 結構（標題 + 動畫容器）
- [x] 1.2 在 `index.html` 的 `<head>` 內新增 `<style>` 內聯 CSS（深色主題背景 #0a0c0f、Orbitron fallback 字型、電路風格 @keyframes 動畫、fade-in 0.3s delay）
- [x] 1.3 確認 loading screen 內聯 HTML + CSS 總量 < 5 KB（實際 3,587 bytes）

## 2. 驗證與測試

- [x] 2.1 執行 `npm run build` 確認建置通過
- [x] 2.2 執行 `npm run lint` 確認無 error/warning
- [x] 2.3 驗證 React mount 後 loading 內容自動被替換（無殘留 DOM）
