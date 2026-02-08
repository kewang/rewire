import { useRef, useCallback, useEffect } from 'react';
import type { Wire, WiringState } from '../types/game';

interface WireSelectorProps {
  wires: readonly Wire[];
  wiring: WiringState;
  disabled: boolean;
  onDragStart: (wire: Wire) => void;
  onDragMove: (pos: { x: number; y: number } | null) => void;
  onDragEnd: (dropped: boolean) => void;
}

const LONG_PRESS_MS = 150;

export default function WireSelector({ wires, wiring, disabled, onDragStart, onDragMove, onDragEnd }: WireSelectorProps) {
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

  // Global listeners for drag tracking after pointer capture is released
  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      onDragMove({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      // Check if released over circuit diagram drop zone
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isOverDiagram = !!el?.closest('.circuit-diagram');
      draggingRef.current = false;
      startPos.current = null;
      onDragEnd(isOverDiagram);
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

  const beginDrag = useCallback((wire: Wire, el: HTMLElement) => {
    draggingRef.current = true;
    releaseCapture();
    onDragStart(wire);
    // Prevent text selection during drag
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
    // Mouse: drag starts on move (see handlePointerMove)
  }, [disabled, beginDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent, wire: Wire) => {
    if (disabled) return;

    // Mouse: start drag after small movement threshold (3px)
    if (!draggingRef.current && e.pointerType !== 'touch' && startPos.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > 9) {
        beginDrag(wire, e.currentTarget as HTMLElement);
      }
    }

    // Touch: cancel long press if moved before threshold
    if (!draggingRef.current && e.pointerType === 'touch' && startPos.current) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dx * dx + dy * dy > 100) {
        clearTimer();
      }
    }
    // Once dragging, global listener handles pointermove
  }, [disabled, beginDrag, clearTimer]);

  const handlePointerUp = useCallback(() => {
    clearTimer();
    releaseCapture();
    // If not dragging, just cleanup (global listener handles active drag)
    if (!draggingRef.current) {
      startPos.current = null;
    }
  }, [clearTimer, releaseCapture]);

  return (
    <div className="wire-selector">
      <h3>線材選擇</h3>
      <div className="card-list">
        {wires.map((w) => (
          <div
            key={w.crossSection}
            className={`card wire-card ${wiring.connectedWire?.crossSection === w.crossSection ? 'selected' : ''} ${wiring.isDragging && wiring.dragWire?.crossSection === w.crossSection ? 'dragging' : ''}`}
            onPointerDown={(e) => handlePointerDown(e, w)}
            onPointerMove={(e) => handlePointerMove(e, w)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
            data-disabled={disabled || undefined}
          >
            <div className="card-title">{w.crossSection} mm²</div>
            <div className="card-detail">安全電流：{w.maxCurrent}A</div>
            <div className="card-detail">成本：${w.costPerMeter}/米</div>
            {!disabled && <div className="card-hint">拖曳到電路圖接線</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
