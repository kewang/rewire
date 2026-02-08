## Why

v0.3 的 5 線材 / 6 電器不足以支撐 v0.4 的相位平衡（FR-E）與 ELCB（FR-F）場景。需要擴充材料庫（14mm² 線材、IH 爐 / 冰箱 / 冷氣 / 浴室暖風機），同時引入 NFB 額定多樣化（15A/20A/30A）與 ELCB 成本框架，為後續 change 打好基礎。

## What Changes

- 新增 14mm² 絞線（70A, $28/米），線材總數 5 → 6
- 新增 4 種電器：IH 爐 (3000W/220V)、冰箱 (200W/110V)、冷氣 (2800W/220V)、浴室暖風機 (1650W/220V)，電器總數 6 → 10
- NFB 額定多樣化：支援 15A / 20A / 30A 三種規格，由關卡 `circuitConfigs` 中的 `breaker` 定義
- ELCB 成本框架：新增 per-circuit ELCB 開關（$35/迴路），更新成本計算公式
- 新增 L10 關卡「新電器暖身」：2 迴路（廚房 110V + IH 爐 220V），認識新電器
- WireSelector / AppliancePanel / CircuitDiagram SVG 支援新增材料的顯示

## Capabilities

### New Capabilities
- `elcb-cost`: ELCB 漏電斷路器成本框架 — per-circuit 開關、$35 定價、成本計算整合

### Modified Capabilities
- `game-data-model`: 新增 14mm² 線材、4 種電器常數；Breaker 型別支援多種額定；新增 ELCB 相關型別欄位
- `scoring-and-levels`: 新增 L10 關卡定義；成本公式加入 ELCB 項目
- `voltage-circuit`: 新電器（IH 爐/冷氣/浴室暖風機）的 220V 相容性驗證

## Impact

- `src/data/constants.ts` — 新增線材、電器常數
- `src/types/game.ts` — Breaker 型別擴充、CircuitConfig 新增 ELCB 欄位
- `src/data/levels.ts` — 新增 L10、舊關卡 breaker 欄位明確化
- `src/components/WireSelector.tsx` — 新增 14mm² 線材卡片顯示與顏色
- `src/components/AppliancePanel.tsx` — 新增 4 種電器顯示
- `src/components/CircuitDiagram.tsx` — 新線材顏色映射
- `src/components/GameBoard.tsx` — 成本計算更新（加入 ELCB）
- `src/engine/audio.ts` — 新電器運轉音效
