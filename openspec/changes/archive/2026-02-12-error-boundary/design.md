## Context

React 的 Error Boundary 機制僅能用 class component 實作（componentDidCatch / getDerivedStateFromError）。目前 App.tsx 直接渲染 GameBoard，無任何錯誤攔截。GameBoard 包含大量狀態邏輯（1953 行），是最可能發生渲染錯誤的區域。

## Goals / Non-Goals

**Goals:**
- 任何 render-time error 不再白屏
- GameBoard 錯誤可恢復（回到關卡選擇）
- 錯誤訊息支援六語 i18n
- 開發者可從 console 看到完整 error stack

**Non-Goals:**
- 不攔截 event handler 中的錯誤（React Error Boundary 設計限制）
- 不做錯誤回報服務（如 Sentry）
- 不做自動重試/恢復

## Decisions

### 1. 兩層 Error Boundary 架構

**選擇**：App 層一個（全域 fallback）+ GameBoard 層一個（遊戲 fallback）。

**理由**：
- GameBoard 層：遊戲邏輯錯誤時，顯示「回到關卡選擇」按鈕，使用者可重新選關繼續玩
- App 層：極端情況（LevelSelect 本身錯誤）的最後防線，顯示「重新整理」按鈕

**替代方案**：單一頂層 → 無法區分遊戲錯誤 vs 全域錯誤，恢復手段較粗糙

### 2. 共用 ErrorBoundary 元件 + props 控制 fallback

**選擇**：一個通用 `ErrorBoundary` class component，透過 `fallback` render prop 或 `onReset` callback 自訂行為。

**理由**：避免重複程式碼，兩層 boundary 共用同一元件，僅 fallback UI 不同。

### 3. fallback UI 使用遊戲主題樣式

**選擇**：fallback 使用與遊戲一致的深色主題 + Orbitron 標題 + CSS variables。

**理由**：保持視覺一致性，錯誤頁面不應跳出遊戲氛圍。

## Risks / Trade-offs

- **[Risk] Error Boundary 不攔截 async 錯誤** → 已知 React 限制，event handler 錯誤不會被攔截。Mitigation: 這些錯誤通常不會導致白屏（僅 console error）。
- **[Risk] i18n 初始化失敗時 fallback 無翻譯** → Mitigation: fallback 文字設 hardcode 英文預設值，i18n 僅為增強。
