## Why

PanelInteriorView 的 SVG 有兩個核心問題：(1) 玩家看不出每條線接到哪個匯流排（R/T/N），因為所有線都用線徑色而非相位色，且中性線回路完全沒畫，導致玩家不理解相位概念；(2) 束帶放置只需點一下就完成，沒有任何挑戰性，與壓接小遊戲的豐富互動形成落差。

## What Changes

- 走線靠近匯流排的段落改為相位色漸層（R 紅 / T 藍 / 220V 紫），到走線區再漸變回線徑色
- 匯流排 tap point 放大並加上相位標注
- 每個迴路新增 N（中性線）回路虛線，讓玩家理解「每個迴路有去有回」
- 束帶放置改為拉緊度小遊戲：進度條從鬆到緊，玩家需停在甜蜜區（太鬆鬆脫、太緊傷線皮）
- 束帶品質影響整線分數（類似壓接品質影響接觸電阻）

## Capabilities

### New Capabilities
- `cable-tie-mini-game`: 束帶拉緊度小遊戲機制（進度條甜蜜區 + 品質判定 + 分數影響）

### Modified Capabilities
- `panel-interior-view`: 走線相位色漸層、tap point 放大標注、N 回路虛線視覺

## Impact

- `src/components/PanelInteriorView.tsx` — 主要修改（相位色漸層、N 回路、tap point、束帶小遊戲 overlay）
- `src/App.css` — 新增束帶小遊戲樣式
- `src/engine/aesthetics.ts` — 可能修改（束帶品質影響評分）
- `src/data/constants.ts` — 可能新增束帶品質常數
- `src/types/game.ts` — 可能新增 CableTieQuality 型別
- 不影響 GameBoard 遊戲邏輯、不影響 simulation engine
