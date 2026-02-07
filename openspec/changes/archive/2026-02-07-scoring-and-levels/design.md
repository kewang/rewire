## Context

遊戲已有模擬引擎和互動 UI，可以選線材、加電器、送電並觀察跳電/燒線。但缺少目標驅動——沒有預算限制和過關條件，玩家沒有理由不選最粗線。PRD 定義了三個關卡（L01-L03）和成本結算系統（FR-6）。

## Goals / Non-Goals

**Goals:**
- 加入成本計算讓玩家需要在安全和預算之間取捨
- 三個關卡遞進難度，L01 教學 → L02 燒線陷阱 → L03 成本取捨
- 過關判定：指定電器正常通電滿 N 秒
- 過關/失敗都有結算畫面

**Non-Goals:**
- 不做分數排行或星級評價（v0.1 只有過/不過）
- 不做關卡解鎖（三關都可自由選擇）
- 不做存檔/讀檔

## Decisions

### Decision 1: 遊戲流程改為關卡制

啟動時先顯示關卡選擇畫面，選擇後進入遊戲。過關或失敗後可返回關卡選擇。

替代方案：保留自由模式 + 關卡模式共存。但 v0.1 先做關卡制即可，自由模式可後加。

### Decision 2: 成本在畫面上即時顯示

選擇線材時即時計算並顯示成本（線長 × 單價），與預算做比較。超預算不阻擋送電，但過關時判定為失敗。

理由：PRD 驗收條件「顯示花費與預算差額」、「超預算會失敗或大幅扣分」。

### Decision 3: 過關判定在 simulation step 外處理

由 GameBoard 檢查 `simState.elapsed >= level.survivalTime && status === 'normal' | 'warning'`。不修改 simulation engine，保持引擎單純。

### Decision 4: 關卡資料獨立檔案

關卡定義放 `src/data/levels.ts`，使用既有的 Level 型別。每個關卡指定 requiredAppliances、budget、survivalTime。

## Risks / Trade-offs

- **超預算判定時機** → 過關結算時才判定，不在送電時阻擋，讓玩家可以「試試看」但最終會失敗。
- **Level 型別的 requiredAppliances 是 Appliance 物件** → 直接引用 DEFAULT_APPLIANCES 的物件，簡單直接。
