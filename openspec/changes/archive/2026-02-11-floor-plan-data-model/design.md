## Context

v0.9 平面圖模式的核心基礎建設。目前遊戲的空間概念完全抽象化——走線距離固定 10m（`DEFAULT_WIRE_LENGTH`），所有房間等價。v0.9 要引入真實的空間佈局，讓走線距離影響成本，從而增加策略深度。

本 change 是純資料模型層，不涉及 UI 渲染或路由演算法。後續 change（routing-engine、floor-plan-renderer）都依賴此處定義的型別。

現有型別架構：
- `src/types/game.ts`：Level = FixedCircuitLevel | FreeCircuitLevel
- `src/data/levels.ts`：L01-L28 關卡定義
- `src/data/constants.ts`：線材、電器、NFB 常數

## Goals / Non-Goals

**Goals:**
- 定義完整的平面圖型別系統（FloorPlan、FloorPlanRoom、RoutingGraph 等）
- 建立 4 種預設房型（S/M/L/XL），含精確的房間佈局、出線口位置、走線路徑圖
- 擴充 Level 型別支援 floorPlan 可選欄位，保持向後相容
- RoutingGraph 使用通用圖結構，為 v1.0 弱電預留擴充空間

**Non-Goals:**
- 不實作路由演算法（routing-engine change）
- 不實作 SVG 渲染（floor-plan-renderer change）
- 不修改關卡定義（floor-plan-levels change）
- 不做走線距離成本計算（routing-engine change）
- 不做程序化房型生成

## Decisions

### 1. 型別放在獨立檔案 `src/types/floorPlan.ts`

**選擇**：新增 `src/types/floorPlan.ts` 而非加到 `game.ts`

**理由**：平面圖型別（FloorPlan、RoutingGraph 等）是相對獨立的資料結構領域，與既有的 Circuit/Level 型別職責不同。獨立檔案讓 import 更明確，避免 game.ts 繼續膨脹。

**替代方案**：全部加到 game.ts → 單檔過大（已 327 行），概念混雜。

### 2. RoutingGraph 使用 adjacency list（nodes + edges）

**選擇**：`{ nodes: RoutingNode[], edges: RoutingEdge[] }` 圖結構

**理由**：
- Dijkstra 演算法的標準輸入格式
- 邊上攜帶 distance（公尺），直接用於成本計算
- 同一路徑圖可服務 power + network（v1.0），只需不同的 outlet type 過濾
- JSON-serializable，方便 export 為靜態資料

**替代方案**：adjacency matrix → 稀疏圖浪費空間；nested room graph → 不夠通用。

### 3. 座標系統使用格子單位 + scale 轉換

**選擇**：房間位置/尺寸用整數格子座標，`FloorPlan.scale` 轉換為公尺

**理由**：
- 整數格子方便 SVG 渲染對齊
- scale = 1.0（1格=1m）簡化初始版本
- 未來可支援不同 scale 的房型
- RoutingEdge.distance 直接用公尺，不需每次轉換

### 4. FloorPlanOutlet.type 預留 'network'

**選擇**：`type: 'power' | 'network'`，v0.9 所有 outlet 都用 'power'

**理由**：v1.0 弱電系統需要在相同房間定義網路出線口，提前預留避免 breaking change。type guard 過濾即可。

### 5. 預設房型作為靜態常數 export

**選擇**：`src/data/floorPlans.ts` export `FLOOR_PLAN_S/M/L/XL` 常數

**理由**：
- 4 種房型為固定設計，不需動態計算
- 常數 export 讓關卡定義直接引用（`floorPlan: FLOOR_PLAN_M`）
- 型別安全（`as const satisfies FloorPlan`）

### 6. RoutingGraph 節點包含房間出線口 + 牆角轉彎點 + 配電箱

**選擇**：nodes 包含三類：
- 房間出線口節點（id = `outlet-{roomId}`）
- 牆角/走廊轉彎節點（id = `corner-{n}`）
- 配電箱節點（id = `panel`）

**理由**：出線口是走線的起終點，牆角是走線沿牆路徑的轉折點，配電箱是所有迴路的起點。三者構成完整的走線拓撲。

## Risks / Trade-offs

- **RoutingGraph 手工定義繁瑣** → 僅 4 種房型，一次性工作。提供 helper 或 comment 說明 node 編號規則，方便維護。
- **房型固定不可自訂** → v0.9 非目標。4 種房型已涵蓋教學到高難度完整範圍。
- **FloorPlanRoom.id 與 Room.id 對應需人工確保** → 由關卡定義負責確保一致性，型別層面不強制（避免過度耦合）。
- **RoutingEdge.distance 精確度** → 使用幾何距離計算（基於 node 座標 × scale），確保一致性。
