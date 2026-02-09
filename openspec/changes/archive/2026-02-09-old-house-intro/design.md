## Context

目前 Rewire 的 17 個關卡都是「從零開始配電」。PRD v0.5 規劃老屋驚魂前導模式：玩家打開既有損壞配電箱，診斷問題並修復。這是全新遊戲流程，需要在 GameBoard 中支援「預接線 + 拆線 + 重新接線」的逆向操作。

現有流程：選線 → 拖曳接線 → (壓接) → 分配電器 → 送電
老屋流程：檢查預接線 → 診斷問題 → 拆線 → 選線重接 → 壓接 → 送電

## Goals / Non-Goals

**Goals:**
- 支援老屋關卡（預接線 + 預分配電器 + 問題標記）
- 支援「拆線」操作（回到未接線狀態）
- 3 種問題類型正確運作（bare-wire / wrong-wire-gauge / oxidized-splice）
- 老屋成本規則（僅替換線計成本）
- 問題迴路視覺提示（閃爍 + ⚠️）
- L18-L20 三個老屋關卡

**Non-Goals:**
- 不做隨機老屋生成（v0.7）
- 不做 Before/After 對比畫面
- 不做完整老屋模式（更多問題類型）
- 不改動模擬引擎

## Decisions

### 1. 老屋模式作為 Level 的可選擴展

**選擇**：Level 新增可選 `oldHouse?: OldHouseConfig` 欄位，GameBoard 在 handleSelectLevel 時偵測 oldHouse 來初始化預接線狀態。

**理由**：與既有 Level 結構自然整合，不需建立獨立的遊戲模式切換器。非老屋關卡完全不受影響。

**替代方案**：建立獨立的 OldHouseGameBoard 元件 — 但與 GameBoard 高度重複，維護成本高。

### 2. 預接線初始化在 handleSelectLevel 中完成

**選擇**：當 level.oldHouse 存在時，handleSelectLevel 額外設定 circuitWires（使用 preWiredCircuits 的線材）、circuitAppliances（使用 preWiredCircuits 的電器）、circuitCrimps（使用 preWiredCircuits 的壓接品質）、以及 wiring circuits 的 isWired 狀態。

**理由**：集中初始化邏輯在一處，與現有的「清空狀態」流程對稱。

### 3. 問題迴路追蹤用 state

**選擇**：新增 `problemCircuits: Set<CircuitId>` state，初始化時從 oldHouse.problems 提取問題迴路 ID。拆線並重新接好+壓接後，從 set 移除。

**理由**：需要反映在 UI（CircuitDiagram 閃爍）且觸發 re-render，用 state 而非 ref。

### 4. 拆線操作流程

**選擇**：在 CircuitDiagram 的已接線迴路上新增「拆線」按鈕（SVG 內）。點擊後彈出確認（window.confirm），確認後清除該迴路的 circuitWires、circuitCrimps、wiring.circuits[id]。

**理由**：簡單直覺，避免誤操作。SVG 內按鈕與電路圖整合，不需額外 overlay。

**成本處理**：拆線不退費（老屋規則：舊線丟棄）。重新接線時的新線材計入成本。

### 5. 送電前置條件增強

**選擇**：老屋模式下，送電前檢查 problemCircuits 是否全部清除（所有問題迴路都已修復）。

**理由**：問題迴路未修復 = 有已知危險，不應允許送電。

### 6. 老屋成本規則

**選擇**：老屋關卡的 totalCost 計算需減去「保留原線」的成本。方法：追蹤哪些迴路使用了原始預接線（未拆線），這些迴路的線材成本不計入。

**實作**：新增 `preWiredCircuitIds: Set<CircuitId>` ref，拆線時從中移除。totalCost 計算時跳過仍在 set 中的迴路。

### 7. 氧化視覺用 CSS class

**選擇**：oxidized-splice 問題的線材在 CircuitDiagram 中加上 `wire-oxidized` class，線色改為暗褐/暗綠。修復後移除 class。

**理由**：CSS 切換比修改 SVG 屬性簡單，且與現有的 wire-color 系統共存。

## Risks / Trade-offs

- **[Risk] GameBoard 複雜度增加** → Mitigation: 老屋邏輯集中在 handleSelectLevel + 拆線 callback，不影響 rAF loop。
- **[Risk] 預接線 + 拆線 與既有 wiring state 交互** → Mitigation: 拆線操作直接復用「清空該迴路接線」的邏輯，與從零接線流程一致。
- **[Trade-off] window.confirm 拆線確認** → UX 不夠精緻，但簡單可靠。未來可換成自訂 modal。
