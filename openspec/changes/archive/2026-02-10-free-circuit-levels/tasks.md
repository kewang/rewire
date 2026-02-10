## 1. 準備工作

- [x] 1.1 在 levels.ts 頂部 destructure 新增 oven（烤箱）和 dehumidifier（除濕機）變數

## 2. L06-L10 基礎自由配迴路

- [x] 2.1 改寫 L06（自由配迴路入門）為 FreeCircuitLevel：客廳+廚房，4 slots/50A，$100/8s
- [x] 2.2 改寫 L07（高功率初體驗）為 FreeCircuitLevel：客廳[電暖器+冰箱]，3 slots/50A，$85/10s
- [x] 2.3 改寫 L08（廚房分迴路）為 FreeCircuitLevel：廚房+客廳，4 slots/50A，$150/10s
- [x] 2.4 改寫 L09（混合電壓）為 FreeCircuitLevel：廚房+洗衣間，4 slots/50A，$140/10s
- [x] 2.5 改寫 L10（全屋配電）為 FreeCircuitLevel：5 房間 7 電器，6 slots/75A，$250/15s

## 3. L11-L12 相位平衡

- [x] 3.1 改寫 L11（相位平衡入門）為 FreeCircuitLevel + phaseMode:'auto'：3 房間，5 slots/75A，$200/12s
- [x] 3.2 改寫 L12（相位平衡進階）為 FreeCircuitLevel + phaseMode:'manual'：4 房間，6 slots/75A，$280/15s

## 4. L13-L15 ELCB/漏電

- [x] 4.1 改寫 L13（ELCB 入門）為 FreeCircuitLevel + leakageMode:'scripted'：浴室(wetArea)+臥室，4 slots/50A，$150/10s
- [x] 4.2 改寫 L14（ELCB 預算壓力）為 FreeCircuitLevel + leakageMode:'random'：浴室(wetArea)+廚房+儲藏室，5 slots/50A，$185/12s
- [x] 4.3 改寫 L15（綜合挑戰）為 FreeCircuitLevel + phaseMode:'manual' + leakageMode:'random'：4 房間，6 slots/75A，$300/20s

## 5. L16-L17 壓接端子

- [x] 5.1 改寫 L16（壓接入門）為 FreeCircuitLevel + requiresCrimp：客廳，3 slots/50A，$80/8s
- [x] 5.2 改寫 L17（端子品質大考驗）為 FreeCircuitLevel + requiresCrimp：廚房+冷氣間，4 slots/50A，$180/12s

## 6. L21-L23 走線整理

- [x] 6.1 改寫 L21（整線入門）為 FreeCircuitLevel + requiresRouting + requiresCrimp + phaseMode:'auto'：3 房間，4 slots/50A，$150/10s
- [x] 6.2 改寫 L22（交叉迷宮）為 FreeCircuitLevel + requiresRouting + requiresCrimp + phaseMode:'manual'：5 房間，6 slots/75A，$300/12s
- [x] 6.3 改寫 L23（完美配電箱）為 FreeCircuitLevel 全機制綜合：5 房間，8 slots/75A，$400/15s

## 7. Bug 修正：電器指派目標迴路

- [x] 7.1 GameBoard 新增 selectedPlannerCircuitId state，點選 CircuitCard 時設定選取
- [x] 7.2 修改 handleAssignAppliance：優先指派到選取中迴路（驗證電壓匹配），fallback 單一匹配自動指派，多匹配無選取時不指派
- [x] 7.3 CircuitPlanner/CircuitCard 傳遞 selectedCircuitId + onSelectCircuit props
- [x] 7.4 CircuitCard 加 isSelected 視覺狀態（琥珀色邊框）
- [x] 7.5 刪除迴路時清除 selectedPlannerCircuitId

## 8. 驗證

- [x] 8.1 確認 TypeScript 編譯通過（npm run build）
- [x] 8.2 確認 ESLint 無錯誤（npm run lint）
