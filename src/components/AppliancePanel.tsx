import type { Appliance } from '../types/game';

interface AppliancePanelProps {
  available: readonly Appliance[];
  plugged: readonly Appliance[];
  onAdd: (appliance: Appliance) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}

export default function AppliancePanel({ available, plugged, onAdd, onRemove, disabled }: AppliancePanelProps) {
  return (
    <div className="appliance-panel">
      <h3>電器</h3>
      <div className="card-list">
        {available.map((a) => (
          <button
            key={a.name}
            className="card"
            onClick={() => onAdd(a)}
            disabled={disabled}
          >
            <div className="card-title">{a.name}</div>
            <div className="card-detail">{a.power}W / {a.voltage}V</div>
            <div className="card-detail">≈ {(a.power / a.voltage).toFixed(1)}A</div>
          </button>
        ))}
      </div>

      {plugged.length > 0 && (
        <>
          <h4>已插入插座</h4>
          <div className="card-list">
            {plugged.map((a, i) => (
              <button
                key={i}
                className="card plugged"
                onClick={() => onRemove(i)}
                disabled={disabled}
              >
                <div className="card-title">{a.name}</div>
                <div className="card-detail">{(a.power / a.voltage).toFixed(1)}A</div>
                <div className="card-hint">點擊移除</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
