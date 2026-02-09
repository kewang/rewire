### Requirement: Panel Interior View SVG Layout
PanelInteriorView 元件 SHALL 繪製配電箱內部 SVG，包含三個垂直排列的區域：匯流排區（頂部）、走線區（中間）、NFB 區（底部）。SVG SHALL 使用固定 viewBox 搭配 width="100%" 實現響應式縮放。

#### Scenario: Render panel with 3 circuits
- **WHEN** PanelInteriorView 接收 3 個 circuitConfigs
- **THEN** SVG 繪製 3 個車道寬度的配電箱，含匯流排區（R/T/N 三排銅排）、3 條垂直走線、3 個 NFB 圖示

#### Scenario: Render panel with 6 circuits
- **WHEN** PanelInteriorView 接收 6 個 circuitConfigs
- **THEN** SVG 寬度自動擴展至 6 車道，所有區域等比例呈現

### Requirement: Busbar Rendering
匯流排區 SHALL 繪製 R 相（紅色標籤）、T 相（深色標籤）、N 中性線（白色標籤）三條水平銅排，銅排顏色為銅色(#d97706)。每條迴路在匯流排上 SHALL 有一個分接點標示。

#### Scenario: Busbar tap points for mixed voltage circuits
- **WHEN** 迴路包含 110V R 相、110V T 相、220V 迴路
- **THEN** R 相迴路的分接點出現在 R 銅排左側區域，T 相迴路的分接點出現在 T 銅排右側區域，220V 迴路的分接點出現在中間區域跨接 R-T

### Requirement: Wire Routing Paths
走線區 SHALL 繪製每條迴路的走線路徑，從匯流排分接點垂直向下連接到對應 NFB。走線顏色 SHALL 使用現有 wireGaugeColor 函式依線徑區分。220V 迴路的走線粗細 SHALL 為 6px，110V 迴路為 4px。

#### Scenario: Wire colors match gauge
- **WHEN** 迴路使用 2.0mm² 線材
- **THEN** 走線顏色為綠色(#86efac)

#### Scenario: 220V wire is thicker
- **WHEN** 迴路電壓為 220V
- **THEN** 走線路徑寬度為 6px（一般 110V 為 4px）

### Requirement: Wire Route Start Position by Phase
110V R 相迴路的走線 SHALL 從匯流排左側區域出發。110V T 相迴路 SHALL 從匯流排右側區域出發。220V 迴路 SHALL 從匯流排中間出發。此拓撲決定了走線的交叉可能性。

#### Scenario: R-phase circuit starts from left
- **WHEN** 迴路為 110V R 相
- **THEN** 走線起點 X 座標在匯流排左 1/4 區域

#### Scenario: T-phase circuit starts from right
- **WHEN** 迴路為 110V T 相
- **THEN** 走線起點 X 座標在匯流排右 3/4 區域

#### Scenario: 220V circuit starts from center
- **WHEN** 迴路為 220V
- **THEN** 走線起點 X 座標在匯流排中間 1/2 區域

### Requirement: NFB Zone Rendering
NFB 區 SHALL 繪製水平 DIN 軌道（銀色線條）、每個迴路的 NFB 迷你圖示（矩形 + 額定電流文字如「20A」）、以及迴路標籤。NFB 位置 SHALL 固定，順序與 circuitConfigs 一致，不可由玩家調整。

#### Scenario: NFB labels match circuit config
- **WHEN** circuitConfigs 定義 c1「廚房」20A NFB
- **THEN** 對應 NFB 圖示顯示「20A」，下方標籤顯示「廚房」

### Requirement: Lane Drag Interaction
玩家 SHALL 可以透過 Pointer Events 水平拖曳走線來重新排列車道順序。拖曳啟動閾值為水平移動 8px。拖曳中線材 SHALL snap 到最近車道位置。其他車道 SHALL 以 CSS transition 平滑讓位。

#### Scenario: Drag wire to swap lanes
- **WHEN** 玩家將車道 1 的線材拖曳到車道 3 的位置
- **THEN** 車道 1 和車道 3 的線材互換位置，中間車道自動調整，onLanesChange 回調觸發並傳入新排列

#### Scenario: Drag threshold prevents accidental activation
- **WHEN** 玩家在線材上 pointerdown 但水平移動 < 8px
- **THEN** 不啟動拖曳

#### Scenario: Smooth transition during drag
- **WHEN** 拖曳導致車道重排
- **THEN** 被擠開的車道以 150ms ease transition 動畫滑動到新位置

### Requirement: Crossing Detection and Visual
元件 SHALL 偵測走線的交叉數（逆序數）。交叉判定：若兩條走線的起點順序與終點（NFB 位置）順序不一致，則為一個交叉。交叉處 SHALL 以紅色標記高亮顯示。

#### Scenario: Detect crossing between two wires
- **WHEN** 車道排列導致線材 A 從左起點到右 NFB、線材 B 從右起點到左 NFB
- **THEN** 偵測到 1 個交叉，交叉處顯示紅色高亮 + ✕ 圖示

#### Scenario: No crossing in optimal arrangement
- **WHEN** 所有走線的起點順序與 NFB 順序一致
- **THEN** 交叉數為 0，無紅色標記

#### Scenario: Crossing updates in real-time during drag
- **WHEN** 拖曳車道改變排列
- **THEN** 交叉偵測即時重新計算，紅色標記即時更新

### Requirement: Panel Enclosure Visual
配電箱外殼 SHALL 繪製金屬質感背景（深灰 #1a1d23 + 微光澤 linear-gradient）、圓角矩形外框、四角螺絲裝飾。頂部 SHALL 有裝飾性品牌/型號文字。

#### Scenario: Metal texture appearance
- **WHEN** PanelInteriorView 渲染
- **THEN** 背景為深灰金屬質感，四角有螺絲圓形裝飾

### Requirement: Overlay Container
PanelInteriorView SHALL 包含在 overlay 容器中。Overlay 背景為半透明黑色(rgba(0,0,0,0.7))。內部容器居中顯示，頂部有標題「配電箱內部」與關閉按鈕。

#### Scenario: Close overlay
- **WHEN** 玩家點擊關閉按鈕
- **THEN** onClose 回調觸發，overlay 關閉

### Requirement: Responsive Layout
Overlay 容器 SHALL 依裝置尺寸調整：桌面（≥1025px）寬 80%、平板（641-1024px）寬 90%、手機（≤640px）全螢幕。手機版車道間距 SHALL 加大以確保觸控可用性。

#### Scenario: Desktop layout
- **WHEN** viewport ≥ 1025px
- **THEN** overlay 容器寬度為 80%，居中顯示

#### Scenario: Mobile full-screen layout
- **WHEN** viewport ≤ 640px
- **THEN** overlay 容器全螢幕顯示，車道間距加大
