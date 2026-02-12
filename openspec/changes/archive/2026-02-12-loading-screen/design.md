## Context

遊戲目前的 JS bundle 為 518 KB（gzip 150 KB），在低速網路環境下載入需數秒。期間 `index.html` 的 `<div id="root"></div>` 為空白，使用者看到白屏直到 React mount 完成。需要一個純 HTML/CSS 的 loading 畫面作為首屏視覺。

現有技術棧：React 19 + Vite 7，`index.html` 為 Vite 入口，`<div id="root">` 由 `src/main.tsx` 的 `createRoot` 掛載。

## Goals / Non-Goals

**Goals:**
- 白屏→品牌 loading 畫面，立即呈現
- loading 內容 < 5 KB（內聯 HTML + CSS）
- React mount 後平滑 fade-out 過渡
- 視覺風格與遊戲深色主題一致

**Non-Goals:**
- 不做載入進度百分比（無法準確追蹤 JS parse 進度）
- 不做骨架屏（元件結構複雜，骨架屏反而誤導）
- 不引入任何額外依賴

## Decisions

### 1. 內聯於 index.html 的 `<div id="root">` 內部

**選擇**：將 loading HTML 放在 `<div id="root">` 內部。

**理由**：React `createRoot(root).render(...)` 會自動替換 `#root` 的子內容，不需要手動移除 loading 元素。

**替代方案**：
- `#root` 外部獨立 div + JS 手動移除 → 需額外 cleanup 程式碼，React 不會自動處理
- React Suspense fallback → 需要 JS bundle 載入後才顯示，無法解決白屏

### 2. CSS-only 動畫（無 JS）

**選擇**：loading 動畫純 CSS `@keyframes`，不依賴 JavaScript。

**理由**：loading 畫面必須在 JS bundle 載入前就能動，CSS 動畫由瀏覽器原生引擎驅動，FCP 最快。

### 3. 電路風格動畫

**選擇**：以脈動的電路線條 + 閃爍節點作為 loading 動畫，呼應遊戲主題。

**理由**：比通用 spinner 更有品牌辨識度，與遊戲「配電盤」主題一致。

### 4. 不加最小顯示時間

**選擇**：不加 minimum display time，React mount 即替換。

**理由**：載入快時自然看不到 loading（良好體驗），載入慢時看到 loading（解決白屏）。刻意延遲反而傷害已快取使用者的體驗。

## Risks / Trade-offs

- **[Risk] loading 閃爍** → 快速載入時 loading 一閃而過。Mitigation: CSS fade-in 設 0.3s delay，< 0.3s 載入完根本看不到 loading。
- **[Risk] 內聯 CSS 增加 HTML 大小** → < 5 KB 影響可忽略，且有效利用首包 14 KB 窗口。
- **[Risk] 深色背景色不匹配** → 使用與 `:root` 完全相同的 `#0a0c0f`，確保無色差閃爍。
