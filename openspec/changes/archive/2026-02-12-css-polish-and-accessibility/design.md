## Context

`src/App.css` 中累積了多個 CSS 變數引用錯誤（來自早期版本的變數命名重構未完全清理），以及關鍵互動按鈕缺少鍵盤焦點狀態。這些問題影響主題一致性與無障礙使用。

## Goals / Non-Goals

**Goals:**
- 修復所有未定義 CSS 變數引用，確保每個 `var(--*)` 都能解析到已定義的值
- 為所有主要按鈕與卡片元素新增 `:focus-visible` 鍵盤焦點輪廓
- 將剩餘硬編碼 hex 顏色統一改用 CSS 變數

**Non-Goals:**
- 不重新設計任何元件的視覺外觀
- 不新增或修改 CSS 變數定義（僅修正引用端）
- 不觸碰 TypeScript 元件邏輯

## Decisions

### 1. 變數對應策略
直接將舊變數名對應到 `src/index.css` 中已定義的等價變數：
- `--color-status-danger` → `--color-accent-red`
- `--color-status-safe` → `--color-accent-green`
- `--color-accent`（無後綴）→ `--color-accent-amber`
- `--accent` → `--color-accent-copper`
- `--border` → `--color-border`
- `--radius` → `--radius-md`
- `--color-surface-card` → `--color-bg-card`
- `--color-success` → `--color-accent-green`

### 2. focus-visible 樣式
統一使用 `outline: 2px solid` + 對應的 accent 色：
- 綠色按鈕 → `--color-accent-green` outline
- 一般卡片/按鈕 → `--color-accent-amber` outline
- `outline-offset: 2px` 確保與元素邊框有間距

### 3. 修改範圍
所有修改限縮在 `src/App.css` 單一檔案，不觸碰 `index.css` 變數定義或任何元件程式碼。

## Risks / Trade-offs

- [低風險] 部分舊變數可能在某些瀏覽器下有不同 fallback 行為 → 修復後行為統一
- [無風險] focus-visible 為漸進增強，不影響既有滑鼠使用者體驗
