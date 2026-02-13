## 1. FloorPlanView SVG 文字放大

- [x] 1.1 在 FloorPlanView.tsx 中新增常數 BADGE_FONT_SIZE=12，替換電器 badge 的 inline fontSize；房間名稱由 CSS .fp-room-label 14px 控制
- [x] 1.2 將距離標籤 fontSize 從 10 調整為 11

## 2. WireToolbar 文字放大

- [x] 2.1 在 WireToolbar.css 中調整 .wire-toolbar__gauge 從 0.8rem → 0.875rem
- [x] 2.2 在 WireToolbar.css 中調整 .wire-toolbar__spec 和 .wire-toolbar__cost 從 0.72rem → 0.8rem
- [x] 2.3 調整送電按鈕 .wire-toolbar__power 的 padding 和 min-height（min-height: 40px, padding: sm lg）

## 3. 按鈕與共用元素放大

- [x] 3.1 在 ResultPanel.css 調整 .back-button padding（10px 20px）和 font-size（0.875rem）+ min-height 40px
- [x] 3.2 在 App.css 調整 .card-detail font-size 從 0.82rem → 0.875rem
- [x] 3.3 在 StatusDisplay.css 調整 .status-label font-size 從 0.82rem → 0.875rem

## 4. 手機版排版優化

- [x] 4.1 在 App.css 的 mobile breakpoint (≤640px) 優化 .header-top 排版（gap xs + flex-wrap + level-goal 0.75rem + back-button 縮小版）
- [x] 4.2 確認 CircuitPlannerSidebar 的 mobile auto-collapse 邏輯正常運作（useFloorPlanInteraction 中 useState(() => window.innerWidth <= 640)）
- [x] 4.3 確認 sidebar 展開時為 overlay 模式（fixed + backdrop），不擠壓平面圖空間

## 5. 全域字體放大

- [x] 5.1 在 index.css 設定 html { font-size: 18px }，所有 rem 值自動放大 12.5%
- [x] 5.2 FloorPlanView SVG 二次放大（room-label 20px, badge 16px, distance 14px, emoji/icon 18px）

## 6. 房間名稱一致性

- [x] 6.1 在 FloorPlanView.css 限制 .status-display max-height: 30vh（避免多迴路狀態擠壓平面圖空間）
- [x] 6.2 移除 .fp-center .floor-plan-view 的 max-height: 100%（讓 SVG 以 1:1 渲染，fp-center 自然捲動）
- [x] 6.3 將 .fp-room-label font-size 從 20px 調整為 18px（渲染高度 23px，與 status-display 一致）
- [x] 6.4 驗證 S/M/L/XL 所有房型房間名稱渲染高度均為 23px

## 7. 驗證

- [x] 7.1 執行 npm run lint 確認零 error/warning
- [x] 7.2 執行 npm run build 確認建置成功
- [x] 7.3 執行 npm run test 確認測試通過
