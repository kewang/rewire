## Context

PanelInteriorView 目前有完整功能（拖曳車道、束帶放置、即時評分），但缺乏任何引導，新手完全無法理解操作目標與方式。所有改動限於 PanelInteriorView 元件內部和 CSS，不影響遊戲邏輯。

## Goals / Non-Goals

**Goals:**
- 讓首次進入整線 overlay 的玩家在 10 秒內理解操作目標
- 以視覺提示取代文字說明書，降低認知負擔
- 增強 SVG 內的可辨識性（區域標注、線材標籤）

**Non-Goals:**
- 不做互動式教學（tutorial wizard / 強制步驟）
- 不修改拖曳或束帶的互動機制
- 不新增 props 或修改 GameBoard

## Decisions

### D1: 分步驟引導列（Step Bar）
在 score bar 上方新增水平步驟列，3 步驟：
1. **消除交叉** — 拖曳線材左右移動（crossings > 0 時高亮）
2. **放置束帶** — 點擊線材之間的放置點（crossings === 0 時高亮）
3. **完成** — 按下完成整線按鈕（所有束帶放好時高亮）

步驟依狀態自動判定 active/done：
- Step 1 active: crossings > 0
- Step 1 done + Step 2 active: crossings === 0 && unbundled > 0
- Step 2 done + Step 3 active: crossings === 0 && unbundled === 0
- 不強制——玩家可以任意順序操作，步驟只是指引

### D2: SVG 區域標注
在 SVG 內三個區域的右側邊緣加上垂直小文字標注：
- 匯流排區：「匯流排」
- 走線區：「走線區」
- NFB 區：「NFB」

使用淡色（#3a4555）避免干擾，rotate 文字貼著右側邊。

### D3: 線材標籤
每條走線在走線區中段位置，沿線材方向顯示迴路名稱標籤（如「廚房」「客廳」），背景為半透明深色圓角矩形，文字白色。

### D4: 拖曳提示
走線區頂部中央顯示半透明提示文字：「← 拖曳調整順序 →」。有拖曳操作過後自動消失（用 state 追蹤 hasDragged）。

### D5: 束帶提示
available 狀態的束帶放置點 hover 時，顯示小 tooltip「點擊綁束帶」。使用 SVG `<title>` 元素實現原生 tooltip，簡單有效。

## Risks / Trade-offs

- SVG 內加入更多文字可能在手機版顯得擁擠 → 手機版隱藏區域標注，只保留步驟列
- 步驟列增加 overlay header 高度 → 使用緊湊 inline 設計（一行顯示 3 步驟）
- 拖曳提示消失後無法再看到 → 步驟列會持續提示當前動作
