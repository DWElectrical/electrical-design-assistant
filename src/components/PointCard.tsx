import type { Point, PointType, Project } from "../types";
import { buttonStyle, inputStyle, labelStyle, ui } from "../utils";

export function PointCard({
  project,
  point,
  onChange,
  onDelete,
  onApplyPreset,
}: {
  project: Project;
  point: Point;
  onChange: (patch: Partial<Point>) => void;
  onDelete: () => void;
  onApplyPreset: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${ui.colors.border}`,
        borderRadius: 12,
        padding: 12,
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "160px 1fr 140px 260px 160px",
        gap: 10,
        alignItems: "end",
      }}
    >
      <label style={labelStyle()}>
        <span>Point type</span>
        <select
          value={point.type}
          onChange={(e) => onChange({ type: e.target.value as PointType })}
          style={inputStyle()}
        >
          {(["Socket", "Light", "Switch", "Data", "Cooker", "Shower"] as PointType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle()}>
        <span>Label</span>
        <input value={point.label} onChange={(e) => onChange({ label: e.target.value })} style={inputStyle()} />
      </label>

      <label style={labelStyle()}>
        <span>Load (W)</span>
        <input
          type="number"
          min={0}
          step="1"
          value={point.load_W}
          onChange={(e) => onChange({ load_W: Number(e.target.value) })}
          style={inputStyle()}
        />
      </label>

      <label style={labelStyle()}>
        <span>Circuit assignment</span>
        <select value={point.circuitId} onChange={(e) => onChange({ circuitId: e.target.value })} style={inputStyle()}>
          {project.circuits.map((c) => (
            <option key={c.id} value={c.id}>
              {project.consumerUnits.find((cu) => cu.id === c.cuId)?.name ?? "CU"} — {c.name}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: "grid", gap: 8 }}>
        <button type="button" onClick={onApplyPreset} style={buttonStyle({ variant: "ghost" })}>
          Apply preset
        </button>
        <button type="button" onClick={onDelete} style={buttonStyle({ variant: "danger" })}>
          Delete point
        </button>
      </div>
    </div>
  );
}
