## Why

目前所有關卡都是「從零開始配電」的正向流程。老屋驚魂前導模式引入「打開既有損壞配電箱 → 診斷問題 → 修復接線」的全新逆向遊戲流程，讓玩家理解真實電工場景中的檢修概念。v0.5 最後一個 change，為 v0.7 完整老屋模式打基礎。

## What Changes

- 新增老屋關卡資料結構：`OldHouseProblem`、`PreWiredCircuit`、`OldHouseConfig`，掛載於 `Level.oldHouse`
- 新增 3 種老屋問題類型：`bare-wire`（活線沒壓端子）、`wrong-wire-gauge`（線徑過小）、`oxidized-splice`（氧化老鼠尾接法，contactResistance=2.0）
- 新增「拆線」操作：玩家點擊已接線迴路 → 確認拆除 → 回到未接線狀態
- 老屋關卡開局預接線（各迴路已接好線 + 電器），問題迴路標記閃爍警告
- 老屋成本規則：保留原線免費，僅替換的新線計成本
- 新增 L18-L20 三個老屋關卡（漸進難度，L20 為 v0.5 畢業考）
- 老屋視覺：整體偏暗老舊質感、問題迴路閃爍橘色邊框 + ⚠️ 圖示、氧化線材暗色
- L18-L20 bonusCondition 配置為 `no-warning`

## Capabilities

### New Capabilities
- `old-house-mode`: 老屋遊戲模式（資料結構、問題型別、拆線操作、預接線初始化、老屋成本規則、視覺呈現）
- `old-house-levels`: 老屋關卡定義（L18-L20）

### Modified Capabilities
- `scoring-and-levels`: Level 型別新增 oldHouse 欄位，關卡總數從 17 變 20
- `game-ui`: GameBoard 支援老屋模式（預接線初始化、拆線操作、問題迴路管理）

## Impact

- `src/types/game.ts` — 新增 OldHouseProblem / PreWiredCircuit / OldHouseConfig 型別，Level 新增 oldHouse 欄位
- `src/data/levels.ts` — 新增 L18-L20
- `src/data/constants.ts` — 新增 OXIDIZED_CONTACT_RESISTANCE 常數
- `src/components/GameBoard.tsx` — 老屋模式初始化（預接線 + 電器）、拆線操作、問題迴路追蹤
- `src/components/CircuitDiagram.tsx` — 問題迴路閃爍 + ⚠️ 圖示 + 氧化視覺
- `src/components/ResultPanel.tsx` — 老屋成功文字調整
- `src/App.css` — 老屋相關樣式（閃爍動畫、暗色基調、氧化線色）
