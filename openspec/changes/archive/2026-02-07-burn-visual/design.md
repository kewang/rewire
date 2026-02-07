## Context

目前 CircuitDiagram 的 burned 狀態渲染：兩條完整的線段（NFB→junction→outlet）顏色變黑 + 3 個灰色煙霧粒子。線段結構是兩條 `<line>` 和一個 `<circle>` junction。

## Goals / Non-Goals

**Goals:**
- 在 burned 狀態將線段改為斷裂渲染（junction 附近產生缺口）
- 在缺口處顯示銅色內芯和翻開的絕緣皮
- 新增火焰粒子動畫（橘紅色，向上飄散消失）

**Non-Goals:**
- 不改動 warning 狀態的視覺效果
- 不改動模擬引擎

## Decisions

### 1. 電線斷裂：修改線段端點

burned 時將兩條線段改為不經過 junction 點：
- 上段線：y1=50 → y2=**113**（原本到 120，縮短 7px）
- 下段線：y1=**127** → y2=200（原本從 120 開始，往下推 7px）
- junction circle 隱藏
- 形成 14px 的缺口

### 2. 銅芯與絕緣皮：靜態 SVG 元素

在缺口處繪製：
- 銅色線芯：一條短的銅色（#d97706）粗線段，在缺口中央
- 絕緣皮翻開：兩個小三角形（黑色），從斷裂邊緣向外翻，模擬外皮剝落

### 3. 火焰粒子：SVG circle + CSS 動畫

新增 3-4 個橘紅色 circle（不同大小），使用新的 `fire-rise` keyframe：
- 從缺口處向上飄散（translateY -25px）
- 顏色從亮橘 → 暗紅 → 消失
- 動畫時長 1s，比煙霧更快
- 與既有煙霧粒子同時顯示（火焰 + 煙霧 = 燒毀場景）

### 4. ResultPanel 改為 inline 顯示

原本 ResultPanel 使用 `position: fixed` overlay 覆蓋整個畫面，會遮住燒毀特效。改為：
- 移除 `.result-overlay` 外層包裝
- `.result-panel` 改為 inline 元素，用 `margin-top` 間距顯示在遊戲區域下方
- 玩家可同時看到 SVG 燒毀特效和結果資訊

## Risks / Trade-offs

- [SVG 元素增多可能影響渲染效能] → burned 是終態不會持續更新，影響極小
- [斷裂位置固定] → 目前只有一條線路，固定在 junction 附近合理
- [ResultPanel 不再遮住操作區] → 結果面板顯示時遊戲已結束，不影響互動
