### Requirement: Panel Interior View SVG Layout
PanelInteriorView 元件 SHALL 繪製配電箱內部 SVG，包含三個垂直排列的區域：匯流排區（頂部）、走線區（中間）、NFB 區（底部）。SVG SHALL 使用固定 viewBox 搭配 width="100%" 實現響應式縮放。

#### Scenario: Render panel with 3 circuits
- **WHEN** PanelInteriorView 接收 3 個 circuitConfigs
- **THEN** SVG 繪製 3 個車道寬度的配電箱，含匯流排區（R/T/N 三排銅排）、3 條垂直走線、3 個 NFB 圖示

#### Scenario: Render panel with 6 circuits
- **WHEN** PanelInteriorView 接收 6 個 circuitConfigs
- **THEN** SVG 寬度自動擴展至 6 車道，所有區域等比例呈現

### Requirement: Busbar Rendering
匯流排區 SHALL 繪製 R 相（紅色標籤）、T 相（藍色標籤）、N 中性線（灰色標籤）三條水平銅排，銅排顏色為銅色(#d97706)。每條迴路在匯流排上 SHALL 有一個放大的分接點（r=5），填充為對應相位色。分接點旁 SHALL 顯示小文字相位標籤（「R」或「T」）。

#### Scenario: Enlarged tap points with phase color
- **WHEN** 迴路為 110V R 相
- **THEN** R 銅排上的分接點 r=5，填充紅色(#ef4444)，旁邊顯示紅色「R」標籤

#### Scenario: T-phase tap point
- **WHEN** 迴路為 110V T 相
- **THEN** T 銅排上的分接點 r=5，填充藍色(#60a5fa)，旁邊顯示藍色「T」標籤

#### Scenario: 220V dual tap points
- **WHEN** 迴路為 220V
- **THEN** R 和 T 銅排上各有一個分接點，兩點之間用短虛線連接

#### Scenario: Busbar tap points for mixed voltage circuits
- **WHEN** 迴路包含 110V R 相、110V T 相、220V 迴路
- **THEN** R 相迴路的分接點出現在 R 銅排左側區域，T 相迴路的分接點出現在 T 銅排右側區域，220V 迴路的分接點出現在中間區域跨接 R-T

### Requirement: Wire Routing Paths
走線區 SHALL 繪製每條迴路的走線路徑，從匯流排分接點垂直向下連接到對應 NFB。走線路徑 SHALL 分三段著色：上段（匯流排→走線區入口）使用相位色，中段使用漸層從相位色過渡到線徑色，下段（走線區出口→NFB）使用線徑色。220V 迴路的走線粗細 SHALL 為 6px，110V 迴路為 4px。

#### Scenario: R-phase wire color
- **WHEN** 迴路為 110V R 相
- **THEN** 上段走線為紅色(#ef4444)，中段漸變至線徑色，下段為線徑色

#### Scenario: T-phase wire color
- **WHEN** 迴路為 110V T 相
- **THEN** 上段走線為藍色(#60a5fa)，中段漸變至線徑色，下段為線徑色

#### Scenario: 220V wire color
- **WHEN** 迴路為 220V
- **THEN** 上段走線為紫色(#a855f7)，中段漸變至線徑色，下段為線徑色

#### Scenario: Wire colors match gauge in lower segment
- **WHEN** 迴路使用 2.0mm² 線材
- **THEN** 下段走線顏色為綠色(#86efac)

#### Scenario: 220V wire is thicker
- **WHEN** 迴路電壓為 220V
- **THEN** 走線路徑寬度為 6px（一般 110V 為 4px）

### Requirement: Neutral Return Path
每個 110V 迴路 SHALL 繪製一條灰色虛線中性線回路，從 NFB 下方連接到 N 匯流排。

#### Scenario: 110V circuit neutral line
- **WHEN** 迴路為 110V（R 或 T 相）
- **THEN** 繪製灰色虛線（strokeDasharray="4 4"，opacity=0.3）從 NFB 底部垂直向下再水平連接到 N 匯流排 tap point

#### Scenario: 220V circuit no neutral
- **WHEN** 迴路為 220V
- **THEN** 不繪製 N 回路虛線（220V 跨 R-T，無中性線）

#### Scenario: N tap point rendering
- **WHEN** 110V 迴路的 N 回路虛線連接到 N 匯流排
- **THEN** N 匯流排上的 tap point r=4，灰色填充

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

### Requirement: Cable Tie Props
PanelInteriorView SHALL 新增 props：`cableTies: Set<number>` 和 `onToggleCableTie: (pairIndex: number) => void`。cableTies 表示已放束帶的相鄰車道 pair index，onToggleCableTie 為 toggle 回調。

#### Scenario: Receive cable tie state
- **WHEN** PanelInteriorView 接收 cableTies = Set([0, 2])
- **THEN** pair index 0 和 2 的束帶放置點顯示已放置狀態

#### Scenario: Toggle callback fires
- **WHEN** 玩家點擊 pair index 1 的放置點
- **THEN** onToggleCableTie(1) 被呼叫

### Requirement: Cable Tie Placement Points Rendering
走線區中每對相鄰車道之間 SHALL 渲染一個可點擊的束帶放置點。放置點位於兩條線材的垂直中間位置、走線區的水平中央。

#### Scenario: Placement points count
- **WHEN** PanelInteriorView 顯示 4 條車道
- **THEN** 走線區顯示 3 個束帶放置點

#### Scenario: Placement point position
- **WHEN** lane[i] 在 x=100、lane[i+1] 在 x=164
- **THEN** 放置點中心在 x=132、y=走線區垂直中央

### Requirement: Cable Tie Visual States
放置點 SHALL 依狀態顯示不同視覺效果。

#### Scenario: Available (no tie, no crossing)
- **WHEN** 相鄰線材平行且未放束帶
- **THEN** 放置點顯示淡黃色虛線提示，hover 時高亮

#### Scenario: Placed cable tie
- **WHEN** cableTies 包含此 pair index
- **THEN** 顯示綠色束帶圖示（環繞兩條線的束帶造型）

#### Scenario: Crossing disabled
- **WHEN** 兩條相鄰線材的路徑交叉
- **THEN** 放置點顯示 disabled（紅色半透明 + cursor: not-allowed）

### Requirement: Aesthetics Score Display
PanelInteriorView score bar SHALL 新增 `aestheticsScore` prop 顯示。

#### Scenario: Score bar content
- **WHEN** aestheticsScore = 85
- **THEN** score bar 顯示「交叉數: N | 束帶: M/T | 整線分數: 85」

#### Scenario: Score updates in real-time
- **WHEN** 玩家拖曳車道或放置束帶導致 aestheticsScore 從 70 變 90
- **THEN** score bar 中的分數即時更新為 90

### Requirement: SVG Area Labels
PanelInteriorView SVG SHALL 在三個區域的右側邊緣顯示垂直區域標注文字。

#### Scenario: Area labels rendered
- **WHEN** PanelInteriorView 渲染
- **THEN** 匯流排區右側顯示「匯流排」、走線區右側顯示「走線區」、NFB 區右側顯示「NFB」
- **AND** 標注文字為淡色（#3a4555），90 度旋轉，不干擾主要視覺

#### Scenario: Mobile hidden
- **WHEN** viewport ≤ 640px
- **THEN** 區域標注文字隱藏（手機版空間不足）
