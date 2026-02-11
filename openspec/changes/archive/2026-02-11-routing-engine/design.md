## Context

v0.9 平面圖模式需要走線路由引擎，讓遊戲能計算配電箱到各房間出線口的最短路徑。floor-plan-data-model 已定義 `RoutingGraph`（nodes + edges）沿牆路徑圖，4 種預設房型都有完整的 routingGraph 定義。

目前的成本計算使用固定 `DEFAULT_WIRE_LENGTH = 10m`，v0.9 要改為基於實際走線距離計算。routing-engine 是純演算法模組，不影響任何現有元件。

## Goals / Non-Goals

**Goals:**
- 實作 Dijkstra 最短路徑演算法，基於 RoutingGraph 的雙向邊
- 支援星形和串聯兩種走線策略的候選方案計算
- 計算走線總距離，供成本計算使用
- 純函式設計，無副作用，方便測試

**Non-Goals:**
- 不做走線渲染（floor-plan-renderer 負責）
- 不做走線互動/選擇 UI（floor-plan-wiring-interaction 負責）
- 不做成本模型修改（floor-plan-levels 負責 budget 校準）
- 不做段落級故障模擬（v1.0）

## Decisions

### 1. Dijkstra 實作方式：手寫 vs 第三方庫

**選擇：手寫 Dijkstra**

理由：RoutingGraph 最多 ~30 個節點（XL 房型），規模極小。Dijkstra 實作簡單（~40 行），不需要引入外部依賴。使用 Map + 簡單線性掃描替代 priority queue，對此規模無效能差異。

### 2. 串聯策略：TSP 近似 vs 貪心最近鄰居

**選擇：貪心最近鄰居（Nearest Neighbor）**

理由：TSP 最佳解對遊戲意義不大（差異在 1-2m 範圍），貪心法實作簡單且結果直覺。從配電箱出發，每次選最近的未造訪房間，最終不需回到起點（非閉合巡迴）。

替代方案考慮：
- 最小生成樹（MST）近似：實作較複雜，結果與貪心差異不大
- 暴力窮舉：房間最多 12 個但實際一條迴路最多 3-4 個房間，可行但不必要

### 3. 圖的建構：預處理 vs 即時查詢

**選擇：即時查詢（on-the-fly adjacency）**

理由：每次 Dijkstra 呼叫時從 edges 建構 adjacency list。圖很小，建構成本可忽略。避免引入額外的快取狀態。

### 4. 出線口節點識別：命名慣例

**選擇：使用 `outlet-{roomId}` 命名慣例**

理由：floorPlans.ts 已採用此慣例（如 `outlet-bedroom`、`outlet-kitchen`）。routing.ts 依循此慣例，透過 roomId 查找對應出線口節點。提供 helper 函式 `getOutletNodeId(roomId)` 和 `getPanelNodeId()` 封裝此邏輯。

### 5. 回傳型別設計

```typescript
interface RoutePath {
  /** 經過的節點 ID 序列 */
  nodeIds: string[];
  /** 總距離（公尺） */
  distance: number;
}

interface RouteCandidate {
  /** 走線策略 */
  strategy: 'direct' | 'star' | 'daisy-chain';
  /** 各房間的走線路徑 */
  paths: Map<string, RoutePath>;  // roomId → path
  /** 總距離（公尺） */
  totalDistance: number;
}

interface RouteCandidates {
  candidates: RouteCandidate[];
}
```

選擇 Map<roomId, RoutePath> 而非陣列，方便後續 renderer 按房間查找路徑。

## Risks / Trade-offs

- **[風險] RoutingGraph 不連通** → Dijkstra 無法到達目標節點。Mitigation：findShortestPath 回傳 `null` 表示不可達，上層需處理。4 種預設房型已人工驗證連通性。
- **[風險] 出線口命名慣例不一致** → 找不到節點。Mitigation：getOutletNodeId helper 集中管理，若找不到節點則拋出明確錯誤訊息。
- **[取捨] 貪心最近鄰居非最優** → 串聯路徑可能比最優長 10-20%。對遊戲而言可接受，且結果直覺（「先走最近的」符合玩家預期）。
- **[取捨] 無快取** → 相同查詢重複計算。對此規模（<30 節點）無效能影響，未來如需快取可在上層加 useMemo。
