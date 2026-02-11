/** 平面圖出線口 */
export interface FloorPlanOutlet {
  /** 相對於房間的位置（0~1 比例） */
  readonly x: number;
  readonly y: number;
  /** 線路類型（v0.9 僅 power，v1.0 擴充 network） */
  readonly type: 'power' | 'network';
}

/** 平面圖房間 */
export interface FloorPlanRoom {
  /** 對應 Room.id 或 CircuitConfig 的房間識別符 */
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

/** 走線路徑圖節點（牆角 / 轉彎點 / 出線口 / 配電箱） */
export interface RoutingNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/** 走線路徑圖邊（牆段） */
export interface RoutingEdge {
  /** 起點節點 ID */
  readonly from: string;
  /** 終點節點 ID */
  readonly to: string;
  /** 實際距離（公尺），用於成本計算 */
  readonly distance: number;
}

/** 走線路徑圖 */
export interface RoutingGraph {
  readonly nodes: readonly RoutingNode[];
  /** 邊為雙向（A→B 同時表示 B→A） */
  readonly edges: readonly RoutingEdge[];
}

/** 平面圖定義 */
export interface FloorPlan {
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
