## 1. Simulation Engine — stepMulti 主開關邏輯

- [x] 1.1 擴充 stepMulti 函式簽名，新增 `mainBreakerRating?: number` 參數（置於 phases 之後、config 之前）
- [x] 1.2 在 stepMulti 中計算 totalPanelCurrent（Σ 非終態迴路的 totalCurrent）
- [x] 1.3 實作 mainBreakerTripTimer 累積邏輯：超過 rating×1.25 累積 dt，低於則重置為 0
- [x] 1.4 mainBreakerTripTimer >= 1.5 時設定 overallStatus = 'main-tripped'
- [x] 1.5 將 'main-tripped' 加入 stepMulti 開頭的終態早期返回檢查

## 2. GameBoard 整合

- [x] 2.1 GameBoard rAF loop 中判斷 currentLevel 是否為 FreeCircuitLevel（有 panel 屬性）
- [x] 2.2 從 FreeCircuitLevel.panel.mainBreakerRating 取值，傳入 stepMulti 呼叫
- [x] 2.3 將 totalPanelCurrent 和 mainBreakerRating 傳給 StatusDisplay

## 3. StatusDisplay 主開關負載指示器

- [x] 3.1 StatusDisplay 接收 mainBreakerRating 和 totalPanelCurrent props
- [x] 3.2 顯示「主開關：{current}A / {rating}A」格式的負載指示
- [x] 3.3 負載比 ≥80% 橘色、≥100% 紅色的色彩邏輯
- [x] 3.4 無 mainBreakerRating 時不渲染指示器

## 4. ResultPanel main-tripped 支援

- [x] 4.1 ResultPanel 辨識 'main-tripped' 狀態並顯示失敗結果
- [x] 4.2 新增主開關跳脫失敗文案（「主開關跳脫！配電箱總容量不足。」）

## 5. CSS 樣式

- [x] 5.1 主開關負載指示器樣式（正常/警告/危險色彩）
