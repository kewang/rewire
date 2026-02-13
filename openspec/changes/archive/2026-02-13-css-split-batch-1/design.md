## Context

App.css 4,589 行單一檔案，本批次抽取 3 個最小元件的樣式作為 CSS 拆分起手式。

## Goals / Non-Goals

**Goals:**
- 將 LevelSelect、LanguageSwitcher、ErrorFallback 樣式搬入獨立 CSS 檔
- 各元件 import 自己的 CSS
- App.css 對應區段移除

**Non-Goals:**
- 不引入 CSS Modules（class name 不變）
- 不修改任何樣式規則內容
- 不處理其他元件

## Decisions

1. **檔案位置**：CSS 與 `.tsx` 同目錄（`src/components/`），方便 co-locate
2. **import 方式**：`import './XxxComponent.css'` side-effect import
3. **切割策略**：以 App.css 中的 section comment 為邊界，整段搬移
4. **Random Old House 區段**：歸入 LevelSelect.css（該區段在 LevelSelect 元件內使用）

## Risks / Trade-offs

- [風險] 遺漏搬移某些 selector → 用 build + lint 驗證，視覺回歸靠開發伺服器
- [風險] 區段邊界不清 → 以 `/* ── */` comment 為依據，精確切割
