/** 線材 */
export interface Wire {
  /** 線徑 (mm²) */
  readonly crossSection: number;
  /** 最大安全電流 (A) */
  readonly maxCurrent: number;
  /** 每米成本 */
  readonly costPerMeter: number;
}

/** 電器 */
export interface Appliance {
  /** 名稱 */
  readonly name: string;
  /** 功率 (W) */
  readonly power: number;
  /** 電壓 (V) */
  readonly voltage: number;
}

/** NFB 斷路器 */
export interface Breaker {
  /** 額定電流 (A) */
  readonly ratedCurrent: number;
  /** 跳脫延遲 (秒) */
  readonly tripDelay: number;
}

/** 迴路識別符 */
export type CircuitId = string;

/** 迴路：NFB + 線材 + 插座上的電器 */
export interface Circuit {
  /** 迴路識別符 */
  readonly id: CircuitId;
  /** 迴路顯示名稱 */
  readonly label: string;
  /** 迴路電壓 (V) */
  readonly voltage: 110 | 220;
  readonly breaker: Breaker;
  readonly wire: Wire;
  readonly appliances: readonly Appliance[];
  /** 接觸電阻倍率（壓接品質影響，預設 1.0） */
  readonly contactResistance?: number;
}

/** 壓接品質 */
export type CrimpQuality = 'excellent' | 'good' | 'poor' | 'none';

/** 束帶拉緊品質 */
export type CableTieQuality = 'tight' | 'good' | 'loose' | 'over-tight';

/** 壓接端子類型 */
export type CrimpTerminalType = 'o-ring' | 'y-fork';

/** 壓接結果 */
export interface CrimpResult {
  /** 端子類型 */
  readonly terminalType: CrimpTerminalType;
  /** 壓接品質 */
  readonly quality: CrimpQuality;
  /** 接觸電阻倍率 */
  readonly contactResistance: number;
}

/** 模擬狀態 */
export type SimulationStatus = 'normal' | 'warning' | 'tripped' | 'burned' | 'neutral-burned' | 'elcb-tripped' | 'leakage';

/** 單迴路模擬動態狀態 */
export interface CircuitState {
  /** 當前狀態 */
  readonly status: SimulationStatus;
  /** 當前總電流 (A) */
  readonly totalCurrent: number;
  /** 線材熱度 (0.0 ~ 1.0，1.0 = 燒毀) */
  readonly wireHeat: number;
  /** 斷路器跳脫計時器 (秒，電流超過額定時累計) */
  readonly breakerTripTimer: number;
}

/** 多迴路整體模擬狀態 */
export interface MultiCircuitState {
  /** 每個迴路的獨立狀態 */
  readonly circuitStates: Record<CircuitId, CircuitState>;
  /** 已通電時間 (秒)，所有迴路共用 */
  readonly elapsed: number;
  /** 整體狀態，由所有迴路最嚴重狀態決定 */
  readonly overallStatus: SimulationStatus;
  /** 中性線電流 (A) */
  readonly neutralCurrent: number;
  /** 中性線熱度 (0.0 ~ 1.0) */
  readonly neutralHeat: number;
}

/** 模擬動態狀態（單迴路，向後相容） */
export interface SimulationState {
  /** 當前狀態 */
  readonly status: SimulationStatus;
  /** 當前總電流 (A) */
  readonly totalCurrent: number;
  /** 線材熱度 (0.0 ~ 1.0，1.0 = 燒毀) */
  readonly wireHeat: number;
  /** 已通電時間 (秒) */
  readonly elapsed: number;
  /** 斷路器跳脫計時器 (秒，電流超過額定時累計) */
  readonly breakerTripTimer: number;
}

/** 單迴路接線狀態 */
export interface CircuitWiringState {
  /** 是否已完成接線 */
  readonly isWired: boolean;
  /** 已連接的線材 */
  readonly connectedWire: Wire | null;
}

/** 拖拉接線狀態 */
export interface WiringState {
  /** 是否正在拖曳 */
  readonly isDragging: boolean;
  /** 正在拖曳的線材 */
  readonly dragWire: Wire | null;
  /** SVG 座標系中的游標位置 */
  readonly cursorPos: { readonly x: number; readonly y: number } | null;
  /** 是否已完成接線（單迴路相容） */
  readonly isWired: boolean;
  /** 已連接的線材（單迴路相容） */
  readonly connectedWire: Wire | null;
  /** 多迴路接線狀態 */
  readonly circuits: Record<CircuitId, CircuitWiringState>;
  /** 拖曳目標迴路 */
  readonly targetCircuitId: CircuitId | null;
}

/** 模擬可調參數 */
export interface SimulationConfig {
  /** 過載時每秒熱度上升係數 */
  readonly heatRate: number;
  /** 正常時每秒熱度冷卻係數 */
  readonly coolRate: number;
}

/** 關卡迴路配置 */
export interface CircuitConfig {
  /** 迴路識別符 */
  readonly id: CircuitId;
  /** 迴路顯示名稱 */
  readonly label: string;
  /** 迴路電壓 (V) */
  readonly voltage: 110 | 220;
  /** NFB 配置 */
  readonly breaker: Breaker;
  /** 可分配到此迴路的電器清單 */
  readonly availableAppliances: readonly Appliance[];
  /** 該迴路是否可安裝 ELCB 漏電斷路器 */
  readonly elcbAvailable?: boolean;
  /** 該迴路是否為潮濕區域（需強制安裝 ELCB） */
  readonly wetArea?: boolean;
  /** 相位分配（僅 110V 迴路適用，220V 為跨相 R-T） */
  readonly phase?: 'R' | 'T';
}

/** 漏電事件（腳本式） */
export interface LeakageEvent {
  /** 漏電觸發時間（秒） */
  readonly time: number;
  /** 漏電發生的目標迴路 ID */
  readonly circuitId: CircuitId;
}

/** 老屋問題類型 */
export type OldHouseProblemType = 'bare-wire' | 'wrong-wire-gauge' | 'oxidized-splice';

/** 老屋問題 */
export interface OldHouseProblem {
  readonly circuitId: CircuitId;
  readonly type: OldHouseProblemType;
}

/** 預接線迴路 */
export interface PreWiredCircuit {
  readonly wire: Wire;
  readonly crimpQuality: CrimpQuality;
  readonly appliances: readonly Appliance[];
}

/** 老屋配置 */
export interface OldHouseConfig {
  readonly problems: readonly OldHouseProblem[];
  readonly preWiredCircuits: Record<CircuitId, PreWiredCircuit>;
}

/** 獎勵目標條件（三星） */
export type BonusCondition =
  | { readonly type: 'no-warning' }
  | { readonly type: 'under-budget-ratio'; readonly ratio: number }
  | { readonly type: 'time-margin'; readonly margin: number }
  | { readonly type: 'crimp-quality'; readonly minQuality: CrimpQuality }
  | { readonly type: 'no-trip' }
  | { readonly type: 'aesthetics-score'; readonly minScore: number };

/** 關卡定義 */
export interface Level {
  /** 關卡名稱 */
  readonly name: string;
  /** 關卡描述 */
  readonly description: string;
  /** 必須正常運作的電器（全迴路總清單） */
  readonly requiredAppliances: readonly Appliance[];
  /** 預算 */
  readonly budget: number;
  /** 需通電維持的秒數 */
  readonly survivalTime: number;
  /** 多迴路配置 */
  readonly circuitConfigs: readonly CircuitConfig[];
  /** 相位分配模式：auto=固定不可切換，manual=玩家可切換 */
  readonly phaseMode?: 'auto' | 'manual';
  /** 漏電模式：scripted=腳本式（固定時間），random=隨機式（每秒機率） */
  readonly leakageMode?: 'scripted' | 'random';
  /** 腳本式漏電事件列表（leakageMode='scripted' 時使用） */
  readonly leakageEvents?: readonly LeakageEvent[];
  /** 是否要求壓接端子（true 時所有迴路接線後必須完成壓接才能送電） */
  readonly requiresCrimp?: boolean;
  /** 是否要求整線（true 時送電前須完成整線流程） */
  readonly requiresRouting?: boolean;
  /** 整線起始車道排列（有交叉的謎題起點，省略時用 config 順序） */
  readonly initialLanes?: readonly CircuitId[];
  /** 第三星獎勵目標條件 */
  readonly bonusCondition?: BonusCondition;
  /** 老屋模式配置 */
  readonly oldHouse?: OldHouseConfig;
}
