## Why

遊戲目前所有文字為繁體中文硬編碼，無法讓非中文使用者遊玩。新增中英雙語支援，擴大受眾範圍。

## What Changes

- 引入 **react-i18next** 國際化框架
- 建立 **zh-TW.json** 和 **en.json** 翻譯檔
- 抽取 **15 個元件** + 2 個引擎檔案中的硬編碼文字
- 新增 **i18nHelpers.ts** 翻譯輔助函式（tApplianceName、tRoomName、tStatus、tCrimpQuality 等）
- 新增 **LanguageSwitcher** 元件（EN/中 切換按鈕），放置於關卡選擇頁標題旁
- 語言偏好存入 localStorage（key: `rewire-lang`），預設 zh-TW

## Capabilities

### New Capabilities

- `i18n`: react-i18next 國際化框架（初始化、語言切換、localStorage 持久化、翻譯輔助函式）

### Modified Capabilities

- 所有含 UI 文字的元件：改用 useTranslation / t() 取代硬編碼字串

## Impact

- **新增檔案**：`src/i18n.ts`、`src/i18nHelpers.ts`、`src/locales/zh-TW.json`、`src/locales/en.json`、`src/components/LanguageSwitcher.tsx`
- **修改 15 個元件**：LevelSelect、StatusDisplay、WireSelector、AppliancePanel、ResultPanel、CrimpMiniGame、BreakerSelector、CircuitPlanner、CircuitCard、RoomPanel、BeforeAfterView、PanelInteriorView、CircuitDiagram、GameBoard、main.tsx
- **修改 2 個引擎**：scoring.ts（可選 TFunction 參數）、randomOldHouse.ts（關卡名稱 i18n）
- **新增依賴**：react-i18next、i18next
- **無 breaking changes**：zh-TW 為預設語言，既有體驗完全不變
