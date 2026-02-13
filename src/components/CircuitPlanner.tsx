import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './CircuitPlanner.css';
import type { Appliance, Wire, Breaker, FreeCircuitLevel, PlannerCircuit } from '../types/game';
import { NEUTRAL_MAX_CURRENT } from '../data/constants';
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
  readonly onChangePhase?: (id: string, phase: 'R' | 'T') => void;
  readonly onChangeElcb?: (id: string, enabled: boolean) => void;
  readonly selectedCircuitId: string | null;
  readonly onSelectCircuit: (id: string | null) => void;
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
  onChangePhase,
  onChangeElcb,
  selectedCircuitId,
  onSelectCircuit,
  onConfirm,
}: CircuitPlannerProps) {
  const { t } = useTranslation();
  const slotsUsed = circuits.length;
  const slotsMax = level.panel.maxSlots;
  const canAddCircuit = slotsUsed < slotsMax;

  // Count total assigned and total appliances
  const totalAppliances = level.rooms.reduce((sum, r) => sum + r.appliances.length, 0);
  const assignedCount = circuits.reduce((sum, c) => sum + c.assignedAppliances.length, 0);

  // Build wetArea room IDs set for efficient lookup
  const wetAreaRoomIds = useMemo(() => {
    const ids = new Set<string>();
    for (const room of level.rooms) {
      if (room.wetArea) ids.add(room.id);
    }
    return ids;
  }, [level.rooms]);

  // Pre-compute hasWetAreaAppliance for each circuit
  const circuitWetAreaMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const c of circuits) {
      map[c.id] = c.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId));
    }
    return map;
  }, [circuits, wetAreaRoomIds]);

  // Phase balance preview (only when phaseMode exists)
  const phaseBalance = useMemo(() => {
    if (!level.phaseMode) return null;
    let rCurrent = 0;
    let tCurrent = 0;
    for (const c of circuits) {
      if (c.voltage !== 110 || !c.phase) continue;
      const current = c.assignedAppliances.reduce((sum, a) => {
        if (a.appliance.voltage !== c.voltage) return sum;
        return sum + a.appliance.power / a.appliance.voltage;
      }, 0);
      if (c.phase === 'R') rCurrent += current;
      else tCurrent += current;
    }
    return { r: rCurrent, t: tCurrent, n: Math.abs(rCurrent - tCurrent) };
  }, [level.phaseMode, circuits]);

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
          <h3>{t('planner.title')}</h3>
          <button
            className="add-circuit-btn"
            onClick={onAddCircuit}
            disabled={!canAddCircuit}
            title={canAddCircuit ? t('planner.addCircuitTooltip') : t('planner.slotsFull')}
          >
            {t('planner.addCircuit')}
          </button>
        </div>

        {circuits.length === 0 && (
          <p className="circuit-planner-empty">{t('planner.empty')}</p>
        )}

        <div className="circuit-cards-list">
          {circuits.map((circuit, index) => (
            <CircuitCard
              key={circuit.id}
              circuit={circuit}
              index={index}
              phaseMode={level.phaseMode}
              hasWetAreaAppliance={circuitWetAreaMap[circuit.id] ?? false}
              isSelected={selectedCircuitId === circuit.id}
              onSelect={() => onSelectCircuit(selectedCircuitId === circuit.id ? null : circuit.id)}
              onDelete={onDeleteCircuit}
              onChangeVoltage={onChangeVoltage}
              onChangeBreaker={onChangeBreaker}
              onSelectWire={onSelectWire}
              onUnassignAppliance={onUnassignAppliance}
              onChangePhase={onChangePhase}
              onChangeElcb={onChangeElcb}
            />
          ))}
        </div>
      </div>

      <div className="circuit-planner-summary">
        <h3>{t('planner.panelTitle')}</h3>
        <div className="planner-summary-row">
          <span className="summary-label">{t('planner.slots')}</span>
          <span className={`summary-value ${slotsUsed >= slotsMax ? 'at-limit' : ''}`}>
            {slotsUsed} / {slotsMax}
          </span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">{t('planner.mainBreaker')}</span>
          <span className="summary-value">{level.panel.mainBreakerRating}A</span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">{t('planner.applianceAssign')}</span>
          <span className={`summary-value ${assignedCount < totalAppliances ? 'incomplete' : ''}`}>
            {assignedCount} / {totalAppliances}
          </span>
        </div>
        <div className="planner-summary-row">
          <span className="summary-label">{t('planner.cost')}</span>
          <span className={`summary-value ${totalCost > level.budget ? 'over-budget' : ''}`}>
            ${totalCost} / ${level.budget}
          </span>
        </div>

        {phaseBalance && (
          <div className="planner-phase-balance">
            <h4>{t('planner.phaseEstimate')}</h4>
            <div className="phase-balance-row">
              <span className="phase-label phase-r-label">{t('game.phaseR')}</span>
              <span className="phase-value">{phaseBalance.r.toFixed(1)}A</span>
            </div>
            <div className="phase-balance-row">
              <span className="phase-label phase-t-label">{t('game.phaseT')}</span>
              <span className="phase-value">{phaseBalance.t.toFixed(1)}A</span>
            </div>
            <div className="phase-balance-row">
              <span className="phase-label">{t('planner.nLine')}</span>
              <span className={`phase-value${phaseBalance.n >= NEUTRAL_MAX_CURRENT ? ' neutral-danger' : ''}`}>
                {phaseBalance.n.toFixed(1)}A
              </span>
            </div>
          </div>
        )}

        <button
          className="confirm-planning-btn"
          onClick={onConfirm}
          disabled={!canConfirm}
          title={confirmTooltip}
        >
          {t('planner.confirmConfig')}
        </button>
      </div>
    </div>
  );
}
