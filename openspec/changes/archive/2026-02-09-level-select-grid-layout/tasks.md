## 1. CSS Grid 佈局改造

- [x] 1.1 將 `.level-list` 從 `flex-direction: column` 改為 `display: grid` + `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`
- [x] 1.2 將 `.level-select` 的 `max-width` 從 `640px` 放寬至 `1200px`
- [x] 1.3 調整 `.level-card` 樣式：確保卡片在較窄寬度下內容不溢出，電器名稱列以 ellipsis 截斷

## 2. 響應式適配

- [x] 2.1 更新 mobile breakpoint（≤640px）：確保 grid 在小螢幕為 1 欄全寬，移除或調整相關 `.level-select` 的 responsive 樣式

## 3. 驗證

- [x] 3.1 使用 `/frontend-design` 確認視覺效果，確保桌面 3-4 欄、平板 2 欄、手機 1 欄正確顯示
