## Why

玩家首次進入整線 overlay 時，對操作目標和互動方式完全陌生，反映出四個問題：
1. **概念不清楚** — 不理解「交叉」「束帶」「車道」與真實配電箱的關係
2. **操作不直覺** — 不知道可以拖曳、可以點擊放束帶
3. **缺少引導提示** — 沒有步驟指引，不知從何下手
4. **視覺看不懂** — SVG 太抽象，看不出哪些是線、哪些是 NFB、哪裡可互動

需要在 PanelInteriorView 加入引導和視覺強化，讓新手能自主上手。

## What Changes

- 新增分步驟引導列（Step bar）：步驟 1 消除交叉 → 步驟 2 放置束帶 → 步驟 3 完成
- 新增首次開啟提示（概念說明 tooltip/banner），解釋什麼是交叉和束帶
- SVG 區域標注：匯流排區、走線區、NFB 區加上文字標注
- 走線區加入拖曳提示（← → 箭頭 / grab 光標提示文字）
- 束帶放置點 hover 時顯示文字提示
- 線材上標注迴路名稱讓玩家辨識

## Capabilities

### New Capabilities
- `routing-ux-guide`: 整線 overlay 的引導系統與視覺強化

### Modified Capabilities
- `panel-interior-view`: 新增區域標注、線材標籤、拖曳/束帶操作提示

## Impact

- `src/components/PanelInteriorView.tsx` — 主要修改（引導列、標注、提示文字）
- `src/App.css` — 新增引導列、提示元素樣式
- 不影響遊戲邏輯、不影響 scoring、不影響 GameBoard
