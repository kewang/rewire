import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Appliance, Wire, Breaker, FreeCircuitLevel, PlannerCircuit } from '../types/game';
import { DEFAULT_WIRES, BREAKER_15A, BREAKER_20A, BREAKER_30A, NEUTRAL_MAX_CURRENT, NFB_COSTS, ELCB_COST, DEFAULT_WIRE_LENGTH } from '../data/constants';
import { CIRCUIT_COLORS } from './FloorPlanView';
import { tApplianceName, tRoomName } from '../i18nHelpers';

interface CircuitPlannerSidebarProps {
  readonly level: FreeCircuitLevel;
  readonly circuits: readonly PlannerCircuit[];
  readonly totalCost: number;
  readonly canConfirm: boolean;
  readonly confirmTooltip?: string;
  readonly collapsed: boolean;
  readonly onToggleCollapse: () => void;
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

const BREAKER_OPTIONS: { breaker: Breaker; label: string }[] = [
  { breaker: BREAKER_15A, label: '15A' },
  { breaker: BREAKER_20A, label: '20A' },
  { breaker: BREAKER_30A, label: '30A' },
];

export default function CircuitPlannerSidebar({
  level, circuits, totalCost, canConfirm, confirmTooltip,
  collapsed, onToggleCollapse,
  onAddCircuit, onDeleteCircuit, onChangeVoltage, onChangeBreaker,
  onSelectWire, onAssignAppliance, onUnassignAppliance,
  onChangePhase, onChangeElcb,
  selectedCircuitId, onSelectCircuit, onConfirm,
}: CircuitPlannerSidebarProps) {
  const { t } = useTranslation();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const slotsUsed = circuits.length;
  const slotsMax = level.panel.maxSlots;
  const canAddCircuit = slotsUsed < slotsMax;

  const totalAppliances = level.rooms.reduce((sum, r) => sum + r.appliances.length, 0);
  const assignedCount = circuits.reduce((sum, c) => sum + c.assignedAppliances.length, 0);

  const wetAreaRoomIds = useMemo(() => {
    const ids = new Set<string>();
    for (const room of level.rooms) {
      if (room.wetArea) ids.add(room.id);
    }
    return ids;
  }, [level.rooms]);

  const circuitWetAreaMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const c of circuits) {
      map[c.id] = c.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId));
    }
    return map;
  }, [circuits, wetAreaRoomIds]);

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

  // Estimated total panel current for main breaker load indicator
  const estimatedPanelCurrent = useMemo(() => {
    return circuits.reduce((sum, c) => {
      return sum + c.assignedAppliances.reduce((s, a) => {
        if (a.appliance.voltage !== c.voltage) return s;
        return s + a.appliance.power / a.appliance.voltage;
      }, 0);
    }, 0);
  }, [circuits]);

  const mainLoadRatio = estimatedPanelCurrent / level.panel.mainBreakerRating;
  const mainLoadColor = mainLoadRatio >= 1 ? 'var(--color-accent-red)' : mainLoadRatio >= 0.8 ? 'var(--color-accent-amber)' : 'var(--color-accent-green)';

  if (collapsed) {
    return (
      <div className="sidebar-collapsed" onClick={onToggleCollapse} title={t('sidebar.expand')}>
        <span className="sidebar-collapsed__icon">&#9776;</span>
        <span className="sidebar-collapsed__count">{circuits.length}</span>
        <span className="sidebar-collapsed__cost">${totalCost}</span>
      </div>
    );
  }

  return (
    <div className="sidebar-planner">
      <div className="sidebar-planner__header">
        <h3>{t('planner.panelTitle')}</h3>
        <button className="sidebar-planner__collapse" onClick={onToggleCollapse} title={t('sidebar.collapse')}>&#10005;</button>
      </div>

      {/* Panel summary */}
      <div className="sidebar-planner__summary">
        <div className="sidebar-summary-row">
          <span>{t('planner.slots')}</span>
          <span className={slotsUsed >= slotsMax ? 'text-danger' : ''}>{slotsUsed}/{slotsMax}</span>
        </div>
        <div className="sidebar-summary-row">
          <span>{t('planner.mainBreaker')}</span>
          <span style={{ color: mainLoadColor }}>{estimatedPanelCurrent.toFixed(0)}A/{level.panel.mainBreakerRating}A</span>
        </div>
        <div className="sidebar-summary-row">
          <span>{t('planner.applianceAssign')}</span>
          <span className={assignedCount < totalAppliances ? 'text-warning' : ''}>{assignedCount}/{totalAppliances}</span>
        </div>
        <div className="sidebar-summary-row">
          <span>{t('planner.cost')}</span>
          <span className={totalCost > level.budget ? 'text-danger' : ''}>${totalCost}/${level.budget}</span>
        </div>

        {phaseBalance && (
          <div className="sidebar-phase-balance">
            <div className="sidebar-phase-row">
              <span className="phase-r-label">R</span>
              <span>{phaseBalance.r.toFixed(1)}A</span>
            </div>
            <div className="sidebar-phase-row">
              <span className="phase-t-label">T</span>
              <span>{phaseBalance.t.toFixed(1)}A</span>
            </div>
            <div className="sidebar-phase-row">
              <span>N</span>
              <span className={phaseBalance.n >= NEUTRAL_MAX_CURRENT ? 'text-danger' : ''}>{phaseBalance.n.toFixed(1)}A</span>
            </div>
          </div>
        )}
      </div>

      {/* Circuit list */}
      <div className="sidebar-planner__circuits">
        <div className="sidebar-circuits-header">
          <span className="sidebar-circuits-title">{t('planner.title')}</span>
          <button
            className="sidebar-add-btn"
            onClick={onAddCircuit}
            disabled={!canAddCircuit}
            title={canAddCircuit ? t('planner.addCircuitTooltip') : t('planner.slotsFull')}
          >+</button>
        </div>

        <div className="sidebar-circuits-list">
          {circuits.map((circuit, index) => {
            const circuitColor = CIRCUIT_COLORS[index % CIRCUIT_COLORS.length];
            const totalCurrent = circuit.assignedAppliances.reduce((sum, a) => {
              if (a.appliance.voltage !== circuit.voltage) return sum;
              return sum + a.appliance.power / a.appliance.voltage;
            }, 0);
            const wireCapacity = circuit.selectedWire?.maxCurrent ?? 0;
            const loadRatio = wireCapacity > 0 ? totalCurrent / wireCapacity : 0;
            const loadColor = loadRatio >= 1 ? 'var(--color-accent-red)' : loadRatio >= 0.8 ? 'var(--color-accent-amber)' : 'var(--color-accent-green)';
            const isExpanded = expandedCardId === circuit.id;
            const isSelected = selectedCircuitId === circuit.id;
            const showPhase = level.phaseMode != null && circuit.voltage === 110;
            const hasWetArea = circuitWetAreaMap[circuit.id] ?? false;

            const wireCost = circuit.selectedWire ? circuit.selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH : 0;
            const nfbCost = NFB_COSTS[circuit.breaker.ratedCurrent] ?? 0;
            const elcbCost = circuit.elcbEnabled ? ELCB_COST : 0;

            // Group assigned appliances by room
            const appliancesByRoom = new Map<string, typeof circuit.assignedAppliances[number][]>();
            for (const a of circuit.assignedAppliances) {
              const list = appliancesByRoom.get(a.roomId) || [];
              list.push(a);
              appliancesByRoom.set(a.roomId, list);
            }

            return (
              <div
                key={circuit.id}
                className={`sidebar-circuit-card${isSelected ? ' sidebar-circuit-card--selected' : ''}${isExpanded ? ' sidebar-circuit-card--expanded' : ''}`}
                style={{ '--circuit-color': circuitColor } as React.CSSProperties}
              >
                {/* Compact header */}
                <div
                  className="sidebar-circuit-card__header"
                  onClick={() => onSelectCircuit(isSelected ? null : circuit.id)}
                >
                  <span className="sidebar-circuit-card__dot" style={{ background: circuitColor }} />
                  <span className="sidebar-circuit-card__name">C{index + 1}</span>
                  <span className={`sidebar-circuit-card__voltage voltage-${circuit.voltage}`}>{circuit.voltage}V</span>
                  {showPhase && circuit.phase && (
                    <span className={`sidebar-circuit-card__phase phase-${circuit.phase}`}>{circuit.phase}</span>
                  )}
                  <span className="sidebar-circuit-card__nfb">{circuit.breaker.ratedCurrent}A</span>
                  {hasWetArea && circuit.elcbEnabled && <span className="sidebar-circuit-card__elcb" title="ELCB">E</span>}
                  <span className="sidebar-circuit-card__load" style={{ color: loadColor }}>
                    {totalCurrent.toFixed(1)}A
                  </span>
                  <span className="sidebar-circuit-card__count">{circuit.assignedAppliances.length}</span>
                  <button
                    className="sidebar-circuit-card__expand"
                    onClick={(e) => { e.stopPropagation(); setExpandedCardId(isExpanded ? null : circuit.id); }}
                    title={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
                  >{isExpanded ? '▴' : '▾'}</button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="sidebar-circuit-card__body">
                    <div className="sidebar-card-controls">
                      <div className="sidebar-card-field">
                        <label>{t('planner.voltage')}</label>
                        <div className="voltage-toggle voltage-toggle--small">
                          <button className={circuit.voltage === 110 ? 'active' : ''} onClick={() => onChangeVoltage(circuit.id, 110)}>110V</button>
                          <button className={circuit.voltage === 220 ? 'active' : ''} onClick={() => onChangeVoltage(circuit.id, 220)}>220V</button>
                        </div>
                      </div>

                      {showPhase && (
                        <div className="sidebar-card-field">
                          <label>{t('planner.phase')}</label>
                          <div className="phase-toggle phase-toggle--small">
                            <button className={circuit.phase === 'R' ? 'active phase-r' : ''} onClick={() => onChangePhase?.(circuit.id, 'R')} disabled={level.phaseMode === 'auto'}>R</button>
                            <button className={circuit.phase === 'T' ? 'active phase-t' : ''} onClick={() => onChangePhase?.(circuit.id, 'T')} disabled={level.phaseMode === 'auto'}>T</button>
                          </div>
                        </div>
                      )}

                      <div className="sidebar-card-field">
                        <label>{t('planner.nfb')}</label>
                        <select
                          value={circuit.breaker.ratedCurrent}
                          onChange={e => {
                            const opt = BREAKER_OPTIONS.find(o => o.breaker.ratedCurrent === Number(e.target.value));
                            if (opt) onChangeBreaker(circuit.id, opt.breaker);
                          }}
                        >
                          {BREAKER_OPTIONS.map(opt => (
                            <option key={opt.label} value={opt.breaker.ratedCurrent}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sidebar-card-field">
                        <label>{t('planner.wireLabel')}</label>
                        <select
                          value={circuit.selectedWire?.crossSection ?? ''}
                          onChange={e => {
                            const wire = DEFAULT_WIRES.find(w => w.crossSection === Number(e.target.value));
                            if (wire) onSelectWire(circuit.id, wire);
                          }}
                        >
                          <option value="" disabled>{t('planner.selectWire')}</option>
                          {DEFAULT_WIRES.map(w => (
                            <option key={w.crossSection} value={w.crossSection}>{w.crossSection}mm² ({w.maxCurrent}A)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {hasWetArea && (
                      <label className="sidebar-elcb-toggle">
                        <input
                          type="checkbox"
                          checked={!!circuit.elcbEnabled}
                          onChange={e => onChangeElcb?.(circuit.id, e.target.checked)}
                        />
                        <span>{t('elcb.label')} (${ELCB_COST})</span>
                      </label>
                    )}

                    {/* Assigned appliances grouped by room */}
                    {circuit.assignedAppliances.length > 0 && (
                      <div className="sidebar-card-appliances">
                        {[...appliancesByRoom.entries()].map(([roomId, apps]) => {
                          const room = level.rooms.find(r => r.id === roomId);
                          return (
                            <div key={roomId} className="sidebar-card-room-group">
                              <span className="sidebar-card-room-name">{room ? tRoomName(t, room.name) : roomId}</span>
                              {apps.map((a, i) => (
                                <div key={i} className="sidebar-card-appliance" onClick={() => onUnassignAppliance(circuit.id, circuit.assignedAppliances.indexOf(a))}>
                                  <span>{tApplianceName(t, a.appliance.name)}</span>
                                  <span className="sidebar-card-appliance-current">{(a.appliance.power / a.appliance.voltage).toFixed(1)}A</span>
                                  <span className="sidebar-card-remove">✕</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}

                        {/* Unassigned appliances from rooms assigned to this circuit can be clicked to assign */}
                        {(() => {
                          // Find rooms that have been assigned to this circuit via room click
                          // Show unassigned appliances from those rooms
                          const assignedRoomIds = new Set(circuit.assignedAppliances.map(a => a.roomId));
                          const unassigned: { appliance: Appliance; roomId: string; roomApplianceIndex: number }[] = [];
                          for (const room of level.rooms) {
                            if (!assignedRoomIds.has(room.id)) continue;
                            room.appliances.forEach((appliance, idx) => {
                              const alreadyAssigned = circuits.some(c =>
                                c.assignedAppliances.some(a => a.roomId === room.id && a.roomApplianceIndex === idx)
                              );
                              if (!alreadyAssigned && appliance.voltage === circuit.voltage) {
                                unassigned.push({ appliance, roomId: room.id, roomApplianceIndex: idx });
                              }
                            });
                          }
                          if (unassigned.length === 0) return null;
                          return (
                            <div className="sidebar-card-unassigned">
                              <span className="sidebar-card-unassigned-label">{t('sidebar.unassigned')}</span>
                              {unassigned.map((item, i) => (
                                <div
                                  key={i}
                                  className="sidebar-card-appliance sidebar-card-appliance--unassigned"
                                  onClick={() => onAssignAppliance(item.appliance, item.roomId, item.roomApplianceIndex)}
                                >
                                  <span>{tApplianceName(t, item.appliance.name)}</span>
                                  <span className="sidebar-card-appliance-current">{(item.appliance.power / item.appliance.voltage).toFixed(1)}A</span>
                                  <span className="sidebar-card-assign">+</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className="sidebar-card-footer">
                      <span>${wireCost + nfbCost + elcbCost}</span>
                      <button
                        className="sidebar-card-delete-btn"
                        onClick={() => onDeleteCircuit(circuit.id)}
                      >{t('planner.deleteCircuit')}</button>
                    </div>
                  </div>
                )}

                {/* Load bar */}
                {wireCapacity > 0 && (
                  <div className="sidebar-circuit-card__loadbar">
                    <div
                      className="sidebar-circuit-card__loadbar-fill"
                      style={{ width: `${Math.min(loadRatio * 100, 100)}%`, background: loadColor }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm button */}
      <div className="sidebar-planner__footer">
        <button
          className="sidebar-confirm-btn"
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
