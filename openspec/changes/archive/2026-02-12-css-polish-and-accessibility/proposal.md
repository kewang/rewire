## Why

CSS 中有 8 個未定義的 CSS 變數被引用（如 `--color-status-danger`、`--color-accent`、`--color-success` 等），導致相關元素的顏色 fallback 失效。此外，多個關鍵互動元素缺少 `focus-visible` 鍵盤焦點狀態，影響無障礙使用。部分顏色仍為硬編碼 hex 值，不隨主題變數變化。

## What Changes

- 修復 8 個未定義 CSS 變數引用（13 處），對應到正確的已定義變數
- 為 8 個關鍵互動元素新增 `:focus-visible` 鍵盤焦點輪廓
- 為 `.level-card`、`.random-card`、`.retry-button`、`.back-button` 新增 `:active` 按壓回彈效果
- 將 `.star-achieved`、`.aesthetics-score-value`、`.panel-score-value` 等硬編碼顏色改用 CSS 變數

## Capabilities

### New Capabilities

- `css-variable-fixes`: 修復所有未定義 CSS 變數引用，確保主題系統一致性
- `keyboard-focus-states`: 為關鍵互動元素新增 focus-visible 與 active 狀態

### Modified Capabilities

## Impact

- `src/App.css` — 所有修改集中在此單一檔案，約 30 處變更
- 無 API 或依賴變更
- 無 breaking change
