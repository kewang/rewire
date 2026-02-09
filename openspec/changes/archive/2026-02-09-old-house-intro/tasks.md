## 1. 型別與常數

- [x] 1.1 在 `src/types/game.ts` 新增 `OldHouseProblemType`、`OldHouseProblem`、`PreWiredCircuit`、`OldHouseConfig` 型別
- [x] 1.2 在 `src/types/game.ts` 的 `Level` 型別新增可選欄位 `oldHouse?: OldHouseConfig`
- [x] 1.3 在 `src/data/constants.ts` 新增 `OXIDIZED_CONTACT_RESISTANCE = 2.0` 常數

## 2. 關卡資料

- [x] 2.1 在 `src/data/levels.ts` 新增 L18 老屋驚魂：初診（c1 bare-wire, c2 正常）
- [x] 2.2 在 `src/data/levels.ts` 新增 L19 老屋驚魂：全面檢修（c1 wrong-wire-gauge, c2 bare-wire, c3 正常）
- [x] 2.3 在 `src/data/levels.ts` 新增 L20 老屋驚魂：危機四伏（c1 oxidized-splice, c2 bare-wire, c3 wrong-wire-gauge + wetArea + manual phase + random leakage）

## 3. GameBoard 老屋模式

- [x] 3.1 修改 `handleSelectLevel`：偵測 oldHouse 時初始化預接線（circuitWires, circuitCrimps, circuitAppliances, wiring.circuits isWired）
- [x] 3.2 新增 `problemCircuits` state（Set<CircuitId>），追蹤問題迴路
- [x] 3.3 新增 `preWiredCircuitIds` ref（Set<CircuitId>），追蹤保留原線的迴路
- [x] 3.4 新增 `handleUnwire` callback：拆線操作（confirm → 清除該迴路 wire/crimp/wiring + 從 preWiredCircuitIds 移除）
- [x] 3.5 修改問題修復判定：迴路完成重新接線+壓接後從 problemCircuits 移除
- [x] 3.6 修改 canPowerOn 條件：老屋模式需 problemCircuits 為空
- [x] 3.7 修改 totalCost 計算：跳過 preWiredCircuitIds 中的迴路
- [x] 3.8 將 handleUnwire + problemCircuits + oldHouse 相關 props 傳入 CircuitDiagram

## 4. CircuitDiagram 視覺

- [x] 4.1 問題迴路顯示閃爍橘色邊框 + ⚠️ 圖示（接收 problemCircuits prop）
- [x] 4.2 oxidized-splice 問題迴路線材顯示暗褐色
- [x] 4.3 已接線且非送電中的老屋迴路顯示「拆線」按鈕（SVG 內）
- [x] 4.4 修復完成後移除閃爍 + ⚠️ + 恢復正常線色

## 5. 樣式

- [x] 5.1 在 `src/App.css` 新增老屋相關樣式：閃爍動畫（@keyframes）、問題邊框、⚠️ 圖示、氧化線色、拆線按鈕
