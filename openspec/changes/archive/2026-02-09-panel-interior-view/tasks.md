## 1. SVG 基礎結構與配電箱外殼

- [x] 1.1 建立 `src/components/PanelInteriorView.tsx`，定義 Props 介面（circuitConfigs, circuitWires, phases, lanes, onLanesChange, onClose）
- [x] 1.2 實作 SVG viewBox 計算邏輯（依迴路數量動態 totalWidth/totalHeight）與常數定義（LANE_WIDTH, BUSBAR_Y, ROUTING_ZONE_HEIGHT 等）
- [x] 1.3 繪製配電箱外殼：深灰金屬質感背景（#1a1d23 + linearGradient）、圓角矩形外框、四角螺絲裝飾、頂部裝飾文字

## 2. 匯流排區繪製

- [x] 2.1 繪製 R/T/N 三條水平銅排（銅色 #d97706 + 金屬光澤），左側標示 R（紅）/T（深色）/N（白）相位標籤
- [x] 2.2 依每迴路相位配置繪製分接點（R 相左側、T 相右側、220V 中間），分接點為小圓點

## 3. 走線區繪製

- [x] 3.1 繪製走線路徑：每條迴路從匯流排分接點到 NFB 位置的三段折線 `<path>`，顏色使用 wireGaugeColor，粗細依電壓（110V=4px, 220V=6px）
- [x] 3.2 實作走線起點計算：R 相→左 1/4、T 相→右 3/4、220V→中間 1/2

## 4. NFB 區繪製

- [x] 4.1 繪製 DIN 軌道水平銀色線條
- [x] 4.2 繪製每個 NFB 迷你圖示（矩形 + 額定電流文字「15A」「20A」「30A」）
- [x] 4.3 繪製迴路標籤（NFB 下方顯示迴路 label 如「廚房」「客廳」）

## 5. 車道拖曳互動

- [x] 5.1 實作 Pointer Events 拖曳：pointerdown 設定 capture、水平移動 > 8px 啟動拖曳、pointerup 確認
- [x] 5.2 拖曳中 snap to nearest lane：計算最近車道 index，即時 swap lanes 並呼叫 onLanesChange
- [x] 5.3 CSS transition 平滑動畫：拖曳中的線材 + 被擠開的車道以 150ms ease 滑動

## 6. 交叉偵測與視覺

- [x] 6.1 實作交叉偵測演算法：O(n²) 逆序數計算（比較起點順序 vs NFB 位置順序）
- [x] 6.2 繪製交叉標記：交叉處紅色圓形 + ✕ 圖示，即時隨拖曳更新
- [x] 6.3 交叉走線路徑段紅色高亮效果

## 7. Overlay 容器與響應式

- [x] 7.1 在 `src/App.css` 新增 `.panel-overlay` 樣式：半透明背景、居中容器、標題列（「配電箱內部」+ 關閉按鈕）
- [x] 7.2 響應式 breakpoints：桌面 80% / 平板 90% / 手機全螢幕，手機版車道間距加大
