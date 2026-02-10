# PRD v0.9 — Project Rewire（平面圖模式）

## 0. 版本摘要

v0.9 建立在 v0.8 已完成的基礎上（28 關、13 電器、6 線材、完整老屋驚魂、隨機老屋、中英雙語），進行遊戲有史以來最大的視覺與互動升級：

**平面圖模式（FR-J）** — 將遊戲從抽象的迴路示意圖搬到真實的室內空間平面圖。玩家在平面圖上看到房間、電器、配電箱，拉線沿牆壁走，距離影響成本，送電時看到電流沿走線路徑流動。這不只是視覺升級，更是為未來弱電系統（網路線、電話線）奠定空間基礎設施。

> v0.1–v0.8 所有功能需求維持不變，本文件僅描述 **增量（delta）** 內容。


## 1. 產品目標（This release）

1. 建立**平面圖**作為遊戲主視圖，讓玩家在真實的空間佈局中操作配電
2. 引入**空間走線系統**（Layer 2：牆壁/天花板走線），走線距離影響成本
3. 玩家可選擇**星形或串聯**走線策略，增加空間維度的策略深度
4. 提供 4 種預設房型（S/M/L/XL），所有 L01–L28 + 隨機老屋全面升級為平面圖模式
5. 配電箱內部操作（壓接、束帶、NFB 排列）保留現有 PanelInteriorView，以 overlay 方式整合
6. 建立**通用走線模型**，為 v1.0 弱電系統預留擴充空間

### 非目標（Not in v0.9）
- 不做弱電 / 網路線（延至 v1.0，但資料模型預留）
- 不做段落級故障模擬（串聯中段燒斷→下游斷電，延至 v1.0）
- 不做手動牆壁走線拖曳（v0.9 用自動路由 + 候選路徑選擇）
- 不做走線品質影響散熱（延至 v1.0）
- 不做使用者自訂房型
- 不做 3D / 等角視角


## 2. 功能需求（Functional Requirements）

### FR-J-A：平面圖資料模型

新增空間資料結構，描述房型佈局、走線路徑、距離關係。

#### 型別定義

```typescript
/** 平面圖出線口 */
interface FloorPlanOutlet {
  /** 相對於房間的位置（0~1 比例） */
  readonly x: number;
  readonly y: number;
  /** 線路類型（v0.9 僅 power，v1.0 擴充 network） */
  readonly type: 'power' | 'network';
}

/** 平面圖房間 */
interface FloorPlanRoom {
  /** 對應 Room.id 或 CircuitConfig 的房間名稱 */
  readonly id: string;
  /** 顯示名稱 */
  readonly label: string;
  /** 格子座標與尺寸（單位：格） */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 潮濕區域標記 */
  readonly wetArea?: boolean;
  /** 出線口位置 */
  readonly outlets: readonly FloorPlanOutlet[];
}

/** 走線路徑圖節點（牆角 / 轉彎點） */
interface RoutingNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/** 走線路徑圖邊（牆段） */
interface RoutingEdge {
  readonly from: string;
  readonly to: string;
  /** 實際距離（公尺），用於成本計算 */
  readonly distance: number;
}

/** 走線路徑圖 */
interface RoutingGraph {
  readonly nodes: readonly RoutingNode[];
  readonly edges: readonly RoutingEdge[];
}

/** 平面圖定義 */
interface FloorPlan {
  /** 格子總寬度 */
  readonly width: number;
  /** 格子總高度 */
  readonly height: number;
  /** 房間列表 */
  readonly rooms: readonly FloorPlanRoom[];
  /** 配電箱位置 */
  readonly panel: {
    readonly x: number;
    readonly y: number;
    /** 配電箱所在房間 ID */
    readonly roomId: string;
  };
  /** 走線路徑圖（沿牆的可用路徑） */
  readonly routingGraph: RoutingGraph;
  /** 比例尺：每格 = 幾公尺 */
  readonly scale: number;
}
```

#### 與 Level 的關係

Level 型別擴充，新增可選的 `floorPlan` 欄位：

```typescript
interface FixedCircuitLevel {
  // ...既有欄位
  readonly floorPlan?: FloorPlan;
}

interface FreeCircuitLevel {
  // ...既有欄位
  readonly floorPlan?: FloorPlan;
}
```

所有 L01–L28 都會附帶 `floorPlan`。`floorPlan` 為可選欄位以維持向後相容，缺少時 fallback 到舊 CircuitDiagram 視圖（但 v0.9 目標是全面覆蓋）。


### FR-J-B：預設房型

提供 4 種預設房型，涵蓋從簡單到複雜的空間佈局：

#### 房型 S — 套房（~10 坪）

用於 L01–L05 教學關卡。

```
┌────────────┬────────┐
│            │        │
│   臥室      │  浴室   │
│            │  💧    │
├────────────┼────────┤
│            │        │
│   客廳      │  廚房   │
│         ⚡ │  💧    │
└────────────┴────────┘
      4格 × 4格
      scale = 1.0（1格=1m）
      配電箱在客廳角落
```

- 4 個房間：臥室、浴室(wetArea)、客廳、廚房(wetArea)
- 配電箱位於客廳靠近入口處
- 走線路徑簡單（2-5m 範圍）

#### 房型 M — 兩房（~18 坪）

用於 L06–L17 自由配迴路。

```
┌──────┬────┬──────────┐
│      │    │          │
│ 主臥  │ 浴室│   客廳    │
│      │ 💧 │          │
├──────┼────┼──────────┤
│      │    │          │
│ 次臥  │ 玄關│   廚房    │
│      │ ⚡ │   💧     │
└──────┴────┴──────────┘
       6格 × 4格
       scale = 1.0
       配電箱在玄關
```

- 6 個房間：主臥、次臥、浴室(wetArea)、客廳、玄關、廚房(wetArea)
- 配電箱位於玄關（中央位置，走線較平均）
- 走線路徑中等（3-8m 範圍）

#### 房型 L — 三房（~22 坪）

用於 L18–L28 老屋驚魂及進階關卡。

```
┌──────┬────┬──────────┬────┐
│      │    │          │    │
│ 主臥  │ 主浴│   客廳    │ 陽台│
│      │ 💧 │          │    │
├──────┼────┤──────────┤────┘
│      │         │
│ 書房  │   餐廳   │
│      │         │
├──────┼────┬────┼──────┐
│      │    │    │      │
│ 次臥  │ 客浴│ 玄關│  廚房 │
│      │ 💧 │ ⚡ │  💧  │
└──────┴────┴────┴──────┘
       8格 × 6格
       scale = 1.0
       配電箱在玄關
```

- 9 個房間：主臥、書房、次臥、主浴(wetArea)、客廳、餐廳、客浴(wetArea)、玄關、廚房(wetArea)、陽台
- 配電箱位於玄關
- 走線路徑較長（3-15m 範圍，距離差異大→成本策略重要）

#### 房型 XL — 豪宅（~35 坪）

用於 L29+ 新關卡及高難度隨機老屋。

```
┌──────┬──────┬────┬──────────┬────┐
│      │      │    │          │    │
│ 主臥  │ 更衣室│ 主浴│   客廳    │ 陽台│
│      │      │ 💧 │          │    │
├──────┴──────┼────┤──────────┤────┘
│             │         │
│    書房      │   餐廳   │
│             │         │
├──────┬──────┼────┬────┼──────┐
│      │      │    │    │      │
│ 次臥  │ 小孩房│ 客浴│ 玄關│  廚房 │
│      │      │ 💧 │ ⚡ │  💧  │
└──────┴──────┴────┴────┴──────┘
       10格 × 6格
       scale = 1.0
       配電箱在玄關
```

- 12 個房間，走線路徑最長（3-18m）
- 距離差異最大，星形 vs 串聯的策略決策最有意義

#### 房型與關卡的對應

| 房型 | 尺寸 | 關卡範圍 | 房間數 | 走線距離範圍 |
|------|------|----------|--------|-------------|
| S | 4×4 | L01–L05 | 4 | 2-5m |
| M | 6×4 | L06–L17 | 6 | 3-8m |
| L | 8×6 | L18–L28 | 9-10 | 3-15m |
| XL | 10×6 | L29+ / 隨機高級 | 12 | 3-18m |

> 教學關卡使用小房型，玩家不會被空間複雜度干擾；進階關卡使用大房型，距離策略成為核心挑戰。


### FR-J-C：空間走線系統

#### 自動路由演算法

走線路徑基於 `RoutingGraph` 計算，使用 **Dijkstra 最短路徑演算法**。

```
輸入：配電箱節點 → 目標房間的出線口節點
輸出：沿牆走的最短路徑 + 總距離（公尺）
```

新增 `src/engine/routing.ts`：

```typescript
/** 計算從配電箱到目標節點的最短路徑 */
function findShortestPath(
  graph: RoutingGraph,
  fromNodeId: string,
  toNodeId: string,
): { path: string[]; distance: number }

/** 計算迴路走線的候選路徑（星形 + 串聯） */
function calcRouteCandidates(
  floorPlan: FloorPlan,
  roomIds: string[],
): RouteCandidates
```

#### 星形 vs 串聯

當一條迴路供應多個房間時，系統自動計算兩種走線方案並讓玩家選擇：

**星形（Home-run）：**
- 每個房間各自從配電箱拉一條獨立走線
- 總距離 = Σ (配電箱到各房間的最短路徑)
- 優勢：未來可支援段落獨立故障（v1.0）
- 劣勢：用線多、成本高

**串聯（Daisy-chain）：**
- 從配電箱出發，經過各房間的最短巡迴路徑
- 使用貪心演算法（nearest neighbor）或最小生成樹近似
- 總距離 = 巡迴路徑總長
- 優勢：省線、成本低
- 劣勢：共用路徑（v1.0 支援段落故障後會有差異）

**單一房間迴路：** 無需選擇，直接使用最短路徑。

#### 走線距離與成本

v0.8 及之前：`cost = wire.costPerMeter × DEFAULT_WIRE_LENGTH(10m)`

v0.9：`cost = wire.costPerMeter × routeDistance`

```
routeDistance = 依走線方案（星形/串聯）計算的實際距離
```

每條走線路徑上標示距離和成本，讓玩家直觀看到「拉到遠處的房間比較貴」。

**成本模型更新：**

```
totalCost = Σ per circuit:
  wire.costPerMeter × routeDistance    ← 改用實際距離
  + nfbCost                            ← 不變（自由配迴路）
  + elcbCost                           ← 不變
```

> **關卡預算重新校準：** 所有 L01–L28 的 budget 需根據新的距離成本重新計算。


### FR-J-D：平面圖渲染

新增 `src/components/FloorPlanView.tsx` 作為主視覺元件。

#### 視覺設計

使用 SVG 渲染，延續現有工業深色主題：

**房間：**
- 圓角矩形色塊
- 未分配迴路：暗色底（`#1a1f2e`）+ 半透明邊框
- 已分配迴路：迴路色邊框（各迴路不同顏色）+ 微亮填色
- wetArea 房間：💧 圖示 + 淡藍色底色調
- 房間名稱置中顯示
- 電器圖示排列於房間內部

**配電箱：**
- ⚡ 圖示 + 特殊高亮邊框
- 可點擊（hover 時 glow 效果）
- 點擊 → 展開 PanelInteriorView overlay

**走線路徑：**
- 沿牆壁繪製的 SVG path
- 線色 = 線徑色（與現有 CircuitDiagram 一致：1.6藍/2.0綠/3.5黃/5.5橘/8.0紅/14紫）
- 未接線時：灰色虛線標示可用路徑
- 候選路徑：兩條半透明線 + 距離/成本標籤，玩家點選其一
- 已確認走線：實線 + 方向箭頭
- 送電中：電流流動動畫（亮點沿路徑移動）

**牆壁：**
- 房間之間的間隙（3-4px），深色（`#0a0c0f`）
- 外牆較粗（5-6px）

**整體佈局：**
```
┌─────────────────────────────────────────────────────┐
│  [關卡名稱]                    [成本: $X / $Y]  [⚙️] │
├─────────────────────────────────────────────────────┤
│                                                       │
│              ┌─────────────────────┐                 │
│              │                     │                 │
│              │     平面圖 SVG       │                 │
│              │     (主視圖區域)      │                 │
│              │                     │                 │
│              │                     │                 │
│              └─────────────────────┘                 │
│                                                       │
├─────────────────────────────────────────────────────┤
│  [1.6] [2.0] [3.5] [5.5] [8.0] [14]   [送電 ⚡]     │
│                底部工具列                               │
└─────────────────────────────────────────────────────┘
```

#### 響應式

- **桌面（≥1025px）：** 平面圖佔主區域，側欄顯示迴路清單/狀態
- **平板（641-1024px）：** 平面圖全寬，迴路清單收合為底部抽屜
- **手機（≤640px）：** 平面圖可雙指縮放平移，工具列固定底部


### FR-J-E：平面圖上的遊戲互動

#### Phase 1：迴路規劃（自由配迴路關卡）

在平面圖上進行迴路規劃，取代現有的 CircuitPlanner 獨立畫面：

1. 點擊房間 → 選擇「指派到迴路 C1 / C2 / 新增迴路」
2. 同迴路的房間亮相同邊框色
3. 電器圖示在房間內顯示，已指派的帶 ✓
4. 迴路清單以 side panel 或底部摘要呈現（NFB / 相位 / ELCB 設定）
5. 配電箱摘要：插槽使用量 + 主開關預估負載 + 相位平衡

**規劃確認後 →** 系統計算各迴路的走線候選路徑。

#### Phase 2：接線

1. 底部工具列選擇線材
2. 拖曳線材到平面圖上的目標房間（或點擊房間）
3. 系統顯示走線路徑候選方案：
   - 單房間迴路：直接顯示最短路徑 + 距離 + 成本
   - 多房間迴路：顯示「星形」和「串聯」兩方案，標示各自距離和成本
4. 玩家點選方案 → 走線確認 → 路徑亮起
5. 平面圖上實時顯示累計成本

#### Phase 3：配電箱作業

點擊配電箱 ⚡ → PanelInteriorView 以 overlay 展開：
- 壓接小遊戲（requiresCrimp）
- NFB 調整（老屋 overrated-breaker）
- ELCB 安裝（老屋 missing-elcb）
- 束帶整理（requiresRouting — 配電箱內部走線）
- 完成後關閉 overlay → 回到平面圖

> **注意：** 配電箱「內部」走線（PanelInteriorView）與「牆壁」走線（FloorPlanView）是兩層不同的系統。v0.9 兩者獨立運作。

#### Phase 4：送電

1. 所有前置條件滿足 → 送電按鈕啟用
2. 點擊送電 → 主開關拉下動畫
3. 電流流動動畫：從配電箱沿走線路徑流向各房間
4. 電器圖示亮起（運轉中）
5. 問題發生時：
   - 過載迴路：走線路徑變紅 + 熱度漸變
   - 燒毀：走線路徑斷裂效果 + 房間閃紅
   - NFB 跳脫：走線路徑熄滅 + 房間暗掉
   - ELCB 跳脫：該迴路走線變灰 + 💧⚠️
   - 主開關跳脫：全部走線熄滅 + 所有房間暗掉
6. 通關：所有房間持續亮起到存活時間結束

#### 固定迴路關卡（L01-L05, L18-L28）的互動

固定迴路關卡在平面圖上的流程簡化（無規劃階段）：

1. 進入關卡 → 平面圖上直接顯示各迴路房間分配
2. 各迴路已標色，電器已在房間內
3. 玩家只需：選線 → 拖到房間 → 選走線方案 → 壓接/配電箱 → 送電
4. 老屋關卡：問題迴路在平面圖上的房間顯示 ⚠️ 閃爍


### FR-J-F：全關卡升級

所有 L01–L28 配上 `floorPlan`，並根據走線距離重新校準 `budget`。

#### 關卡房型對應

| 關卡範圍 | 房型 | 房間使用 | 說明 |
|----------|------|----------|------|
| L01–L05 | S（套房） | 1-4 房間 | 教學關只用套房的部分房間 |
| L06–L10 | M（兩房） | 2-6 房間 | 基礎自由配迴路 |
| L11–L12 | M（兩房） | 3-6 房間 | 相位平衡 |
| L13–L15 | M（兩房） | 2-6 房間 | ELCB / 漏電 |
| L16–L17 | M（兩房） | 1-4 房間 | 壓接端子 |
| L18–L20 | L（三房） | 3-4 房間 | 老屋驚魂 |
| L21–L23 | M（兩房） | 3-6 房間 | 走線整理 |
| L24–L25 | L（三房） | 3 房間 | 老屋新問題 |
| L26–L28 | L（三房） | 4-5 房間 | 綜合挑戰 |

每個關卡的 `floorPlan` 指定使用哪個房型，以及該關卡實際使用的房間子集。未使用的房間以暗灰色顯示（不可互動），營造「這是真實住宅的一部分」的氛圍。

#### 預算校準原則

```
新 budget = 原 budget × (平均走線距離 / DEFAULT_WIRE_LENGTH)
         + 距離差異容錯（~20%）
```

> 精確數值需 playtest 微調。PRD 不鎖定具體數字。

#### 隨機老屋的房型

隨機老屋生成器 `generateRandomOldHouse` 擴充，依難度選擇房型：

| 難度 | 房型 | 迴路數 |
|------|------|--------|
| 初級 | M | 2-3 |
| 中級 | L | 3-4 |
| 高級 | XL | 4-6 |


### FR-J-G：新關卡 L29–L31

利用 XL 房型新增 3 個高難度關卡：

#### L29 — 豪宅配電

```
房型：XL
描述：12 個房間的豪宅，第一次面對真正的空間挑戰。距離影響一切！

房間（使用全部 12 房間）：
  主臥 [除濕機(5.5A)]
  更衣室 [吹風機(10.9A)]
  主浴 [浴室暖風機(7.5A, 220V)] (wetArea)
  客廳 [冷氣(12.7A, 220V), 電暖器(16.4A)]
  陽台 []（無電器）
  書房 [除濕機(5.5A)]
  餐廳 [微波爐(10.0A)]
  次臥 [除濕機(5.5A)]
  小孩房 [除濕機(5.5A)]
  客浴 [浴室暖風機(7.5A, 220V)] (wetArea)
  玄關 [冰箱(1.8A)]
  廚房 [快煮壺(13.6A), 烤箱(13.6A), IH 爐(13.6A, 220V)] (wetArea)

配電箱：8 插槽 / 100A 主開關
預算：$500（需精算距離）
存活：15 秒
phaseMode：manual
leakageMode：random
requiresCrimp：true

設計意圖：
  首次 XL 房型。12 房間的空間佈局讓走線距離差異巨大。
  主臥和次臥離配電箱最遠（~15m），廚房最近（~3m）。
  串聯 vs 星形的策略選擇在此關真正影響成本。
  多 wetArea 房間需要 ELCB 規劃。

第三星：{ type: 'under-budget-ratio', ratio: 0.8 }
```

#### L30 — 豪宅翻修

```
房型：XL
描述：豪宅老屋翻修 + 走線整理。空間越大，問題越多！

circuitConfigs（固定迴路 + 老屋模式）：
  c1「廚房」110V / 30A NFB / R 相 — [快煮壺, 烤箱]
  c2「主浴」220V / 20A NFB / wetArea / elcbAvailable — [浴室暖風機]
  c3「客廳」110V / 20A NFB / R 相 — [電暖器]
  c4「客廳冷氣」220V / 20A NFB — [冷氣]
  c5「次臥+書房」110V / 15A NFB / T 相 — [除濕機, 除濕機]
  c6「主臥」110V / 15A NFB / T 相 — [除濕機]

老屋問題：
  c1：overrated-breaker（30A 保護 2.0mm²）+ wrong-wire-gauge（2.0mm² 不夠 27.2A）
  c2：missing-elcb
  c3：oxidized-splice
  c5：bare-wire

預算：$450
存活：15 秒
phaseMode：manual
requiresCrimp：true
requiresRouting：true

設計意圖：
  XL 房型的老屋翻修。走線距離長，修復成本高。
  c5 串聯次臥+書房 vs 各拉各的，是走線策略的核心決策。

第三星：{ type: 'aesthetics-score', minScore: 70 }
```

#### L31 — 終極豪宅

```
房型：XL
描述：v0.9 畢業考。豪宅 + 老屋 + 全機制 + 走線距離。你準備好了嗎？

迴路配置（固定迴路 + 老屋模式）：7 迴路，全機制綜合。

預算：$600
存活：18 秒
全機制疊加：phaseMode manual + leakageMode random + requiresCrimp + requiresRouting + oldHouse

設計意圖：
  v0.9 的最終挑戰。XL 房型 + 走線距離 + 全 5 種問題 + 相位 + 漏電 + 整線。
  距離策略（星形/串聯）在此關影響能否在預算內完成修復。

第三星：{ type: 'under-budget-ratio', ratio: 0.75 }
```

> 關卡精確數值待 playtest 微調。


## 3. 更新後的完整數據表

### 線材（6 種，不變）

（同 v0.8）

### 電器（13 種，不變）

（同 v0.8）

### NFB（3 種，不變）

（同 v0.8）

### 老屋問題（5 種，不變）

（同 v0.8）

### 房型（4 種，新增）

| 房型 | 尺寸 | 坪數 | 房間數 | 配電箱位置 | 走線距離範圍 | 用途 |
|------|------|------|--------|-----------|-------------|------|
| S | 4×4 | ~10坪 | 4 | 客廳 | 2-5m | 教學 |
| M | 6×4 | ~18坪 | 6 | 玄關 | 3-8m | 基礎-進階 |
| L | 8×6 | ~22坪 | 9-10 | 玄關 | 3-15m | 老屋+綜合 |
| XL | 10×6 | ~35坪 | 12 | 玄關 | 3-18m | 高難度+新關卡 |


## 4. 架構設計

### 元件關係圖

```
GameBoard.tsx（主控制器，不變）
│
├── FloorPlanView.tsx ←── 新增，取代 CircuitDiagram 作為主視圖
│   ├── FloorPlanRoom.tsx ←── 新增，單一房間 SVG 渲染
│   ├── FloorPlanWiring.tsx ←── 新增，走線路徑 SVG 渲染
│   └── FloorPlanPanel.tsx ←── 新增，配電箱標記 + 點擊互動
│
├── PanelInteriorView.tsx（不變，overlay 模式展開）
│   └── 壓接 / 束帶 / NFB 排列
│
├── CircuitPlannerSidebar.tsx ←── 重構自 CircuitPlanner，改為 side panel
│   ├── CircuitCard.tsx（調整大小，精簡版）
│   └── 迴路摘要（成本/相位/ELCB）
│
├── WireToolbar.tsx ←── 重構自 WireSelector，改為底部工具列
│
├── StatusDisplay.tsx（調整位置，浮動 overlay）
│
├── ResultPanel.tsx（不變）
│   └── BeforeAfterView.tsx（不變）
│
└── CircuitDiagram.tsx（保留作為 fallback，但 v0.9 關卡不使用）
```

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `src/types/floorPlan.ts` | FloorPlan / RoutingGraph / RoutingNode / RoutingEdge 型別 |
| `src/engine/routing.ts` | 走線路由演算法（Dijkstra + 星形/串聯候選方案） |
| `src/data/floorPlans.ts` | 4 種預設房型定義 |
| `src/components/FloorPlanView.tsx` | 平面圖主 SVG 元件 |
| `src/components/FloorPlanRoom.tsx` | 房間渲染子元件 |
| `src/components/FloorPlanWiring.tsx` | 走線路徑渲染子元件 |
| `src/components/FloorPlanPanel.tsx` | 配電箱渲染子元件 |
| `src/components/WireToolbar.tsx` | 底部線材工具列 |
| `src/components/CircuitPlannerSidebar.tsx` | 迴路規劃側欄 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `src/types/game.ts` | Level 型別新增 `floorPlan?: FloorPlan` |
| `src/data/levels.ts` | 所有 L01–L28 新增 floorPlan 欄位 + budget 重新校準 |
| `src/data/constants.ts` | 移除或保留 `DEFAULT_WIRE_LENGTH`（fallback 用） |
| `src/components/GameBoard.tsx` | 主視圖切換 FloorPlanView + PanelInteriorView overlay 管理 + 走線成本計算 |
| `src/engine/randomOldHouse.ts` | 擴充支援房型選擇 |
| `src/engine/scoring.ts` | 成本計算適配距離走線 |
| `src/locales/zh-TW.json` | 新增平面圖相關翻譯 |
| `src/locales/en.json` | 新增平面圖相關翻譯 |


## 5. 關鍵設計決策摘要

| 決策 | 選擇 | 理由 |
|------|------|------|
| 平面圖為主視圖 | 取代 CircuitDiagram | 空間感是核心價值，不應作為附加視圖 |
| 只做 Layer 2（牆壁走線） | PanelInteriorView 保留 | 分層降低複雜度，配電箱內部已有完整系統 |
| 色塊方格房間 | 非精細建築圖 | 工程量可控，視覺足夠清晰，可疊代美化 |
| 預設固定房型 | 非程序化生成 | v0.9 聚焦平面圖體驗，房型生成可後續追加 |
| 4 種房型 S/M/L/XL | 漸進複雜度 | 教學簡單→進階複雜，與關卡難度曲線匹配 |
| 自動路由 + 候選選擇 | 非手動拖曳走線 | 降低操作複雜度，保留策略決策 |
| 星形 + 串聯兩方案 | 非僅自動選最短 | 真實世界兩種皆有，增加策略深度 |
| 距離影響成本 | 取代固定 10m | 平面圖的核心遊戲性價值，也為弱電系統打基礎 |
| v0.9 不做段落級故障 | 串聯 vs 星形僅影響成本 | 模擬引擎改動過大，v1.0 再做 |
| 走線模型用 RoutingGraph | 通用圖結構 | 未來弱電系統可共用相同路徑圖 |
| FloorPlan 為 Level 可選欄位 | 缺少時 fallback CircuitDiagram | 向後相容，漸進遷移 |
| 全 L01–L28 升級平面圖 | 非只新關卡 | 統一體驗，避免兩套 UI 並存的割裂感 |
| PanelInteriorView 以 overlay 展開 | 非嵌入平面圖 | 配電箱內部需要大畫面精細操作 |
| 配電箱位置在玄關（M/L/XL） | 中央位置 | 走線距離較平均，符合台灣住宅慣例 |
| `RoutingEdge.distance` 使用公尺 | 非格子數 | `scale` 轉換，直接對接 `wire.costPerMeter` |
| FloorPlanOutlet.type 含 'network' | v0.9 不使用 | 資料模型為 v1.0 弱電預留 |


## 6. 向後相容性

- L01–L28 全部新增 `floorPlan` 欄位 + budget 重新校準
- `Level` 型別：`floorPlan` 為可選欄位，缺少時 fallback 舊視圖
- `DEFAULT_WIRE_LENGTH` 保留但標記 deprecated（fallback 用）
- `CircuitDiagram.tsx` 保留但不再被平面圖關卡使用
- 模擬引擎（simulation.ts）完全不動
- 壓接系統（CrimpMiniGame）完全不動
- PanelInteriorView 完全不動，僅改為 overlay 展開方式
- localStorage 星等 key 不變（`rewire-stars`），但 budget 改變可能影響既有星等——可清除或保留（對玩家影響小）
- 新增 localStorage key：無
- 新增元件：9 個（見架構設計）
- 新增引擎檔案：1 個（routing.ts）
- 新增資料檔案：2 個（floorPlans.ts, types/floorPlan.ts）


## 7. 實作順序

| 順序 | Change 名稱 | 範圍 | 依賴 |
|------|------------|------|------|
| 1 | `floor-plan-data-model` | FloorPlan / RoutingGraph 型別 + Level 擴充 + 4 種預設房型定義 | 無 |
| 2 | `routing-engine` | routing.ts 走線路由演算法（Dijkstra + 星形/串聯候選）+ 距離成本計算 | Change 1 |
| 3 | `floor-plan-renderer` | FloorPlanView + FloorPlanRoom + FloorPlanWiring + FloorPlanPanel SVG 渲染（靜態） | Change 1 |
| 4 | `floor-plan-wiring-interaction` | 拖曳接線到房間 + 候選路徑顯示/選擇 + 距離成本即時更新 | Change 2, 3 |
| 5 | `floor-plan-game-integration` | GameBoard 整合 FloorPlanView + PanelInteriorView overlay + 送電動畫 + 結果視覺 | Change 4 |
| 6 | `floor-plan-planner` | CircuitPlannerSidebar 重構 + 平面圖上的迴路規劃互動 + WireToolbar | Change 5 |
| 7 | `floor-plan-levels` | L01–L28 全部配上 floorPlan + budget 重新校準 + L29–L31 新關卡 | Change 5, 6 |
| 8 | `floor-plan-random-old-house` | 隨機老屋生成器擴充（房型選擇 + 距離成本） | Change 7 |
| 9 | `floor-plan-polish` | 送電動畫細節 + 響應式調校 + i18n 翻譯 + 整體 playtest 微調 | Change 8 |


## 8. 後續版本方向（Roadmap Preview）

- **v1.0**：弱電箱與網路線系統（共用 RoutingGraph + 新增 network outlet）
- **v1.1**：段落級故障模擬（串聯中段燒斷→下游斷電）+ 走線品質影響散熱
- **v1.2**：程序化房型生成 + 使用者自訂房型
- **v2.0**：3D 等角視角（長期願景）
