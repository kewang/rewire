## Context

v0.6 引入整線美學系統（FR-H），此 change 為第一步：建立配電箱內部視圖元件 `PanelInteriorView`。

目前遊戲的 SVG 視覺化由 `CircuitDiagram.tsx` 負責，繪製的是「迴路→NFB→線材→插座」的功能性示意圖。PanelInteriorView 是全新的視覺元件，展示配電箱**內部走線佈局**——匯流排、車道、NFB 的空間關係。

現有技術基礎：
- Pointer Events 拖曳模式已在 WireSelector/CircuitDiagram 驗證可靠
- SVG 響應式佈局已有成熟模式（CircuitDiagram 的 viewBox + width="100%"）
- CSS variable 主題系統、wireGaugeColor 函式可複用

## Goals / Non-Goals

**Goals:**
- 建立獨立的 `PanelInteriorView.tsx` SVG 元件
- 繪製配電箱三大區域：匯流排區（R/T/N 銅排）、走線區（垂直車道）、NFB 區（DIN 軌道）
- 實作車道拖曳互動（Pointer Events，水平拖曳 snap to lane）
- 交叉偵測（逆序數計算）與視覺標示（紅色高亮）
- 響應式 overlay 容器（桌面 80% / 平板 90% / 手機全螢幕）
- 配電箱金屬質感外殼視覺

**Non-Goals:**
- 不含束帶工具（Change 2 `wire-routing-aesthetics`）
- 不含整線評分引擎（Change 2）
- 不含 GameBoard 流程整合（Change 2）
- 不含 L21–L23 關卡（Change 3）
- 不影響既有 L01–L20 任何功能

## Decisions

### 1. 元件介面設計

`PanelInteriorView` 接收迴路配置資訊，輸出互動式 SVG：

```tsx
interface PanelInteriorViewProps {
  circuitConfigs: readonly CircuitConfig[];
  circuitWires: Record<CircuitId, Wire>;  // 每迴路已選線材
  phases: Record<CircuitId, 'R' | 'T'>;  // 每迴路相位
  lanes: CircuitId[];                     // 車道排列順序（可變）
  onLanesChange: (newLanes: CircuitId[]) => void;  // 車道重排回調
  onClose: () => void;                   // 關閉 overlay
}
```

**理由**：lanes 狀態由父元件（未來的 GameBoard）管理，PanelInteriorView 為受控元件。這保持單向資料流、方便測試、也讓 GameBoard 能在送電時讀取最終 lanes。

### 2. SVG 座標系統

使用固定 viewBox，元件自適應容器寬度：

```
viewBox = "0 0 {totalWidth} {totalHeight}"
totalWidth = PANEL_PADDING*2 + numCircuits * LANE_WIDTH
totalHeight = BUSBAR_Y + BUSBAR_HEIGHT + ROUTING_ZONE_HEIGHT + NFB_ZONE_HEIGHT + PANEL_PADDING
```

關鍵常數（預估）：
- `LANE_WIDTH = 60` — 車道間距（觸控友善 ≥ 40px）
- `BUSBAR_Y = 60` — 匯流排起始 Y
- `BUSBAR_HEIGHT = 50` — R/T/N 三排間距
- `ROUTING_ZONE_HEIGHT = 160` — 走線區高度
- `NFB_ZONE_HEIGHT = 80` — NFB + 標籤區
- `PANEL_PADDING = 30` — 外殼內距

**理由**：固定 viewBox + width="100%" 讓 SVG 自然縮放，與 CircuitDiagram 一致。LANE_WIDTH=60 確保觸控可用。

### 3. 匯流排拓撲與走線起點

匯流排 R/T/N 水平排列，走線起點依相位決定：

| 迴路類型 | 走線起點 X | 說明 |
|----------|-----------|------|
| 110V R 相 | 匯流排左 1/4 處 | R 相分接點在左側 |
| 110V T 相 | 匯流排右 3/4 處 | T 相分接點在右側 |
| 220V (R-T) | 匯流排中間 1/2 處 | 跨相，從中間出發 |

走線終點 = NFB 位置 = 迴路在 circuitConfigs 中的索引 × LANE_WIDTH。

走線路徑為 SVG `<path>` 三段折線：起點 → 水平到車道 X → 垂直下行 → 水平到 NFB X。

**理由**：此拓撲自然產生排列謎題——R 相迴路在右側 NFB 或 T 相迴路在左側 NFB 時會交叉。匯流排位置固定（真實配電箱），走線起點由相位決定。

### 4. 車道拖曳互動

沿用 Pointer Events 模式：

1. `pointerdown` on 線材/車道 → `setPointerCapture`
2. 水平移動超 threshold(8px) → 啟動拖曳
3. 拖曳中：計算最近車道 index，swap lanes 陣列，即時渲染新位置
4. `pointerup` → 確認新排列，呼叫 `onLanesChange`

拖曳中的線材用 CSS `transition: transform 150ms ease` 產生平滑滑動，其他被擠開的車道也 transition。

**替代方案**：HTML5 Drag and Drop API — 不選用，因為觸控支援差、SVG 內元素不支援原生 DnD。

### 5. 交叉偵測

交叉 = 逆序數（inversion count）。對任意兩條線材 i, j：
- 走線起點由相位決定（R=left, T=right, 220V=center）
- 若起點順序與終點（NFB 位置）順序不一致 → 一個交叉

O(n²) 暴力計算即可（n ≤ 6 迴路），無需 merge sort 優化。

交叉的兩條走線路徑交會處繪製紅色圓形標記 + ✕ 圖示。

### 6. 視覺層次

由下而上：
1. 配電箱外殼背景（深灰金屬紋理 rect + linear-gradient）
2. 螺絲裝飾（4 角小圓形）
3. 匯流排銅排（金色 rect + 分接點圓點）
4. 走線區底色（略深區域，暗示可互動）
5. 走線路徑（`<path>` + wireGaugeColor）
6. 交叉標記（紅色 overlay）
7. NFB 圖示（DIN 軌道 + 迷你 NFB rect）
8. 迴路標籤文字
9. 拖曳中的線材（提升 z-index / opacity 變化）

### 7. Overlay 容器

PanelInteriorView 外層包一個 `.panel-overlay` div：
- 半透明背景 `rgba(0,0,0,0.7)`
- 內部 `.panel-container` 居中，圓角，max-width 依 breakpoint
- 頂部工具列：標題「配電箱內部」+ 關閉按鈕
- 底部可放未來的整線分數顯示

CSS 加在 `src/App.css`，使用現有 CSS variable 系統。

## Risks / Trade-offs

- **[觸控拖曳精度]** 手機上車道間距可能偏窄 → 手機版 LANE_WIDTH 加大至 80px（CSS media query 控制 viewBox）
- **[SVG 效能]** 6 迴路 + 動畫應無效能問題，但交叉偵測在每次拖曳都觸發 → O(n²) 可接受
- **[視覺複雜度]** 配電箱內部元素多 → 用明確的區域分隔（匯流排=上、走線=中、NFB=下）降低認知負擔
- **[與 CircuitDiagram 的重複]** 兩者都畫 NFB/線材，但用途不同（功能示意 vs 走線佈局）→ 保持獨立元件，共用 wireGaugeColor 工具函式即可
