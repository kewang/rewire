import { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Wire, WiringState } from '../types/game';

interface WireToolbarProps {
  wires: readonly Wire[];
  wiring: WiringState;
  disabled: boolean;
  onDragStart: (wire: Wire) => void;
  onDragMove: (pos: { x: number; y: number } | null) => void;
  onDragEnd: (dropped: boolean) => void;
  /** Power button state */
  isPowered: boolean;
  canPowerOn: boolean;
  onPowerToggle: () => void;
  powerTooltip?: string;
}

/** Wire gauge → color mapping */
const WIRE_COLORS: Record<number, string> = {
  1.6: '#93c5fd',
  2.0: '#86efac',
  3.5: '#fde047',
  5.5: '#fdba74',
  8: '#f87171',
  14: '#c084fc',
};

const LONG_PRESS_MS = 150;

export default function WireToolbar({
  wires, wiring, disabled,
  onDragStart, onDragMove, onDragEnd,
  isPowered, canPowerOn, onPowerToggle, powerTooltip,
}: WireToolbarProps) {
  const { t } = useTranslation();
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const capturedEl = useRef<HTMLElement | null>(null);
  const capturedPointerId = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const releaseCapture = useCallback(() => {
    if (capturedEl.current && capturedPointerId.current !== null) {
      try { capturedEl.current.releasePointerCapture(capturedPointerId.current); } catch { /* already released */ }
    }
    capturedEl.current = null;
    capturedPointerId.current = null;
  }, []);

  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      onDragMove({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isOverDropZone = !!el?.closest('.circuit-diagram') || !!el?.closest('.floor-plan-view');
      draggingRef.current = false;
      startPos.current = null;
      onDragEnd(isOverDropZone);
    };

    document.addEventListener('pointermove', handleGlobalMove, { passive: false });
    document.addEventListener('pointerup', handleGlobalUp);
    document.addEventListener('pointercancel', handleGlobalUp);

    return () => {
      document.removeEventListener('pointermove', handleGlobalMove);
      document.removeEventListener('pointerup', handleGlobalUp);
      document.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [onDragMove, onDragEnd]);

  // Detect if cards overflow for scroll affordance
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wires.length]);

  const beginDrag = useCallback((wire: Wire, el: HTMLElement) => {
    draggingRef.current = true;
    releaseCapture();
    onDragStart(wire);
    el.style.userSelect = 'none';
  }, [onDragStart, releaseCapture]);

  const handlePointerDown = useCallback((e: React.PointerEvent, wire: Wire) => {
    if (disabled) return;
    e.preventDefault();
    startPos.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = false;

    const el = e.currentTarget as HTMLElement;
    capturedEl.current = el;
    capturedPointerId.current = e.pointerId;
    el.setPointerCapture(e.pointerId);

    if (e.pointerType === 'touch') {
      longPressTimer.current = setTimeout(() => {
        beginDrag(wire, el);
      }, LONG_PRESS_MS);
    }
  }, [disabled, beginDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent, wire: Wire) => {
    if (disabled) return;

    if (!draggingRef.current && e.pointerType !== 'touch' && startPos.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > 9) {
        beginDrag(wire, e.currentTarget as HTMLElement);
      }
    }

    if (!draggingRef.current && e.pointerType === 'touch' && startPos.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > 100) {
        clearTimer();
      }
    }
  }, [disabled, beginDrag, clearTimer]);

  const handlePointerUp = useCallback(() => {
    clearTimer();
    releaseCapture();
    if (!draggingRef.current) {
      startPos.current = null;
    }
  }, [clearTimer, releaseCapture]);

  return (
    <div className="wire-toolbar">
      <div className={`wire-toolbar__cards-wrap${isScrollable ? ' wire-toolbar__cards-wrap--scrollable' : ''}`}>
      <div className="wire-toolbar__cards" ref={cardsRef}>
        {wires.map((w) => {
          const wireColor = WIRE_COLORS[w.crossSection] ?? '#888';
          const isSelected = wiring.connectedWire?.crossSection === w.crossSection;
          const isDragging = wiring.isDragging && wiring.dragWire?.crossSection === w.crossSection;
          return (
            <div
              key={w.crossSection}
              className={`wire-toolbar__card${isSelected ? ' wire-toolbar__card--selected' : ''}${isDragging ? ' wire-toolbar__card--dragging' : ''}`}
              onPointerDown={(e) => handlePointerDown(e, w)}
              onPointerMove={(e) => handlePointerMove(e, w)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
              data-disabled={disabled || undefined}
            >
              <span
                className="wire-toolbar__dot"
                style={{ background: wireColor }}
              />
              <span className="wire-toolbar__gauge">{w.crossSection}mm²</span>
              <span className="wire-toolbar__spec">{w.maxCurrent}A</span>
              <span className="wire-toolbar__cost">${w.costPerMeter}{t('wire.perMeter')}</span>
            </div>
          );
        })}
      </div>
      </div>

      <button
        className={`wire-toolbar__power${isPowered ? ' wire-toolbar__power--on' : ''}`}
        disabled={!isPowered && !canPowerOn}
        onClick={onPowerToggle}
        title={!isPowered && !canPowerOn ? powerTooltip : undefined}
      >
        {isPowered ? t('game.powerOff') : t('game.powerOn')}
      </button>
    </div>
  );
}
