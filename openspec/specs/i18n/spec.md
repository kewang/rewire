## ADDED Requirements

### Requirement: i18n Framework

系統 MUST 使用 react-i18next 提供中英雙語支援。

#### Scenario: 初始化

- **WHEN** 應用啟動
- **THEN** i18next MUST 初始化
- **AND** 預設語言 MUST 為 zh-TW
- **AND** 語言偏好 MUST 從 localStorage key `rewire-lang` 讀取

#### Scenario: 語言切換

- **WHEN** 玩家切換語言
- **THEN** 所有 UI 文字 MUST 即時更新
- **AND** 新語言偏好 MUST 存入 localStorage

### Requirement: Translation files

系統 MUST 維護完整的翻譯檔。

#### Scenario: zh-TW 翻譯

- **WHEN** 語言為 zh-TW
- **THEN** 所有 UI 文字 MUST 顯示繁體中文
- **AND** 遊戲體驗 MUST 與 i18n 引入前完全一致

#### Scenario: en 翻譯

- **WHEN** 語言為 en
- **THEN** 所有 UI 文字 MUST 顯示英文

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

LevelSelect MUST 顯示語言切換器。

#### Scenario: 切換按鈕

- **WHEN** 關卡選擇頁顯示
- **THEN** 標題旁 MUST 顯示 LanguageSwitcher 元件
- **AND** 按鈕文字 MUST 顯示目標語言（zh-TW 時顯示 EN，en 時顯示 中）

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
