## Why

首次載入遊戲時，JS bundle（518 KB）下載與解析期間畫面為白屏，在低速網路或手機上體驗不佳。需要一個不依賴 JS bundle 的內聯 loading 畫面，立即顯示品牌視覺與載入動畫，改善首印象。

## What Changes

- 在 `index.html` 中新增內聯 HTML + CSS 的 loading 畫面（不依賴 JS bundle）
- 顯示遊戲標題「Rewire」+ 電路風格 loading 動畫
- 配色與遊戲深色主題一致（#0a0c0f 背景）
- React mount 後 loading 畫面 fade-out 消失
- loading HTML/CSS < 5 KB，不影響 FCP

## Capabilities

### New Capabilities
- `loading-screen`: 首次載入時的品牌 loading 畫面，內聯於 index.html，React hydrate 後自動消失

### Modified Capabilities
（無既有 spec 需修改）

## Impact

- `index.html` — 新增內聯 loading HTML + CSS
- `src/App.tsx` 或 `src/main.tsx` — mount 後移除 loading 元素
- 不影響任何遊戲邏輯或元件
- 不引入新依賴
