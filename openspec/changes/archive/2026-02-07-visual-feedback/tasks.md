## 1. 線路視覺化

- [x] 1.1 建立 `src/components/CircuitDiagram.tsx`：SVG 繪製 NFB → 線材 → 插座的簡化線路圖
- [x] 1.2 實作線色插值函式：wireHeat 0→1 對應 白→黃→紅→黑
- [x] 1.3 過載時加入 CSS 發光脈動動畫
- [x] 1.4 燒毀時加入 CSS 煙霧/焦黑效果

## 2. 音效

- [x] 2.1 建立 `src/engine/audio.ts`：Web Audio API 工具函式
- [x] 2.2 實作送電提示音、失敗提示音（tripped/burned）、過關提示音

## 3. 整合

- [x] 3.1 修改 GameBoard：在中央區域嵌入 CircuitDiagram，替換純文字 NFB 區塊
- [x] 3.2 修改 GameBoard：在狀態轉換時呼叫音效函式
- [x] 3.3 更新 App.css：加入動畫 keyframes

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認編譯無錯誤
