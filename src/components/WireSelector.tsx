import type { Wire } from '../types/game';

interface WireSelectorProps {
  wires: readonly Wire[];
  selected: Wire;
  onSelect: (wire: Wire) => void;
  disabled: boolean;
}

export default function WireSelector({ wires, selected, onSelect, disabled }: WireSelectorProps) {
  return (
    <div className="wire-selector">
      <h3>線材選擇</h3>
      <div className="card-list">
        {wires.map((w) => (
          <button
            key={w.crossSection}
            className={`card ${w.crossSection === selected.crossSection ? 'selected' : ''}`}
            onClick={() => onSelect(w)}
            disabled={disabled}
          >
            <div className="card-title">{w.crossSection} mm²</div>
            <div className="card-detail">安全電流：{w.maxCurrent}A</div>
            <div className="card-detail">成本：${w.costPerMeter}/米</div>
          </button>
        ))}
      </div>
    </div>
  );
}
