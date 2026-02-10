## 1. 基礎架構

- [x] 1.1 安裝 react-i18next、i18next 依賴
- [x] 1.2 建立 `src/i18n.ts` 初始化設定（語言偵測、localStorage 持久化、fallback）
- [x] 1.3 在 `src/main.tsx` 加入 `import './i18n'`
- [x] 1.4 建立 `src/locales/zh-TW.json` 翻譯檔骨架
- [x] 1.5 建立 `src/locales/en.json` 翻譯檔骨架

## 2. 翻譯輔助函式

- [x] 2.1 建立 `src/i18nHelpers.ts`，實作 tApplianceName / tRoomName / tStatus / tCrimpQuality / tTieQuality / tLevelName / tLevelDesc / tBonusLabel / tTerminalName

## 3. 語言切換器

- [x] 3.1 建立 `src/components/LanguageSwitcher.tsx`（EN/中 切換按鈕）
- [x] 3.2 在 LevelSelect 標題旁嵌入 LanguageSwitcher
- [x] 3.3 新增 `.level-select-header` flexbox 佈局 + `.lang-switcher` 按鈕樣式

## 4. 元件文字抽取（15 個元件）

- [x] 4.1 LevelSelect.tsx — 關卡名稱、描述、章節標題、星等顯示
- [x] 4.2 StatusDisplay.tsx — 狀態標籤（STATUS_LABELS 改用 tStatus）、面板文字
- [x] 4.3 WireSelector.tsx — 線材選擇卡片文字
- [x] 4.4 AppliancePanel.tsx — 電器名稱（tApplianceName）、面板標題
- [x] 4.5 ResultPanel.tsx — 結果訊息、星等標籤、成本摘要
- [x] 4.6 CrimpMiniGame.tsx — 步驟標籤、品質文字（tCrimpQuality）
- [x] 4.7 BreakerSelector.tsx — NFB 選擇器文字
- [x] 4.8 CircuitPlanner.tsx — 迴路規劃 UI 所有文字
- [x] 4.9 CircuitCard.tsx — 迴路卡片文字 + tApplianceName
- [x] 4.10 RoomPanel.tsx — 房間面板 + tRoomName
- [x] 4.11 BeforeAfterView.tsx — Before/After 修復對比文字
- [x] 4.12 PanelInteriorView.tsx — 走線整理面板 + tTieQuality
- [x] 4.13 CircuitDiagram.tsx — SVG 文字（相位標籤、狀態、按鈕）
- [x] 4.14 GameBoard.tsx — 主遊戲控制器所有 UI 文字 + tRef 解決 rAF closure

## 5. 引擎檔案

- [x] 5.1 scoring.ts — calcStars 加入可選 TFunction 參數
- [x] 5.2 randomOldHouse.ts — 隨機老屋關卡名稱/描述 i18n

## 6. 翻譯檔完善

- [x] 6.1 完成 zh-TW.json 所有翻譯 key（382 行）
- [x] 6.2 完成 en.json 所有翻譯 key（382 行）

## 7. 驗證

- [x] 7.1 npm run build 通過
- [x] 7.2 zh-TW 模式遊戲體驗與原本一致
- [x] 7.3 切換到 en 模式所有文字正確顯示英文
