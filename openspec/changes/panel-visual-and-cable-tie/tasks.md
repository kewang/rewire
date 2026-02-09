# Tasks: panel-visual-and-cable-tie

## 1. 型別與常數

- [x] 1.1 在 `src/types/game.ts` 新增 `CableTieQuality = 'tight' | 'good' | 'loose' | 'over-tight'` 型別
- [x] 1.2 在 `src/data/constants.ts` 新增 `CABLE_TIE_GOOD_PENALTY = 2`、`CABLE_TIE_POOR_PENALTY = 5`、`CABLE_TIE_BAR_SPEED = 1.0` 常數

## 2. SVG 相位色漸層

- [x] 2.1 在 PanelInteriorView SVG defs 新增相位色漸層定義（R 紅→線徑色、T 藍→線徑色、220V 紫→線徑色），每條走線動態產生對應 gradient ID
- [x] 2.2 修改 wirePaths 建構邏輯，將走線路徑拆為上段（相位色）、中段（漸層）、下段（線徑色）三段 path

## 3. 匯流排 tap point 強化

- [x] 3.1 修改 tap point 渲染：r=3→r=5、填充改為相位色（R 紅/T 藍/N 灰）、旁邊加小文字相位標籤
- [x] 3.2 220V 迴路的 R 和 T tap point 之間新增短虛線連接

## 4. 中性線回路

- [x] 4.1 在 NFB 區下方為每個 110V 迴路新增灰色虛線 N 回路路徑（NFB→N 匯流排），220V 迴路不繪製
- [x] 4.2 N 匯流排 tap point 放大至 r=4 並改為灰色填充

## 5. 束帶小遊戲

- [x] 5.1 修改 cableTies 型別：GameBoard 中 `Set<number>` → `Map<number, CableTieQuality>`，同步修改 PanelInteriorView props
- [x] 5.2 在 PanelInteriorView 新增 inline 束帶拉緊度小遊戲元件（進度條 + 甜蜜區 + 品質判定），點擊放置點時啟動
- [x] 5.3 新增小遊戲 CSS 樣式（進度條、甜蜜區高亮、品質結果文字）
- [x] 5.4 實作 0.8 秒自動關閉 + 結果回傳 CableTieQuality 到 cableTies Map

## 6. 評分整合

- [x] 6.1 修改 `src/engine/aesthetics.ts` 的 `calcAestheticsScore`：接收 `Map<number, CableTieQuality>` 參數，依品質扣分
- [x] 6.2 同步修改 GameBoard 中呼叫 calcAestheticsScore 的地方，傳入新參數格式

## 7. 驗證

- [x] 7.1 執行 `npm run build` 確認編譯無錯誤
- [x] 7.2 執行 `npm run lint` 確認無 ESLint 錯誤
