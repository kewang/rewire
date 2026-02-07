## 1. 基礎元件

- [x] 1.1 建立 `src/components/WireSelector.tsx`：顯示線材卡片、點選切換、已選標示
- [x] 1.2 建立 `src/components/AppliancePanel.tsx`：顯示電器清單、點選加入、已插入電器可點選移除
- [x] 1.3 建立 `src/components/StatusDisplay.tsx`：顯示總電流、熱度百分比、狀態文字與顏色
- [x] 1.4 建立 `src/components/ResultPanel.tsx`：失敗時顯示原因、關鍵數字、重試按鈕

## 2. 主畫面與模擬整合

- [x] 2.1 建立 `src/components/GameBoard.tsx`：持有遊戲狀態（selectedWire, appliances, simState, isPowered）
- [x] 2.2 實作 NFB 開關：送電啟動 rAF loop 呼叫 step()、斷電停止並重置
- [x] 2.3 實作 rAF 模擬迴圈：useRef 追蹤時間戳、每幀呼叫 step、終態時自動停止

## 3. 整合與樣式

- [x] 3.1 修改 `src/App.tsx` 載入 GameBoard
- [x] 3.2 建立 `src/App.css` 基本遊戲版面樣式（flexbox 排版）

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認編譯無錯誤
