# Tasks: routing-ux-guide

## 1. Step Bar 引導列

- [x] 1.1 在 PanelInteriorView 新增 step bar 元件（3 步驟：消除交叉 / 放置束帶 / 完成整線），根據 crossings 和 unbundled 狀態自動判定 active/done
- [x] 1.2 在 App.css 新增 step bar 樣式（水平排列、active 高亮、done 打勾、pending 灰色）

## 2. SVG 視覺強化

- [x] 2.1 在 SVG 三個區域右側新增垂直區域標注文字（匯流排 / 走線區 / NFB），淡色旋轉文字
- [x] 2.2 在每條走線的走線區中段新增迴路名稱標籤（白色文字 + 半透明深色背景）

## 3. 操作提示

- [x] 3.1 新增 hasDragged state，走線區頂部顯示「← 拖曳調整順序 →」提示，拖曳完成後消失
- [x] 3.2 束帶放置點加入 SVG `<title>` 原生 tooltip（available:「點擊綁束帶」/ placed:「點擊移除束帶」/ disabled:「有交叉，無法束帶」）

## 4. 驗證

- [x] 4.1 執行 `npm run build` 確認編譯無錯誤
- [x] 4.2 執行 `npm run lint` 確認無 ESLint 錯誤
