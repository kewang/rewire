# i18n

## Requirement: i18n Framework

react-i18next 國際化框架設定。

**檔案：**
- `src/i18n.ts` — 初始化設定（語言偵測、localStorage 持久化 key `rewire-lang`、fallback lng `zh-TW`）
- `src/locales/zh-TW.json` — 繁體中文翻譯（382 key）
- `src/locales/en.json` — 英文翻譯（382 key）

**語言切換：** LanguageSwitcher 元件，LevelSelect 標題旁 EN/中 按鈕。

**預設語言：** zh-TW。語言偏好存入 localStorage。

## Requirement: Translation Helpers

`src/i18nHelpers.ts` — 翻譯輔助函式，處理動態文字 key 映射：
- tApplianceName(t, applianceId) — 電器名稱
- tRoomName(t, roomName) — 房間名稱
- tStatus(t, status) — 模擬狀態名稱
- tCrimpQuality(t, quality) — 壓接品質
- tTieQuality(t, quality) — 束帶品質
- tLevelName(t, levelNumber) — 關卡名稱
- tLevelDesc(t, levelNumber) — 關卡描述
- tBonusLabel(t, bonusCondition) — 獎勵條件標籤
- tTerminalName(t, terminalType) — 端子名稱

## Requirement: Component Text Extraction

15 個元件 + 2 個引擎檔案的硬編碼文字全部替換為 t() 呼叫。

**元件清單：** LevelSelect、StatusDisplay、WireSelector、AppliancePanel、ResultPanel、CrimpMiniGame、BreakerSelector、CircuitPlanner、CircuitCard、RoomPanel、BeforeAfterView、PanelInteriorView、CircuitDiagram、GameBoard、main.tsx。

**引擎：** scoring.ts（可選 TFunction 參數）、randomOldHouse.ts（關卡名稱 i18n）。

**特殊處理：** GameBoard 中使用 `tRef = useRef(t)` 解決 rAF loop 中 t 函式的 closure stale 問題。
