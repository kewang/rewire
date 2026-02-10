import type { Appliance, Wire, Breaker, FreeCircuitLevel, PlannerCircuit } from '../types/game';
import RoomPanel from './RoomPanel';
import CircuitCard from './CircuitCard';

interface CircuitPlannerProps {
  readonly level: FreeCircuitLevel;
  readonly circuits: readonly PlannerCircuit[];
  readonly totalCost: number;
  readonly canConfirm: boolean;
  readonly confirmTooltip?: string;
  readonly onAddCircuit: () => void;
  readonly onDeleteCircuit: (id: string) => void;
  readonly onChangeVoltage: (id: string, voltage: 110 | 220) => void;
  readonly onChangeBreaker: (id: string, breaker: Breaker) => void;
  readonly onSelectWire: (id: string, wire: Wire) => void;
  readonly onAssignAppliance: (appliance: Appliance, roomId: string, roomApplianceIndex: number) => void;
  readonly onUnassignAppliance: (circuitId: string, applianceIndex: number) => void;
  readonly onConfirm: () => void;
}

export default function CircuitPlanner({
  level,
  circuits,
  totalCost,
  canConfirm,
  confirmTooltip,
  onAddCircuit,
  onDeleteCircuit,
  onChangeVoltage,
  onChangeBreaker,
  onSelectWire,
  onAssignAppliance,
  onUnassignAppliance,
  onConfirm,
}: CircuitPlannerProps) {
  const slotsUsed = circuits.length;
  const slotsMax = level.panel.maxSlots;
  const canAddCircuit = slotsUsed < slotsMax;

  // Count total assigned and total appliances
  const totalAppliances = level.rooms.reduce((sum, r) => sum + r.appliances.length, 0);
  const assignedCount = circuits.reduce((sum, c) => sum + c.assignedAppliances.length, 0);

  return (
    <div className="circuit-planner">
      <div className="circuit-planner-rooms">
        <RoomPanel
          rooms={level.rooms}
          circuits={circuits}
          onAssign={onAssignAppliance}
        />
      </div>

      <div className="circuit-planner-circuits">
        <div className="circuit-planner-circuits-header">
          <h3>迴路規劃</h3>
          <button
            className="add-circuit-btn"
            onClick={onAddCircuit}
            disabled={!canAddCircuit}
            title={canAddCircuit ? '新增迴路' : '插槽已滿'}
          >
            ＋ 新增迴路
          </button>
        </div>

        {circuits.length === 0 && (
          <p className="circuit-planner-empty">尚未建立迴路，請點擊「＋ 新增迴路」開始規劃</p>
        )}

        <div className="circuit-cards-list">
          {circuits.map((circuit, index) => (
            <CircuitCard
              key={circuit.id}
              circuit={circuit}
              index={index}
              onDelete={onDeleteCircuit}
              onChangeVoltage={onChangeVoltage}
              onChangeBreaker={onChangeBreaker}
              onSelectWire={onSelectWire}
              onUnassignAppliance={onUnassignAppliance}
            />
          ))}
        </div>
      </div>

      <div className="circuit-planner-summary">
        <h3>配電箱</h3>
        <div className="planner-summary-row">
          <span className="summary-label">插槽</span>
          <span className={`summary-value ${slotsUsed >= slotsMax ? 'at-limit' : ''}`}>
            {slotsUsed} / {slotsMax}
          </span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">主開關</span>
          <span className="summary-value">{level.panel.mainBreakerRating}A</span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">電器指派</span>
          <span className={`summary-value ${assignedCount < totalAppliances ? 'incomplete' : ''}`}>
            {assignedCount} / {totalAppliances}
          </span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">成本</span>
          <span className={`summary-value ${totalCost > level.budget ? 'over-budget' : ''}`}>
            ${totalCost} / ${level.budget}
          </span>
        </div>

        <button
          className="confirm-planning-btn"
          onClick={onConfirm}
          disabled={!canConfirm}
          title={confirmTooltip}
        >
          確認配置
        </button>
      </div>
    </div>
  );
}
