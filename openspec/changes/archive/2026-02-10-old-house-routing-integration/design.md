## Context

v0.8 老屋驚魂擴充到 5 種問題後，需要與走線整理整合，並新增 L26-L28 關卡。PRD v0.8 FR-I-E 定義了整合規則，FR-I 第 4 節定義了三個新關卡。

## Goals / Non-Goals

**Goals:**
- oldHouse + routingMode 可共存，流程為修復→整線→送電
- routingReady 需 !problemsRemaining（問題全修復 + 接線完成）
- L26 五毒俱全：全 5 種問題 + c1 雙問題 + 手動相位 + 隨機漏電
- L27 翻修+整線：修復 + 走線整合 + aesthetics-score bonus
- L28 終極考驗：5 迴路全機制綜合

**Non-Goals:**
- 不修改走線引擎本身
- 不做新的老屋問題類型

## Decisions

### D1：routingReady 條件
**選擇**：在 GameBoard routingReady 計算中加入 `!problemsRemaining` 條件。
**理由**：問題修復是走線的前置步驟，邏輯上修復完才整線。

### D2：L26 雙問題迴路
**選擇**：c1 同時有 wrong-wire-gauge + overrated-breaker。
**理由**：真實情境中問題常共存，需要拆線換線 + 換 NFB 兩步修復。

### D3：L27/L28 初始車道排列
**選擇**：故意製造交叉的初始排列。
**理由**：增加走線整理的挑戰性。
