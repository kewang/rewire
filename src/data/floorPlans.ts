import type { FloorPlan } from '../types/floorPlan';

/**
 * Helper: 計算兩節點間的歐幾里得距離（公尺）
 * 基於格子座標 × scale
 */
function dist(x1: number, y1: number, x2: number, y2: number, scale: number): number {
  return Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * scale * 10) / 10;
}

// ─── 房型 S — 套房 4×4 ────────────────────────────────────
//
// ┌────────────┬────────┐
// │            │        │
// │   臥室      │  浴室   │
// │  (0,0 2×2) │(2,0 2×2)│ 💧
// ├────────────┼────────┤
// │            │        │
// │   客廳      │  廚房   │
// │  (0,2 2×2) │(2,2 2×2)│ 💧
// │  ⚡        │        │
// └────────────┴────────┘
//
// scale = 1.5（1格=1.5m），4×4格 = 6m×6m ≈ 11坪
// 配電箱在客廳左下角（靠入口）
//
// 出線口策略：置於離配電箱最遠的牆面上
// - 臥室：左上牆 (0, 0.5)
// - 浴室：右上牆 (4, 0.5)
// - 客廳：左下牆 (0.5, 4) — 同房但遠端
// - 廚房：右下牆 (4, 3.5)

const S_SCALE = 1.5;

export const FLOOR_PLAN_S: FloorPlan = {
  width: 4,
  height: 4,
  scale: S_SCALE,
  rooms: [
    {
      id: 'bedroom',
      label: '臥室',
      x: 0, y: 0, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.25, type: 'power' }],
    },
    {
      id: 'bathroom',
      label: '浴室',
      x: 2, y: 0, width: 2, height: 2,
      wetArea: true,
      outlets: [{ x: 0.9, y: 0.25, type: 'power' }],
    },
    {
      id: 'living-room',
      label: '客廳',
      x: 0, y: 2, width: 2, height: 2,
      outlets: [{ x: 0.25, y: 0.9, type: 'power' }],
    },
    {
      id: 'kitchen',
      label: '廚房',
      x: 2, y: 2, width: 2, height: 2,
      wetArea: true,
      outlets: [{ x: 0.9, y: 0.75, type: 'power' }],
    },
  ],
  panel: { x: 0.3, y: 3.7, roomId: 'living-room' },
  routingGraph: {
    nodes: [
      // 牆角節點
      { id: 'corner-0', x: 0, y: 0 },
      { id: 'corner-1', x: 2, y: 0 },
      { id: 'corner-2', x: 4, y: 0 },
      { id: 'corner-3', x: 0, y: 2 },
      { id: 'corner-4', x: 2, y: 2 },
      { id: 'corner-5', x: 4, y: 2 },
      { id: 'corner-6', x: 0, y: 4 },
      { id: 'corner-7', x: 2, y: 4 },
      { id: 'corner-8', x: 4, y: 4 },
      // 出線口節點（牆面位置）
      { id: 'outlet-bedroom', x: 0, y: 0.5 },
      { id: 'outlet-bathroom', x: 4, y: 0.5 },
      { id: 'outlet-living-room', x: 0.5, y: 4 },
      { id: 'outlet-kitchen', x: 4, y: 3.5 },
      // 配電箱節點
      { id: 'panel', x: 0.3, y: 3.7 },
    ],
    edges: [
      // 外牆水平
      { from: 'corner-0', to: 'corner-1', distance: dist(0, 0, 2, 0, S_SCALE) },
      { from: 'corner-1', to: 'corner-2', distance: dist(2, 0, 4, 0, S_SCALE) },
      { from: 'corner-3', to: 'corner-4', distance: dist(0, 2, 2, 2, S_SCALE) },
      { from: 'corner-4', to: 'corner-5', distance: dist(2, 2, 4, 2, S_SCALE) },
      { from: 'corner-6', to: 'corner-7', distance: dist(0, 4, 2, 4, S_SCALE) },
      { from: 'corner-7', to: 'corner-8', distance: dist(2, 4, 4, 4, S_SCALE) },
      // 外牆垂直
      { from: 'corner-0', to: 'corner-3', distance: dist(0, 0, 0, 2, S_SCALE) },
      { from: 'corner-3', to: 'corner-6', distance: dist(0, 2, 0, 4, S_SCALE) },
      { from: 'corner-2', to: 'corner-5', distance: dist(4, 0, 4, 2, S_SCALE) },
      { from: 'corner-5', to: 'corner-8', distance: dist(4, 2, 4, 4, S_SCALE) },
      // 內牆
      { from: 'corner-1', to: 'corner-4', distance: dist(2, 0, 2, 2, S_SCALE) },
      { from: 'corner-4', to: 'corner-7', distance: dist(2, 2, 2, 4, S_SCALE) },
      // 出線口連接（僅連到所在牆段的兩端角落）
      { from: 'outlet-bedroom', to: 'corner-0', distance: dist(0, 0.5, 0, 0, S_SCALE) },
      { from: 'outlet-bedroom', to: 'corner-3', distance: dist(0, 0.5, 0, 2, S_SCALE) },
      { from: 'outlet-bathroom', to: 'corner-2', distance: dist(4, 0.5, 4, 0, S_SCALE) },
      { from: 'outlet-bathroom', to: 'corner-5', distance: dist(4, 0.5, 4, 2, S_SCALE) },
      { from: 'outlet-living-room', to: 'corner-6', distance: dist(0.5, 4, 0, 4, S_SCALE) },
      { from: 'outlet-living-room', to: 'corner-7', distance: dist(0.5, 4, 2, 4, S_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-5', distance: dist(4, 3.5, 4, 2, S_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-8', distance: dist(4, 3.5, 4, 4, S_SCALE) },
      // 配電箱連接到客廳牆角
      { from: 'panel', to: 'corner-6', distance: dist(0.3, 3.7, 0, 4, S_SCALE) },
      { from: 'panel', to: 'corner-3', distance: dist(0.3, 3.7, 0, 2, S_SCALE) },
    ],
  },
};


// ─── 房型 M — 兩房 6×4 ────────────────────────────────────
//
// ┌──────┬────┬──────────┐
// │      │    │          │
// │ 主臥  │ 浴室│   客廳    │
// │(0,0  │(2,0│  (3,0    │
// │ 2×2) │1×2)│   3×2)   │
// │      │ 💧 │          │
// ├──────┼────┼──────────┤
// │      │    │          │
// │ 次臥  │ 玄關│   廚房    │
// │(0,2  │(2,2│  (3,2    │
// │ 2×2) │1×2)│   3×2)   │
// │      │ ⚡ │   💧     │
// └──────┴────┴──────────┘
//
// scale = 1.5, 6×4格 = 9m×6m ≈ 16坪
// 配電箱在玄關

const M_SCALE = 1.5;

export const FLOOR_PLAN_M: FloorPlan = {
  width: 6,
  height: 4,
  scale: M_SCALE,
  rooms: [
    {
      id: 'master-bedroom',
      label: '主臥',
      x: 0, y: 0, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.5, type: 'power' }],
    },
    {
      id: 'bathroom',
      label: '浴室',
      x: 2, y: 0, width: 1, height: 2,
      wetArea: true,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'living-room',
      label: '客廳',
      x: 3, y: 0, width: 3, height: 2,
      outlets: [{ x: 0.8, y: 0.1, type: 'power' }],
    },
    {
      id: 'second-bedroom',
      label: '次臥',
      x: 0, y: 2, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.5, type: 'power' }],
    },
    {
      id: 'entrance',
      label: '玄關',
      x: 2, y: 2, width: 1, height: 2,
      outlets: [{ x: 0.5, y: 0.5, type: 'power' }],
    },
    {
      id: 'kitchen',
      label: '廚房',
      x: 3, y: 2, width: 3, height: 2,
      wetArea: true,
      outlets: [{ x: 0.8, y: 0.5, type: 'power' }],
    },
  ],
  panel: { x: 2.5, y: 3.5, roomId: 'entrance' },
  routingGraph: {
    nodes: [
      // 牆角節點
      { id: 'corner-0', x: 0, y: 0 },
      { id: 'corner-1', x: 2, y: 0 },
      { id: 'corner-2', x: 3, y: 0 },
      { id: 'corner-3', x: 6, y: 0 },
      { id: 'corner-4', x: 0, y: 2 },
      { id: 'corner-5', x: 2, y: 2 },
      { id: 'corner-6', x: 3, y: 2 },
      { id: 'corner-7', x: 6, y: 2 },
      { id: 'corner-8', x: 0, y: 4 },
      { id: 'corner-9', x: 2, y: 4 },
      { id: 'corner-10', x: 3, y: 4 },
      { id: 'corner-11', x: 6, y: 4 },
      // 出線口節點（牆面位置）
      { id: 'outlet-master-bedroom', x: 0, y: 1.0 },
      { id: 'outlet-bathroom', x: 2.5, y: 0 },
      { id: 'outlet-living-room', x: 5.4, y: 0 },
      { id: 'outlet-second-bedroom', x: 0, y: 3.0 },
      { id: 'outlet-entrance', x: 2.5, y: 3.0 },
      { id: 'outlet-kitchen', x: 5.4, y: 3.0 },
      // 配電箱節點
      { id: 'panel', x: 2.5, y: 3.5 },
    ],
    edges: [
      // 上牆水平 y=0
      { from: 'corner-0', to: 'corner-1', distance: dist(0, 0, 2, 0, M_SCALE) },
      { from: 'corner-1', to: 'corner-2', distance: dist(2, 0, 3, 0, M_SCALE) },
      { from: 'corner-2', to: 'corner-3', distance: dist(3, 0, 6, 0, M_SCALE) },
      // 中牆水平 y=2
      { from: 'corner-4', to: 'corner-5', distance: dist(0, 2, 2, 2, M_SCALE) },
      { from: 'corner-5', to: 'corner-6', distance: dist(2, 2, 3, 2, M_SCALE) },
      { from: 'corner-6', to: 'corner-7', distance: dist(3, 2, 6, 2, M_SCALE) },
      // 下牆水平 y=4
      { from: 'corner-8', to: 'corner-9', distance: dist(0, 4, 2, 4, M_SCALE) },
      { from: 'corner-9', to: 'corner-10', distance: dist(2, 4, 3, 4, M_SCALE) },
      { from: 'corner-10', to: 'corner-11', distance: dist(3, 4, 6, 4, M_SCALE) },
      // 左牆垂直 x=0
      { from: 'corner-0', to: 'corner-4', distance: dist(0, 0, 0, 2, M_SCALE) },
      { from: 'corner-4', to: 'corner-8', distance: dist(0, 2, 0, 4, M_SCALE) },
      // 內牆垂直 x=2
      { from: 'corner-1', to: 'corner-5', distance: dist(2, 0, 2, 2, M_SCALE) },
      { from: 'corner-5', to: 'corner-9', distance: dist(2, 2, 2, 4, M_SCALE) },
      // 內牆垂直 x=3
      { from: 'corner-2', to: 'corner-6', distance: dist(3, 0, 3, 2, M_SCALE) },
      { from: 'corner-6', to: 'corner-10', distance: dist(3, 2, 3, 4, M_SCALE) },
      // 右牆垂直 x=6
      { from: 'corner-3', to: 'corner-7', distance: dist(6, 0, 6, 2, M_SCALE) },
      { from: 'corner-7', to: 'corner-11', distance: dist(6, 2, 6, 4, M_SCALE) },
      // 出線口連接（僅連到所在牆段兩端）
      { from: 'outlet-master-bedroom', to: 'corner-0', distance: dist(0, 1.0, 0, 0, M_SCALE) },
      { from: 'outlet-master-bedroom', to: 'corner-4', distance: dist(0, 1.0, 0, 2, M_SCALE) },
      { from: 'outlet-bathroom', to: 'corner-1', distance: dist(2.5, 0, 2, 0, M_SCALE) },
      { from: 'outlet-bathroom', to: 'corner-2', distance: dist(2.5, 0, 3, 0, M_SCALE) },
      { from: 'outlet-living-room', to: 'corner-2', distance: dist(5.4, 0, 3, 0, M_SCALE) },
      { from: 'outlet-living-room', to: 'corner-3', distance: dist(5.4, 0, 6, 0, M_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-4', distance: dist(0, 3.0, 0, 2, M_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-8', distance: dist(0, 3.0, 0, 4, M_SCALE) },
      { from: 'outlet-entrance', to: 'corner-5', distance: dist(2.5, 3.0, 2, 2, M_SCALE) },
      { from: 'outlet-entrance', to: 'corner-9', distance: dist(2.5, 3.0, 2, 4, M_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-7', distance: dist(5.4, 3.0, 6, 2, M_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-11', distance: dist(5.4, 3.0, 6, 4, M_SCALE) },
      // 配電箱連接（玄關內，靠近下牆）
      { from: 'panel', to: 'corner-9', distance: dist(2.5, 3.5, 2, 4, M_SCALE) },
      { from: 'panel', to: 'corner-10', distance: dist(2.5, 3.5, 3, 4, M_SCALE) },
    ],
  },
};


// ─── 房型 L — 三房 8×6 ────────────────────────────────────
//
// ┌──────┬────┬──────────┬────┐
// │      │    │          │    │
// │ 主臥  │ 主浴│   客廳    │ 陽台│
// │(0,0  │(2,0│  (3,0    │(7,0│
// │ 2×2) │1×2)│  4×2)    │1×2)│
// │      │ 💧 │          │    │
// ├──────┼────┼──────────┤────┘
// │      │          │
// │ 書房  │   餐廳    │
// │(0,2  │  (2,2    │
// │ 2×2) │   5×2)   │
// ├──────┼────┬────┬──────┐
// │      │    │    │      │
// │ 次臥  │ 客浴│ 玄關│  廚房 │
// │(0,4  │(2,4│(3,4│ (4,4 │
// │ 2×2) │1×2)│1×2)│  4×2)│
// │      │ 💧 │ ⚡ │  💧  │
// └──────┴────┴────┴──────┘
//
// scale = 1.5, 8×6格 = 12m×9m ≈ 33坪
// 配電箱在玄關

const L_SCALE = 1.5;

export const FLOOR_PLAN_L: FloorPlan = {
  width: 8,
  height: 6,
  scale: L_SCALE,
  rooms: [
    {
      id: 'master-bedroom',
      label: '主臥',
      x: 0, y: 0, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.25, type: 'power' }],
    },
    {
      id: 'master-bathroom',
      label: '主浴',
      x: 2, y: 0, width: 1, height: 2,
      wetArea: true,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'living-room',
      label: '客廳',
      x: 3, y: 0, width: 4, height: 2,
      outlets: [{ x: 0.7, y: 0.1, type: 'power' }],
    },
    {
      id: 'balcony',
      label: '陽台',
      x: 7, y: 0, width: 1, height: 2,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'study',
      label: '書房',
      x: 0, y: 2, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.5, type: 'power' }],
    },
    {
      id: 'dining-room',
      label: '餐廳',
      x: 2, y: 2, width: 5, height: 2,
      outlets: [{ x: 0.7, y: 0.5, type: 'power' }],
    },
    {
      id: 'second-bedroom',
      label: '次臥',
      x: 0, y: 4, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.9, type: 'power' }],
    },
    {
      id: 'guest-bathroom',
      label: '客浴',
      x: 2, y: 4, width: 1, height: 2,
      wetArea: true,
      outlets: [{ x: 0.5, y: 0.9, type: 'power' }],
    },
    {
      id: 'entrance',
      label: '玄關',
      x: 3, y: 4, width: 1, height: 2,
      outlets: [{ x: 0.5, y: 0.5, type: 'power' }],
    },
    {
      id: 'kitchen',
      label: '廚房',
      x: 4, y: 4, width: 4, height: 2,
      wetArea: true,
      outlets: [{ x: 0.7, y: 0.9, type: 'power' }],
    },
  ],
  panel: { x: 3.5, y: 5.7, roomId: 'entrance' },
  routingGraph: {
    nodes: [
      // 上排 y=0
      { id: 'corner-0', x: 0, y: 0 },
      { id: 'corner-1', x: 2, y: 0 },
      { id: 'corner-2', x: 3, y: 0 },
      { id: 'corner-3', x: 7, y: 0 },
      { id: 'corner-4', x: 8, y: 0 },
      // 中上排 y=2
      { id: 'corner-5', x: 0, y: 2 },
      { id: 'corner-6', x: 2, y: 2 },
      { id: 'corner-7', x: 3, y: 2 },
      { id: 'corner-8', x: 7, y: 2 },
      { id: 'corner-9', x: 8, y: 2 },
      // 中下排 y=4
      { id: 'corner-10', x: 0, y: 4 },
      { id: 'corner-11', x: 2, y: 4 },
      { id: 'corner-12', x: 3, y: 4 },
      { id: 'corner-13', x: 4, y: 4 },
      { id: 'corner-14', x: 7, y: 4 },
      { id: 'corner-15', x: 8, y: 4 },
      // 下排 y=6
      { id: 'corner-16', x: 0, y: 6 },
      { id: 'corner-17', x: 2, y: 6 },
      { id: 'corner-18', x: 3, y: 6 },
      { id: 'corner-19', x: 4, y: 6 },
      { id: 'corner-20', x: 8, y: 6 },
      // 出線口節點（牆面位置）
      { id: 'outlet-master-bedroom', x: 0, y: 0.5 },
      { id: 'outlet-master-bathroom', x: 2.5, y: 0 },
      { id: 'outlet-living-room', x: 5.8, y: 0 },
      { id: 'outlet-balcony', x: 7.5, y: 0 },
      { id: 'outlet-study', x: 0, y: 3.0 },
      { id: 'outlet-dining-room', x: 5.5, y: 2 },
      { id: 'outlet-second-bedroom', x: 0, y: 5.8 },
      { id: 'outlet-guest-bathroom', x: 2.5, y: 6 },
      { id: 'outlet-entrance', x: 3.5, y: 5.0 },
      { id: 'outlet-kitchen', x: 6.8, y: 6 },
      // 配電箱節點
      { id: 'panel', x: 3.5, y: 5.7 },
    ],
    edges: [
      // 上牆水平 y=0
      { from: 'corner-0', to: 'corner-1', distance: dist(0, 0, 2, 0, L_SCALE) },
      { from: 'corner-1', to: 'corner-2', distance: dist(2, 0, 3, 0, L_SCALE) },
      { from: 'corner-2', to: 'corner-3', distance: dist(3, 0, 7, 0, L_SCALE) },
      { from: 'corner-3', to: 'corner-4', distance: dist(7, 0, 8, 0, L_SCALE) },
      // 中上牆水平 y=2
      { from: 'corner-5', to: 'corner-6', distance: dist(0, 2, 2, 2, L_SCALE) },
      { from: 'corner-6', to: 'corner-7', distance: dist(2, 2, 3, 2, L_SCALE) },
      { from: 'corner-7', to: 'corner-8', distance: dist(3, 2, 7, 2, L_SCALE) },
      { from: 'corner-8', to: 'corner-9', distance: dist(7, 2, 8, 2, L_SCALE) },
      // 中下牆水平 y=4
      { from: 'corner-10', to: 'corner-11', distance: dist(0, 4, 2, 4, L_SCALE) },
      { from: 'corner-11', to: 'corner-12', distance: dist(2, 4, 3, 4, L_SCALE) },
      { from: 'corner-12', to: 'corner-13', distance: dist(3, 4, 4, 4, L_SCALE) },
      { from: 'corner-13', to: 'corner-14', distance: dist(4, 4, 7, 4, L_SCALE) },
      { from: 'corner-14', to: 'corner-15', distance: dist(7, 4, 8, 4, L_SCALE) },
      // 下牆水平 y=6
      { from: 'corner-16', to: 'corner-17', distance: dist(0, 6, 2, 6, L_SCALE) },
      { from: 'corner-17', to: 'corner-18', distance: dist(2, 6, 3, 6, L_SCALE) },
      { from: 'corner-18', to: 'corner-19', distance: dist(3, 6, 4, 6, L_SCALE) },
      { from: 'corner-19', to: 'corner-20', distance: dist(4, 6, 8, 6, L_SCALE) },
      // 左牆垂直 x=0
      { from: 'corner-0', to: 'corner-5', distance: dist(0, 0, 0, 2, L_SCALE) },
      { from: 'corner-5', to: 'corner-10', distance: dist(0, 2, 0, 4, L_SCALE) },
      { from: 'corner-10', to: 'corner-16', distance: dist(0, 4, 0, 6, L_SCALE) },
      // 內牆垂直 x=2
      { from: 'corner-1', to: 'corner-6', distance: dist(2, 0, 2, 2, L_SCALE) },
      { from: 'corner-6', to: 'corner-11', distance: dist(2, 2, 2, 4, L_SCALE) },
      { from: 'corner-11', to: 'corner-17', distance: dist(2, 4, 2, 6, L_SCALE) },
      // 內牆垂直 x=3
      { from: 'corner-2', to: 'corner-7', distance: dist(3, 0, 3, 2, L_SCALE) },
      { from: 'corner-7', to: 'corner-12', distance: dist(3, 2, 3, 4, L_SCALE) },
      { from: 'corner-12', to: 'corner-18', distance: dist(3, 4, 3, 6, L_SCALE) },
      // 內牆垂直 x=4（玄關-廚房分隔）
      { from: 'corner-13', to: 'corner-19', distance: dist(4, 4, 4, 6, L_SCALE) },
      // 內牆垂直 x=7（客廳-陽台）
      { from: 'corner-3', to: 'corner-8', distance: dist(7, 0, 7, 2, L_SCALE) },
      { from: 'corner-8', to: 'corner-14', distance: dist(7, 2, 7, 4, L_SCALE) },
      // 右牆垂直 x=8
      { from: 'corner-4', to: 'corner-9', distance: dist(8, 0, 8, 2, L_SCALE) },
      { from: 'corner-9', to: 'corner-15', distance: dist(8, 2, 8, 4, L_SCALE) },
      { from: 'corner-15', to: 'corner-20', distance: dist(8, 4, 8, 6, L_SCALE) },
      // 出線口連接
      { from: 'outlet-master-bedroom', to: 'corner-0', distance: dist(0, 0.5, 0, 0, L_SCALE) },
      { from: 'outlet-master-bedroom', to: 'corner-5', distance: dist(0, 0.5, 0, 2, L_SCALE) },
      { from: 'outlet-master-bathroom', to: 'corner-1', distance: dist(2.5, 0, 2, 0, L_SCALE) },
      { from: 'outlet-master-bathroom', to: 'corner-2', distance: dist(2.5, 0, 3, 0, L_SCALE) },
      { from: 'outlet-living-room', to: 'corner-2', distance: dist(5.8, 0, 3, 0, L_SCALE) },
      { from: 'outlet-living-room', to: 'corner-3', distance: dist(5.8, 0, 7, 0, L_SCALE) },
      { from: 'outlet-balcony', to: 'corner-3', distance: dist(7.5, 0, 7, 0, L_SCALE) },
      { from: 'outlet-balcony', to: 'corner-4', distance: dist(7.5, 0, 8, 0, L_SCALE) },
      { from: 'outlet-study', to: 'corner-5', distance: dist(0, 3.0, 0, 2, L_SCALE) },
      { from: 'outlet-study', to: 'corner-10', distance: dist(0, 3.0, 0, 4, L_SCALE) },
      { from: 'outlet-dining-room', to: 'corner-7', distance: dist(5.5, 2, 3, 2, L_SCALE) },
      { from: 'outlet-dining-room', to: 'corner-8', distance: dist(5.5, 2, 7, 2, L_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-10', distance: dist(0, 5.8, 0, 4, L_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-16', distance: dist(0, 5.8, 0, 6, L_SCALE) },
      { from: 'outlet-guest-bathroom', to: 'corner-17', distance: dist(2.5, 6, 2, 6, L_SCALE) },
      { from: 'outlet-guest-bathroom', to: 'corner-18', distance: dist(2.5, 6, 3, 6, L_SCALE) },
      { from: 'outlet-entrance', to: 'corner-12', distance: dist(3.5, 5.0, 3, 4, L_SCALE) },
      { from: 'outlet-entrance', to: 'corner-13', distance: dist(3.5, 5.0, 4, 4, L_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-19', distance: dist(6.8, 6, 4, 6, L_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-20', distance: dist(6.8, 6, 8, 6, L_SCALE) },
      // 配電箱連接（玄關內，靠近底牆）
      { from: 'panel', to: 'corner-18', distance: dist(3.5, 5.7, 3, 6, L_SCALE) },
      { from: 'panel', to: 'corner-19', distance: dist(3.5, 5.7, 4, 6, L_SCALE) },
    ],
  },
};


// ─── 房型 XL — 豪宅 10×6 ───────────────────────────────────
//
// ┌──────┬──────┬────┬──────────┬────┐
// │      │      │    │          │    │
// │ 主臥  │ 更衣室│ 主浴│   客廳    │ 陽台│
// │(0,0  │(2,0  │(4,0│  (5,0    │(9,0│
// │ 2×2) │ 2×2) │1×2)│  4×2)    │1×2)│
// │      │      │ 💧 │          │    │
// ├──────┴──────┼────┼──────────┤────┘
// │             │          │
// │    書房      │   餐廳    │
// │   (0,2      │  (4,2    │
// │    4×2)     │   5×2)   │
// ├──────┬──────┼────┬────┬──────┐
// │      │      │    │    │      │
// │ 次臥  │ 小孩房│ 客浴│ 玄關│  廚房 │
// │(0,4  │(2,4  │(4,4│(5,4│ (6,4 │
// │ 2×2) │ 2×2) │1×2)│1×2)│  4×2)│
// │      │      │ 💧 │ ⚡ │  💧  │
// └──────┴──────┴────┴────┴──────┘
//
// scale = 1.5, 10×6格 = 15m×9m ≈ 41坪
// 配電箱在玄關

const XL_SCALE = 1.5;

export const FLOOR_PLAN_XL: FloorPlan = {
  width: 10,
  height: 6,
  scale: XL_SCALE,
  rooms: [
    {
      id: 'master-bedroom',
      label: '主臥',
      x: 0, y: 0, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.25, type: 'power' }],
    },
    {
      id: 'walk-in-closet',
      label: '更衣室',
      x: 2, y: 0, width: 2, height: 2,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'master-bathroom',
      label: '主浴',
      x: 4, y: 0, width: 1, height: 2,
      wetArea: true,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'living-room',
      label: '客廳',
      x: 5, y: 0, width: 4, height: 2,
      outlets: [{ x: 0.7, y: 0.1, type: 'power' }],
    },
    {
      id: 'balcony',
      label: '陽台',
      x: 9, y: 0, width: 1, height: 2,
      outlets: [{ x: 0.5, y: 0.1, type: 'power' }],
    },
    {
      id: 'study',
      label: '書房',
      x: 0, y: 2, width: 4, height: 2,
      outlets: [{ x: 0.1, y: 0.5, type: 'power' }],
    },
    {
      id: 'dining-room',
      label: '餐廳',
      x: 4, y: 2, width: 5, height: 2,
      outlets: [{ x: 0.7, y: 0.1, type: 'power' }],
    },
    {
      id: 'second-bedroom',
      label: '次臥',
      x: 0, y: 4, width: 2, height: 2,
      outlets: [{ x: 0.1, y: 0.9, type: 'power' }],
    },
    {
      id: 'kids-room',
      label: '小孩房',
      x: 2, y: 4, width: 2, height: 2,
      outlets: [{ x: 0.5, y: 0.9, type: 'power' }],
    },
    {
      id: 'guest-bathroom',
      label: '客浴',
      x: 4, y: 4, width: 1, height: 2,
      wetArea: true,
      outlets: [{ x: 0.5, y: 0.9, type: 'power' }],
    },
    {
      id: 'entrance',
      label: '玄關',
      x: 5, y: 4, width: 1, height: 2,
      outlets: [{ x: 0.5, y: 0.5, type: 'power' }],
    },
    {
      id: 'kitchen',
      label: '廚房',
      x: 6, y: 4, width: 4, height: 2,
      wetArea: true,
      outlets: [{ x: 0.7, y: 0.9, type: 'power' }],
    },
  ],
  panel: { x: 5.5, y: 5.7, roomId: 'entrance' },
  routingGraph: {
    nodes: [
      // 上排 y=0
      { id: 'corner-0', x: 0, y: 0 },
      { id: 'corner-1', x: 2, y: 0 },
      { id: 'corner-2', x: 4, y: 0 },
      { id: 'corner-3', x: 5, y: 0 },
      { id: 'corner-4', x: 9, y: 0 },
      { id: 'corner-5', x: 10, y: 0 },
      // 中上排 y=2
      { id: 'corner-6', x: 0, y: 2 },
      { id: 'corner-7', x: 2, y: 2 },
      { id: 'corner-8', x: 4, y: 2 },
      { id: 'corner-9', x: 5, y: 2 },
      { id: 'corner-10', x: 9, y: 2 },
      { id: 'corner-11', x: 10, y: 2 },
      // 中下排 y=4
      { id: 'corner-12', x: 0, y: 4 },
      { id: 'corner-13', x: 2, y: 4 },
      { id: 'corner-14', x: 4, y: 4 },
      { id: 'corner-15', x: 5, y: 4 },
      { id: 'corner-16', x: 6, y: 4 },
      { id: 'corner-17', x: 9, y: 4 },
      { id: 'corner-18', x: 10, y: 4 },
      // 下排 y=6
      { id: 'corner-19', x: 0, y: 6 },
      { id: 'corner-20', x: 2, y: 6 },
      { id: 'corner-21', x: 4, y: 6 },
      { id: 'corner-22', x: 5, y: 6 },
      { id: 'corner-23', x: 6, y: 6 },
      { id: 'corner-24', x: 10, y: 6 },
      // 出線口節點（牆面位置）
      { id: 'outlet-master-bedroom', x: 0, y: 0.5 },
      { id: 'outlet-walk-in-closet', x: 3.0, y: 0 },
      { id: 'outlet-master-bathroom', x: 4.5, y: 0 },
      { id: 'outlet-living-room', x: 7.8, y: 0 },
      { id: 'outlet-balcony', x: 9.5, y: 0 },
      { id: 'outlet-study', x: 0, y: 3.0 },
      { id: 'outlet-dining-room', x: 7.5, y: 2 },
      { id: 'outlet-second-bedroom', x: 0, y: 5.8 },
      { id: 'outlet-kids-room', x: 3.0, y: 6 },
      { id: 'outlet-guest-bathroom', x: 4.5, y: 6 },
      { id: 'outlet-entrance', x: 5.5, y: 5.0 },
      { id: 'outlet-kitchen', x: 8.8, y: 6 },
      // 配電箱節點
      { id: 'panel', x: 5.5, y: 5.7 },
    ],
    edges: [
      // 上牆水平 y=0
      { from: 'corner-0', to: 'corner-1', distance: dist(0, 0, 2, 0, XL_SCALE) },
      { from: 'corner-1', to: 'corner-2', distance: dist(2, 0, 4, 0, XL_SCALE) },
      { from: 'corner-2', to: 'corner-3', distance: dist(4, 0, 5, 0, XL_SCALE) },
      { from: 'corner-3', to: 'corner-4', distance: dist(5, 0, 9, 0, XL_SCALE) },
      { from: 'corner-4', to: 'corner-5', distance: dist(9, 0, 10, 0, XL_SCALE) },
      // 中上牆水平 y=2
      { from: 'corner-6', to: 'corner-7', distance: dist(0, 2, 2, 2, XL_SCALE) },
      { from: 'corner-7', to: 'corner-8', distance: dist(2, 2, 4, 2, XL_SCALE) },
      { from: 'corner-8', to: 'corner-9', distance: dist(4, 2, 5, 2, XL_SCALE) },
      { from: 'corner-9', to: 'corner-10', distance: dist(5, 2, 9, 2, XL_SCALE) },
      { from: 'corner-10', to: 'corner-11', distance: dist(9, 2, 10, 2, XL_SCALE) },
      // 中下牆水平 y=4
      { from: 'corner-12', to: 'corner-13', distance: dist(0, 4, 2, 4, XL_SCALE) },
      { from: 'corner-13', to: 'corner-14', distance: dist(2, 4, 4, 4, XL_SCALE) },
      { from: 'corner-14', to: 'corner-15', distance: dist(4, 4, 5, 4, XL_SCALE) },
      { from: 'corner-15', to: 'corner-16', distance: dist(5, 4, 6, 4, XL_SCALE) },
      { from: 'corner-16', to: 'corner-17', distance: dist(6, 4, 9, 4, XL_SCALE) },
      { from: 'corner-17', to: 'corner-18', distance: dist(9, 4, 10, 4, XL_SCALE) },
      // 下牆水平 y=6
      { from: 'corner-19', to: 'corner-20', distance: dist(0, 6, 2, 6, XL_SCALE) },
      { from: 'corner-20', to: 'corner-21', distance: dist(2, 6, 4, 6, XL_SCALE) },
      { from: 'corner-21', to: 'corner-22', distance: dist(4, 6, 5, 6, XL_SCALE) },
      { from: 'corner-22', to: 'corner-23', distance: dist(5, 6, 6, 6, XL_SCALE) },
      { from: 'corner-23', to: 'corner-24', distance: dist(6, 6, 10, 6, XL_SCALE) },
      // 左牆垂直 x=0
      { from: 'corner-0', to: 'corner-6', distance: dist(0, 0, 0, 2, XL_SCALE) },
      { from: 'corner-6', to: 'corner-12', distance: dist(0, 2, 0, 4, XL_SCALE) },
      { from: 'corner-12', to: 'corner-19', distance: dist(0, 4, 0, 6, XL_SCALE) },
      // 內牆垂直 x=2
      { from: 'corner-1', to: 'corner-7', distance: dist(2, 0, 2, 2, XL_SCALE) },
      { from: 'corner-7', to: 'corner-13', distance: dist(2, 2, 2, 4, XL_SCALE) },
      { from: 'corner-13', to: 'corner-20', distance: dist(2, 4, 2, 6, XL_SCALE) },
      // 內牆垂直 x=4
      { from: 'corner-2', to: 'corner-8', distance: dist(4, 0, 4, 2, XL_SCALE) },
      { from: 'corner-8', to: 'corner-14', distance: dist(4, 2, 4, 4, XL_SCALE) },
      { from: 'corner-14', to: 'corner-21', distance: dist(4, 4, 4, 6, XL_SCALE) },
      // 內牆垂直 x=5
      { from: 'corner-3', to: 'corner-9', distance: dist(5, 0, 5, 2, XL_SCALE) },
      { from: 'corner-9', to: 'corner-15', distance: dist(5, 2, 5, 4, XL_SCALE) },
      { from: 'corner-15', to: 'corner-22', distance: dist(5, 4, 5, 6, XL_SCALE) },
      // 內牆垂直 x=6
      { from: 'corner-16', to: 'corner-23', distance: dist(6, 4, 6, 6, XL_SCALE) },
      // 內牆垂直 x=9
      { from: 'corner-4', to: 'corner-10', distance: dist(9, 0, 9, 2, XL_SCALE) },
      { from: 'corner-10', to: 'corner-17', distance: dist(9, 2, 9, 4, XL_SCALE) },
      // 右牆垂直 x=10
      { from: 'corner-5', to: 'corner-11', distance: dist(10, 0, 10, 2, XL_SCALE) },
      { from: 'corner-11', to: 'corner-18', distance: dist(10, 2, 10, 4, XL_SCALE) },
      { from: 'corner-18', to: 'corner-24', distance: dist(10, 4, 10, 6, XL_SCALE) },
      // 出線口連接（僅連到所在牆段兩端）
      { from: 'outlet-master-bedroom', to: 'corner-0', distance: dist(0, 0.5, 0, 0, XL_SCALE) },
      { from: 'outlet-master-bedroom', to: 'corner-6', distance: dist(0, 0.5, 0, 2, XL_SCALE) },
      { from: 'outlet-walk-in-closet', to: 'corner-1', distance: dist(3.0, 0, 2, 0, XL_SCALE) },
      { from: 'outlet-walk-in-closet', to: 'corner-2', distance: dist(3.0, 0, 4, 0, XL_SCALE) },
      { from: 'outlet-master-bathroom', to: 'corner-2', distance: dist(4.5, 0, 4, 0, XL_SCALE) },
      { from: 'outlet-master-bathroom', to: 'corner-3', distance: dist(4.5, 0, 5, 0, XL_SCALE) },
      { from: 'outlet-living-room', to: 'corner-3', distance: dist(7.8, 0, 5, 0, XL_SCALE) },
      { from: 'outlet-living-room', to: 'corner-4', distance: dist(7.8, 0, 9, 0, XL_SCALE) },
      { from: 'outlet-balcony', to: 'corner-4', distance: dist(9.5, 0, 9, 0, XL_SCALE) },
      { from: 'outlet-balcony', to: 'corner-5', distance: dist(9.5, 0, 10, 0, XL_SCALE) },
      { from: 'outlet-study', to: 'corner-6', distance: dist(0, 3.0, 0, 2, XL_SCALE) },
      { from: 'outlet-study', to: 'corner-12', distance: dist(0, 3.0, 0, 4, XL_SCALE) },
      { from: 'outlet-dining-room', to: 'corner-9', distance: dist(7.5, 2, 5, 2, XL_SCALE) },
      { from: 'outlet-dining-room', to: 'corner-10', distance: dist(7.5, 2, 9, 2, XL_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-12', distance: dist(0, 5.8, 0, 4, XL_SCALE) },
      { from: 'outlet-second-bedroom', to: 'corner-19', distance: dist(0, 5.8, 0, 6, XL_SCALE) },
      { from: 'outlet-kids-room', to: 'corner-20', distance: dist(3.0, 6, 2, 6, XL_SCALE) },
      { from: 'outlet-kids-room', to: 'corner-21', distance: dist(3.0, 6, 4, 6, XL_SCALE) },
      { from: 'outlet-guest-bathroom', to: 'corner-21', distance: dist(4.5, 6, 4, 6, XL_SCALE) },
      { from: 'outlet-guest-bathroom', to: 'corner-22', distance: dist(4.5, 6, 5, 6, XL_SCALE) },
      { from: 'outlet-entrance', to: 'corner-15', distance: dist(5.5, 5.0, 5, 4, XL_SCALE) },
      { from: 'outlet-entrance', to: 'corner-16', distance: dist(5.5, 5.0, 6, 4, XL_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-23', distance: dist(8.8, 6, 6, 6, XL_SCALE) },
      { from: 'outlet-kitchen', to: 'corner-24', distance: dist(8.8, 6, 10, 6, XL_SCALE) },
      // 配電箱連接（玄關底部）
      { from: 'panel', to: 'corner-22', distance: dist(5.5, 5.7, 5, 6, XL_SCALE) },
      { from: 'panel', to: 'corner-23', distance: dist(5.5, 5.7, 6, 6, XL_SCALE) },
    ],
  },
};
