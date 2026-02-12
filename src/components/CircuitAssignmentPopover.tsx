import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlannerCircuit } from '../types/game';
import { CIRCUIT_COLORS } from './FloorPlanView';

interface CircuitAssignmentPopoverProps {
  readonly roomId: string;
  readonly roomName: string;
  readonly position: { x: number; y: number };
  readonly circuits: readonly PlannerCircuit[];
  readonly currentCircuitId: string | null;
  readonly onAssignToCircuit: (circuitId: string) => void;
  readonly onUnassign: () => void;
  readonly onAddCircuit: () => void;
  readonly onClose: () => void;
  readonly canAddCircuit: boolean;
}

export default function CircuitAssignmentPopover({
  roomName, position, circuits, currentCircuitId,
  onAssignToCircuit, onUnassign, onAddCircuit, onClose, canAddCircuit,
}: CircuitAssignmentPopoverProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [onClose]);

  // Clamp position to stay within viewport with safe margins
  const MARGIN = 8;
  const POPOVER_W = 220;
  const POPOVER_H_ESTIMATE = 40 + circuits.length * 32 + 48; // title + items + add btn
  const maxH = Math.min(POPOVER_H_ESTIMATE, 320);
  const fitsBelow = position.y + maxH + MARGIN <= window.innerHeight;
  const clampedLeft = Math.max(MARGIN, Math.min(position.x, window.innerWidth - POPOVER_W - MARGIN));
  const clampedTop = fitsBelow
    ? Math.max(MARGIN, Math.min(position.y, window.innerHeight - maxH - MARGIN))
    : Math.max(MARGIN, position.y - maxH);
  const style: React.CSSProperties = {
    position: 'fixed',
    left: clampedLeft,
    top: clampedTop,
    zIndex: 1000,
  };

  return (
    <div className="circuit-popover" style={style} ref={ref}>
      <div className="circuit-popover__title">{roomName}</div>

      {currentCircuitId && (
        <button className="circuit-popover__item circuit-popover__item--unassign" onClick={onUnassign}>
          {t('sidebar.unassignRoom')}
        </button>
      )}

      <div className="circuit-popover__divider" />

      {circuits.map((c, index) => {
        const color = CIRCUIT_COLORS[index % CIRCUIT_COLORS.length];
        const isCurrent = c.id === currentCircuitId;
        return (
          <button
            key={c.id}
            className={`circuit-popover__item${isCurrent ? ' circuit-popover__item--current' : ''}`}
            onClick={() => { if (!isCurrent) onAssignToCircuit(c.id); }}
            disabled={isCurrent}
          >
            <span className="circuit-popover__dot" style={{ background: color }} />
            <span className="circuit-popover__label">C{index + 1}</span>
            <span className="circuit-popover__voltage">{c.voltage}V</span>
            {isCurrent && <span className="circuit-popover__check">&#10003;</span>}
          </button>
        );
      })}

      <div className="circuit-popover__divider" />

      <button
        className="circuit-popover__item circuit-popover__item--add"
        onClick={onAddCircuit}
        disabled={!canAddCircuit}
      >
        + {t('planner.addCircuit')}
      </button>
    </div>
  );
}
