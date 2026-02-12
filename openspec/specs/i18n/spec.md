## ADDED Requirements

### Requirement: i18n Framework

系統 MUST 使用 react-i18next 提供六語支援（zh-TW、en、ja、ko、fr、th）。

#### Scenario: 初始化

- **WHEN** 應用啟動
- **THEN** i18next MUST 初始化，載入 6 種語言資源
- **AND** 預設語言 MUST 為 zh-TW
- **AND** 語言偏好 MUST 從 localStorage key `rewire-lang` 讀取

#### Scenario: 語言切換

- **WHEN** 玩家切換語言
- **THEN** 所有 UI 文字 MUST 即時更新
- **AND** 新語言偏好 MUST 存入 localStorage

#### Scenario: SUPPORTED_LANGUAGES export

- **WHEN** 其他模組 import SUPPORTED_LANGUAGES
- **THEN** MUST 取得包含 6 種語言的 `{ code, label }` 陣列
- **AND** 順序 MUST 為 zh-TW, en, ja, ko, fr, th

### Requirement: Translation files

系統 MUST 維護 6 套完整的翻譯檔。

#### Scenario: zh-TW 翻譯

- **WHEN** 語言為 zh-TW
- **THEN** 所有 UI 文字 MUST 顯示繁體中文
- **AND** 遊戲體驗 MUST 與 i18n 引入前完全一致

#### Scenario: en 翻譯

- **WHEN** 語言為 en
- **THEN** 所有 UI 文字 MUST 顯示英文

#### Scenario: ja 翻譯

- **WHEN** 語言為 ja
- **THEN** 所有 UI 文字 MUST 顯示日文
- **AND** 電氣術語 MUST 使用日本電氣工事標準用語

#### Scenario: ko 翻譯

- **WHEN** 語言為 ko
- **THEN** 所有 UI 文字 MUST 顯示韓文
- **AND** 電氣術語 MUST 使用韓國電氣工程用語

#### Scenario: fr 翻譯

- **WHEN** 語言為 fr
- **THEN** 所有 UI 文字 MUST 顯示法文
- **AND** 電氣術語 MUST 使用法國電氣規範用語

#### Scenario: th 翻譯

- **WHEN** 語言為 th
- **THEN** 所有 UI 文字 MUST 顯示泰文
- **AND** 電氣術語 MUST 使用泰國電力行業用語

#### Scenario: language 區塊

- **WHEN** 任何翻譯檔被載入
- **THEN** `language` 區塊 MUST 包含 6 種語言的原生名稱
- **AND** key 為語言代碼（zh-TW, en, ja, ko, fr, th）

### Requirement: Translation helpers

`src/i18nHelpers.ts` MUST 提供動態文字翻譯輔助函式。

#### Scenario: 電器名稱翻譯

- **WHEN** 呼叫 tApplianceName(t, applianceId)
- **THEN** MUST 返回對應語言的電器名稱

#### Scenario: 房間名稱翻譯

- **WHEN** 呼叫 tRoomName(t, roomName)
- **THEN** MUST 返回對應語言的房間名稱

#### Scenario: 狀態翻譯

- **WHEN** 呼叫 tStatus(t, status)
- **THEN** MUST 返回對應語言的模擬狀態名稱

### Requirement: Language switcher

LevelSelect MUST 顯示支援多語的語言切換器。

#### Scenario: 下拉選單觸發

- **WHEN** 關卡選擇頁顯示
- **THEN** 標題旁 MUST 顯示 LanguageSwitcher 元件
- **AND** 按鈕 MUST 顯示當前語言的短碼標籤

#### Scenario: 展開選單

- **WHEN** 玩家點擊語言切換按鈕
- **THEN** MUST 展開下拉選單顯示 6 種語言選項
- **AND** 每個選項 MUST 顯示語言完整名稱與短碼標籤
- **AND** 當前語言 MUST 以 amber 色高亮並 disabled

#### Scenario: 選擇語言

- **WHEN** 玩家點擊選單中的語言選項
- **THEN** 語言 MUST 立即切換
- **AND** 選單 MUST 自動收合

#### Scenario: 點擊外部收合

- **WHEN** 選單展開且玩家點擊選單外部區域
- **THEN** 選單 MUST 自動收合

### Requirement: Component text extraction

所有元件的硬編碼文字 MUST 替換為 t() 呼叫。

#### Scenario: 15 個元件 + 2 個引擎

- **WHEN** 任何 UI 元件渲染
- **THEN** 所有使用者可見文字 MUST 使用 useTranslation / t() 取得
- **AND** MUST NOT 有硬編碼的中文或英文字串

#### Scenario: GameBoard rAF closure

- **WHEN** GameBoard rAF loop 中需要翻譯文字
- **THEN** MUST 使用 tRef = useRef(t) 取得最新的 t 函式
- **AND** MUST NOT 直接使用 closure 中的 t（可能 stale）

### Requirement: Floor plan components i18n completeness
All user-visible text strings in floor plan components (FloorPlanView, CircuitPlannerSidebar, WireToolbar, CircuitAssignmentPopover, RoutingStrategyPicker) SHALL use i18n translation keys. No hardcoded Chinese or English strings SHALL remain in these components.

#### Scenario: Switch to non-default language
- **WHEN** user switches language to English (or any of the 6 supported languages)
- **THEN** all text in floor plan mode components displays in the selected language with no untranslated fallbacks

#### Scenario: New i18n keys present in all 6 locales
- **WHEN** a new i18n key is added for floor plan polish
- **THEN** the key has translations in all 6 locale files (zh-TW, en, ja, ko, fr, th)
