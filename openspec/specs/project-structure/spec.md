# project-structure Specification

## Purpose
TBD - created by archiving change project-scaffold. Update Purpose after archive.
## Requirements
### Requirement: 目錄結構

專案 MUST 遵循標準的 React + TypeScript 目錄結構，為後續功能模組預留位置。

#### Scenario: 核心目錄存在

- **WHEN** 檢查專案目錄結構
- **THEN** 存在 `src/` 作為程式碼根目錄
- **AND** 存在 `src/components/` 放置 React 元件
- **AND** 存在 `src/types/` 放置 TypeScript 型別定義
- **AND** 存在 `src/engine/` 放置模擬引擎邏輯

### Requirement: TypeScript 嚴格模式

專案 MUST 使用 TypeScript 嚴格模式以確保型別安全。

#### Scenario: 嚴格模式啟用

- **WHEN** 檢查 `tsconfig.json`
- **THEN** `strict` 設定為 `true`

