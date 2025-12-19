import type { Project } from "../types";
import { calcCircuit, overallCircuitState, round } from "../utils";

export function ScheduleView({ project }: { project: Project }) {
  const cuById = new Map(project.consumerUnits.map((c) => [c.id, c]));

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 16, padding: 18, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <h2 style={{ margin: "0 0 6px" }}>EIC / Schedule (Draft)</h2>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Project: <strong>{project.name}</strong> • Uo {project.nominalVoltage_V}V • Ze {project.originZe_ohm}Ω • PFC {project.pfc_kA}kA
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {[
                "CU",
                "Circuit",
                "Device",
                "Ib (A)",
                "Iz (A)",
                "VD (%)",
                "Zs meas (Ω)",
                "Max Zs device (Ω)",
                "Overall",
                "Notes",
              ].map((h) => (
                <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "10px 8px", background: "#fafafa" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {project.circuits.map((c) => {
              const pts = project.points.filter((p) => p.circuitId === c.id);
              const calc = calcCircuit(project, c, pts);
              const overall = overallCircuitState(calc);
              return (
                <tr key={c.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{cuById.get(c.cuId)?.name ?? "CU"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{c.name}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{c.breakerCurve}{c.In_A}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{calc.Ib_A}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{c.Iz_A}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{calc.voltDrop_percent}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{c.Zs_measured_ohm > 0 ? round(c.Zs_measured_ohm, 3) : ""}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{c.maxZs_device_ohm > 0 ? round(c.maxZs_device_ohm, 3) : ""}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px", fontWeight: 900 }}>
                    {overall.toUpperCase()}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px", maxWidth: 260 }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{c.notesText || ""}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3 style={{ margin: "0 0 8px" }}>Points schedule</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Room", "Type", "Label", "Load (W)", "Circuit"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "10px 8px", background: "#fafafa" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.points.map((p) => (
                <tr key={p.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>
                    {project.rooms.find((r) => r.id === p.roomId)?.name ?? ""}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{p.type}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{p.label}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>{p.load_W}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "10px 8px" }}>
                    {project.circuits.find((c) => c.id === p.circuitId)?.name ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
