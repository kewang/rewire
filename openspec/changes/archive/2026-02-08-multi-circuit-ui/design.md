## Context

型別系統（multi-circuit-types）和模擬引擎（multi-circuit-engine）已完成多迴路重構。GameBoard 已使用 MultiCircuitState + stepMulti()，但透過 `toLegacyState()` bridge 將單迴路資料傳給子元件。目前所有 UI 元件仍只處理單一迴路。

現有架構關鍵點：
- `Level.circuitConfigs` 已定義每關的迴路配置（L01-L05 各有 1 個迴路）
- `WiringState` 已有 `circuits: Record<CircuitId, CircuitWiringState>` 欄位但未啟用
- `CircuitDiagram` 接收 `SimulationState` 繪製單一 SVG 電路
- `AppliancePanel` 管理全域電器清單，無迴路概念

## Goals / Non-Goals

**Goals:**
- CircuitDiagram 能並列繪製 N 個迴路（NFB + 線材 + 插座）
- 拖曳接線時可指定目標迴路
- 電器可分配到特定迴路
- StatusDisplay 顯示各迴路的狀態摘要
- ResultPanel 標示失敗迴路
- L01-L05 單迴路關卡外觀行為完全不變

**Non-Goals:**
- 不新增多迴路關卡（屬於 multi-circuit-levels）
- 不實作 110V/220V 區分（屬於 voltage-distinction）
- 不修改模擬引擎（已在 multi-circuit-engine 完成）
- 不做跨迴路的電器拖曳（本期用點擊選擇即可）

## Decisions

### D1: CircuitDiagram 佈局方式 — 水平並列

多迴路在 SVG 內水平排列，每個迴路佔固定寬度（約 200px），SVG viewBox 依迴路數動態調整。單迴路時 viewBox 與現有相同（200×280），視覺不變。

替代方案：Tab 切換各迴路 — 捨棄，因為看不到全局。

### D2: 每迴路獨立 Wire 選擇

GameBoard 從 `selectedWire: Wire` 改為 `circuitWires: Record<CircuitId, Wire>`。拖曳接線放置到目標迴路時更新該迴路的 wire。每迴路可接不同線徑。

### D3: 電器分配 UI — 拖曳到迴路圖

AppliancePanel 顯示未分配的電器清單。玩家可將電器拖曳或點擊分配到特定迴路。每個迴路的插座區域顯示已分配的電器圖示/數量。

替代方案：下拉選單選迴路 — 捨棄，不夠直覺。

考量：多迴路時電器面板需知道有哪些迴路，且需同步迴路的 availableAppliances 限制。

### D4: StatusDisplay 多迴路 — 摺疊摘要

單迴路時與現有完全相同。多迴路時顯示每個迴路一行摘要（label + 狀態 + 電流），點擊可展開詳情。最上方保留 overall 狀態。

### D5: WiringState 遷移 — 啟用 circuits map

逐步將 `isWired`/`connectedWire` 遷移到 `circuits[circuitId]`。單迴路時兩者同步，確保向後相容。多迴路時 `isWired` 改為「所有迴路都已接線」的衍生值。

### D6: NFB 撥桿 — 全域送電

多迴路時仍使用單一全域送電開關（NFB 主開關），而非每個迴路獨立。未來可考慮獨立開關，但本期不做。

替代方案：每個迴路 NFB 獨立控制 — 複雜度過高，留到後續。

## Risks / Trade-offs

- **[Risk] CircuitDiagram SVG 複雜度暴增** → 抽出 `SingleCircuitSVG` 子元件，主元件只負責排列
- **[Risk] 拖曳接線目標迴路偵測準確度** → 利用各迴路 SVG 區域的 bounding box 做 hit test
- **[Risk] 手機版多迴路佈局過窄** → 多迴路時 SVG 可橫向滾動，或等 multi-circuit-levels 再處理 RWD
- **[Trade-off] 全域送電 vs 獨立送電** → 全域送電簡化實作，但限制了玩法深度；可在後續版本擴展
