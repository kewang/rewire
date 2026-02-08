## 1. GameBoard 多迴路狀態管理

- [x] 1.1 將 `selectedWire` 改為 `circuitWires: Record<CircuitId, Wire>`，依 circuitConfigs 初始化
- [x] 1.2 將 `pluggedAppliances` 改為 `circuitAppliances: Record<CircuitId, Appliance[]>`，依 circuitConfigs 初始化
- [x] 1.3 動態建立 `circuits: Circuit[]`（依 circuitConfigs + circuitWires + circuitAppliances）
- [x] 1.4 WiringState.circuits map 啟用：拖曳接線時寫入 `circuits[targetCircuitId]`，isWired 改為所有迴路都接線的衍生值
- [x] 1.5 成本計算改為加總所有迴路線材成本
- [x] 1.6 送電條件改為所有迴路都已接線 + 至少一個迴路有電器

## 2. CircuitDiagram 多迴路佈局

- [x] 2.1 抽出 `SingleCircuitSVG` 子元件，封裝現有單迴路的 NFB + 線材 + 插座繪製邏輯
- [x] 2.2 CircuitDiagram 改為接收 `circuits: Circuit[]` + `circuitStates: Record<CircuitId, CircuitState>` + `wiringState: WiringState`
- [x] 2.3 SVG viewBox 依迴路數量動態調整寬度，水平並列各迴路
- [x] 2.4 多迴路時每個迴路顯示 label 文字
- [x] 2.5 拖曳 drop zone 改為 per-circuit：偵測游標在哪個迴路範圍內，僅高亮該迴路
- [x] 2.6 拖曳預覽線段顯示在目標迴路的線材路徑上
- [x] 2.7 全域送電撥桿：獨立繪製在頂部，控制所有迴路同時送電

## 3. AppliancePanel 電器分配

- [x] 3.1 多迴路時新增迴路選擇 UI（tab 或按鈕列），顯示各迴路 label
- [x] 3.2 選中迴路後，可用電器列表依 CircuitConfig.availableAppliances 過濾
- [x] 3.3 已分配電器分組顯示（依迴路）
- [x] 3.4 單迴路時隱藏迴路選擇 UI，行為不變

## 4. StatusDisplay 多迴路摘要

- [x] 4.1 StatusDisplay 接收多迴路資料（MultiCircuitState + circuits）
- [x] 4.2 單迴路時顯示與現有完全相同
- [x] 4.3 多迴路時顯示各迴路一行摘要（label + 狀態 + 電流）

## 5. ResultPanel 失敗迴路標示

- [x] 5.1 ResultPanel 接收多迴路資料，標示發生問題的迴路
- [x] 5.2 單迴路時顯示與現有完全相同

## 6. 驗證與修復

- [x] 6.1 npm run build 通過
- [x] 6.2 L01-L05 單迴路回歸測試：外觀行為不變
