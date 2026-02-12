## 1. 修復未定義 CSS 變數引用

- [x] 1.1 將 `--color-status-danger` 改為 `--color-accent-red`（.random-card::before）
- [x] 1.2 將 `--color-status-safe` 改為 `--color-accent-green`（.random-card-completions）
- [x] 1.3 將 `--color-accent`（無後綴）改為 `--color-accent-amber`（.elcb-toggle, .circuit-tab.active）
- [x] 1.4 將 `--color-surface-card` 改為 `--color-bg-card`（.card.voltage-disabled:hover）
- [x] 1.5 將 `--accent` 改為 `--color-accent-copper`、`--radius` 改為 `--radius-md`（.routing-button）
- [x] 1.6 將 `--border` 改為 `--color-border`（.aesthetics-score-line）
- [x] 1.7 將 `--color-success` 改為 `--color-accent-green`（.fp-power-button）

## 2. 硬編碼顏色改用 CSS 變數

- [x] 2.1 將 `.star-achieved` 的 `#22c55e` 改為 `var(--color-accent-green)`
- [x] 2.2 將 `.aesthetics-score-value.score-*` 三色改為對應 CSS 變數
- [x] 2.3 將 `.panel-score-value.score-perfect/bad` 改為對應 CSS 變數

## 3. 新增鍵盤焦點與按壓狀態

- [x] 3.1 為 `.level-card` 新增 `:focus-visible` 與 `:active` 狀態
- [x] 3.2 為 `.random-card` 新增 `:focus-visible` 與 `:active` 狀態
- [x] 3.3 為 `.retry-button` 新增 `:focus-visible` 與 `:active` 狀態
- [x] 3.4 為 `.back-button` 新增 `:focus-visible` 與 `:active` 狀態
- [x] 3.5 為 `.confirm-planning-btn` 新增 `:focus-visible` 狀態
- [x] 3.6 為 `.sidebar-confirm-btn` 新增 `:focus-visible` 狀態
- [x] 3.7 為 `.wire-toolbar__power` 新增 `:focus-visible` 狀態
- [x] 3.8 為 `.fp-power-button` 新增 `:focus-visible` 狀態

## 4. 驗證

- [x] 4.1 執行 `npm run lint` 確認零錯誤
- [x] 4.2 執行 `npm run build` 確認建置成功
