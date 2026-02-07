## 1. 電線斷裂

- [x] 1.1 在 `CircuitDiagram.tsx` 中，burned 狀態時將上段線縮短到 y2=113、下段線從 y1=127 開始，隱藏 junction circle，形成 14px 缺口

## 2. 絕緣皮剝落與銅芯

- [x] 2.1 在缺口處繪製銅色內芯線段（#d97706，短粗線）
- [x] 2.2 在斷裂邊緣繪製兩個黑色小三角形，模擬絕緣皮翻開

## 3. 明火特效

- [x] 3.1 在 `CircuitDiagram.tsx` 新增 4 個橘紅色火焰粒子 circle
- [x] 3.2 在 `App.css` 新增 `fire-rise` keyframe 動畫（向上飄散、縮小、1s 週期）

## 4. ResultPanel 改為 inline 顯示

- [x] 4.1 移除 `ResultPanel.tsx` 的 `result-overlay` 外層包裝，改為直接渲染 `.result-panel`
- [x] 4.2 移除 `App.css` 中 `.result-overlay` 的 fixed 定位樣式，`.result-panel` 改用 `margin-top` 間距
- [x] 4.3 移除 `GameBoard.tsx` 中已不需要的 `resultVisible` 延遲邏輯

## 5. 驗證

- [x] 5.1 執行 `npm run build` 確認編譯通過
- [x] 5.2 執行 `npm run lint` 確認無新增 lint 錯誤（既有 GameBoard.tsx 錯誤非本次引入）
