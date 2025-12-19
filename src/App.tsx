import { useMemo, useState } from "react";
import type { Circuit, ConsumerUnit, Point, PointType, Project, Room } from "./types";
import {
  buttonStyle,
  calcCircuit,
  cardStyle,
  inputStyle,
  pageStyle,
  summarizePerCu,
  uid,
  ui,
} from "./utils";
import { CircuitEditor } from "./components/CircuitEditor";
import { PointCard } from "./components/PointCard";
import { ScheduleView } from "./components/ScheduleView";
import { exportEicPdf } from "./pdf/exportEicPdf";

function makeDefaultCircuit(cuId: string, name: string, nominalVoltage_V: number): Circuit {
  return {
    id: uid(),
    cuId,
    name,

    breakerCurve: "B",
    In_A: 32,
    Ib_A: 0,
    Iz_A: 37,

    length_m: 25,
    mvPerAmpPerM: 11,

    Ze_design_ohm: 0.35,
    R1R2_design_ohm: 0.45,

    voltDropLimit_percent: 5,
    nominalVoltage_V,

    Zs_measured_ohm: 0,

    earthing: "TN",
    deviceType: "MCB",
    maxDisconnectionTime_s: 0,

    maxZs_device_ohm: 0,

    rcd_I_delta_n_mA: 30,
    rcd_1x_0deg_ms: 0,
    rcd_1x_180deg_ms: 0,

    ir_500v_MOhm: 0,
    ir_250v_MOhm: 0,

    polarityPass: true,
    polarityNotes: "",

    pfc_kA: 0,
    Ze_measured_ohm: 0,

    R1_e2e_ohm: 0,
    RN_e2e_ohm: 0,
    R2_e2e_ohm: 0,

    notesText: "",
  };
}

function makeInitialProject(): Project {
  const cu: ConsumerUnit = { id: uid(), name: "Main CU" };
  const living: Room = { id: uid(), name: "Living Room" };
  const c1 = makeDefaultCircuit(cu.id, "Circuit 1", 230);

  const presets: Record<PointType, number> = {
    Socket: 100,
    Light: 60,
    Switch: 0,
    Data: 0,
    Cooker: 3000,
    Shower: 8500,
  };

  return {
    id: uid(),
    name: "Project 1",
    nominalVoltage_V: 230,
    originZe_ohm: 0.35,
    pfc_kA: 0,

    consumerUnits: [cu],
    circuits: [c1],
    rooms: [living],
    points: [],

    selectedCuId: cu.id,
    selectedCircuitId: c1.id,
    selectedRoomId: living.id,

    pointPresets_W: presets,
  };
}

export default function App() {
  const [view, setView] = useState<"design" | "schedule">("design");
  const [project, setProject] = useState<Project>(() => makeInitialProject());
  const [pointsOpen, setPointsOpen] = useState(true);

  const selectedCu = project.consumerUnits.find((c) => c.id === project.selectedCuId) ?? project.consumerUnits[0];
  const circuitsInCu = project.circuits.filter((c) => c.cuId === selectedCu.id);

  const selectedCircuit =
    project.selectedCircuitId
      ? project.circuits.find((c) => c.id === project.selectedCircuitId) ?? circuitsInCu[0]
      : circuitsInCu[0];

  const selectedRoom = project.rooms.find((r) => r.id === project.selectedRoomId) ?? project.rooms[0];

  const selectedCircuitCalc = useMemo(() => {
    if (!selectedCircuit) return null;
    const pts = project.points.filter((p) => p.circuitId === selectedCircuit.id);
    return calcCircuit(project, selectedCircuit, pts);
  }, [project, selectedCircuit]);

  const cuSummary = useMemo(() => summarizePerCu(project), [project]);

  function updateProject(patch: Partial<Project>) {
    setProject((prev) => ({ ...prev, ...patch }));
  }

  function updateCircuit(circuitId: string, patch: Partial<Circuit>) {
    setProject((prev) => ({
      ...prev,
      circuits: prev.circuits.map((c) => (c.id === circuitId ? { ...c, ...patch } : c)),
    }));
  }

  function addCu() {
    const cu: ConsumerUnit = { id: uid(), name: `CU ${project.consumerUnits.length + 1}` };
    setProject((prev) => ({
      ...prev,
      consumerUnits: [...prev.consumerUnits, cu],
      selectedCuId: cu.id,
      selectedCircuitId: null,
    }));
  }

  function deleteSelectedCu() {
    if (project.consumerUnits.length <= 1) return;
    const cuId = project.selectedCuId;

    const hasCircuits = project.circuits.some((c) => c.cuId === cuId);
    if (hasCircuits) {
      alert("This CU still has circuits. Remove/move circuits first.");
      return;
    }

    const remainingCus = project.consumerUnits.filter((c) => c.id !== cuId);
    setProject((prev) => ({
      ...prev,
      consumerUnits: remainingCus,
      selectedCuId: remainingCus[0].id,
      selectedCircuitId: null,
    }));
  }

  function addCircuit() {
    const cuId = project.selectedCuId;
    const name = `Circuit ${project.circuits.filter((c) => c.cuId === cuId).length + 1}`;
    const c = makeDefaultCircuit(cuId, name, project.nominalVoltage_V);

    setProject((prev) => ({
      ...prev,
      circuits: [...prev.circuits, c],
      selectedCircuitId: c.id,
    }));
  }

  function removeSelectedCircuit() {
    if (!project.selectedCircuitId) return;
    if (project.circuits.length <= 1) return;

    const cid = project.selectedCircuitId;
    const remaining = project.circuits.filter((c) => c.id !== cid);
    const fallback = remaining[0]?.id ?? null;

    setProject((prev) => ({
      ...prev,
      circuits: remaining,
      points: prev.points.map((p) => (p.circuitId === cid ? { ...p, circuitId: fallback ?? p.circuitId } : p)),
      selectedCircuitId: fallback,
    }));
  }

  function addRoom() {
    const r: Room = { id: uid(), name: `Room ${project.rooms.length + 1}` };
    setProject((prev) => ({
      ...prev,
      rooms: [...prev.rooms, r],
      selectedRoomId: r.id,
    }));
  }

  function addPoint() {
    const circuitId = project.selectedCircuitId ?? project.circuits[0].id;
    const p: Point = {
      id: uid(),
      roomId: project.selectedRoomId,
      circuitId,
      type: "Socket",
      label: "New point",
      load_W: project.pointPresets_W["Socket"],
    };
    setProject((prev) => ({ ...prev, points: [...prev.points, p] }));
    setPointsOpen(true);
  }

  const pointsInRoom = project.points.filter((p) => p.roomId === selectedRoom.id);

  return (
    <div style={pageStyle()}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: "6px 0 2px", fontSize: 34, letterSpacing: -0.5 }}>
            Electrical Installation Design Assistant
          </h1>
          <p style={{ margin: 0, color: ui.colors.muted }}>
            Draft app • user-entered limits • schedule + PDF export
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setView("design")} style={buttonStyle({ variant: "secondary", active: view === "design" })}>
            Design view
          </button>
          <button onClick={() => setView("schedule")} style={buttonStyle({ variant: "secondary", active: view === "schedule" })}>
            EIC / Schedule
          </button>
          <button onClick={() => exportEicPdf(project)} style={buttonStyle({ variant: "primary" })}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Top cards */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "minmax(360px, 1fr) minmax(360px, 1fr)", gap: 14 }}>
        <div style={cardStyle()}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Project</div>
          <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
            <span>Project name</span>
            <input value={project.name} onChange={(e) => updateProject({ name: e.target.value })} style={inputStyle()} />
          </label>
        </div>

        <div style={cardStyle()}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Supply / Origin</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 10 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              <span>Nominal voltage Uo (V)</span>
              <input type="number" value={project.nominalVoltage_V} onChange={(e) => updateProject({ nominalVoltage_V: Number(e.target.value) })} style={inputStyle()} />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              <span>Ze at origin (Ω)</span>
              <input type="number" step="0.001" value={project.originZe_ohm} onChange={(e) => updateProject({ originZe_ohm: Number(e.target.value) })} style={inputStyle()} />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
              <span>PFC at origin (kA)</span>
              <input type="number" step="0.01" value={project.pfc_kA} onChange={(e) => updateProject({ pfc_kA: Number(e.target.value) })} style={inputStyle()} />
            </label>
          </div>
        </div>
      </div>

      {/* CU Summary */}
      <div style={{ marginTop: 14, ...cardStyle() }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Consumer Unit pass/fail summary</div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["CU", "Circuits", "Pass", "Fail", "N/A", "Overall"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px", background: ui.colors.surface }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cuSummary.map((s) => (
                <tr key={s.cuId}>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px" }}>{s.cuName}</td>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px" }}>{s.totalCircuits}</td>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px" }}>{s.passCount}</td>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px" }}>{s.failCount}</td>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px" }}>{s.naCount}</td>
                  <td style={{ borderBottom: `1px solid ${ui.colors.border}`, padding: "10px 8px", fontWeight: 900 }}>
                    {s.overall.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main view */}
      {view === "schedule" ? (
        <div style={{ marginTop: 16 }}>
          <ScheduleView project={project} />
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "minmax(340px, 380px) 1fr", gap: 18, alignItems: "start" }}>
          {/* Sidebar */}
          <div style={cardStyle()}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Consumer Units</div>

            <select
              value={project.selectedCuId}
              onChange={(e) => updateProject({ selectedCuId: e.target.value, selectedCircuitId: null })}
              style={inputStyle()}
            >
              {project.consumerUnits.map((cu) => (
                <option key={cu.id} value={cu.id}>
                  {cu.name}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button onClick={addCu} style={buttonStyle({ variant: "ghost", fullWidth: true })}>
                + Add CU
              </button>
              <button
                onClick={deleteSelectedCu}
                disabled={project.consumerUnits.length <= 1}
                style={buttonStyle({ variant: "danger", fullWidth: true, disabled: project.consumerUnits.length <= 1 })}
              >
                Delete CU
              </button>
            </div>

            <div style={{ marginTop: 16, fontWeight: 900 }}>Circuits</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {circuitsInCu.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateProject({ selectedCircuitId: c.id })}
                  style={{
                    textAlign: "left",
                    padding: "10px",
                    borderRadius: 12,
                    border: c.id === selectedCircuit?.id ? "2px solid #111" : `1px solid ${ui.colors.border}`,
                    background: c.id === selectedCircuit?.id ? ui.colors.surface2 : "#fff",
                    cursor: "pointer",
                    color: ui.colors.text,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: ui.colors.muted }}>
                    {c.breakerCurve}{c.In_A} • Iz {c.Iz_A}A
                  </div>
                </button>
              ))}

              <button onClick={addCircuit} style={buttonStyle({ variant: "ghost", fullWidth: true })}>
                + Add circuit
              </button>

              <button
                onClick={removeSelectedCircuit}
                disabled={project.circuits.length <= 1}
                style={buttonStyle({ variant: "danger", fullWidth: true, disabled: project.circuits.length <= 1 })}
              >
                Remove selected circuit
              </button>
            </div>

            <div style={{ marginTop: 16, fontWeight: 900 }}>Rooms</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <select
                value={project.selectedRoomId}
                onChange={(e) => updateProject({ selectedRoomId: e.target.value })}
                style={inputStyle()}
              >
                {project.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <button onClick={addRoom} style={buttonStyle({ variant: "ghost", fullWidth: true })}>
                + Add room
              </button>

              <button onClick={addPoint} style={buttonStyle({ variant: "primary", fullWidth: true })}>
                + Add point
              </button>
            </div>
          </div>

          {/* Editor */}
          <div style={cardStyle()}>
            {selectedCircuit && selectedCircuitCalc ? (
              <CircuitEditor
                project={project}
                circuit={selectedCircuit}
                calc={selectedCircuitCalc}
                onChange={(patch) => updateCircuit(selectedCircuit.id, patch)}
              />
            ) : (
              <div>No circuit selected.</div>
            )}

            {/* Rooms & Points (collapsible, less cramped) */}
            <div style={{ marginTop: 18, borderTop: `1px solid ${ui.colors.border}`, paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>Rooms & Points</div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: ui.colors.muted }}>Presets apply default W per point type.</span>
                  <button
                    type="button"
                    onClick={() => setPointsOpen((v) => !v)}
                    style={buttonStyle({ variant: "secondary", size: "sm" })}
                  >
                    {pointsOpen ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {pointsOpen && (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {pointsInRoom.length === 0 ? (
                    <div style={{ padding: 12, border: `1px dashed ${ui.colors.border}`, borderRadius: 12, color: ui.colors.muted }}>
                      No points in this room yet. Click <strong style={{ color: ui.colors.text }}>+ Add point</strong>.
                    </div>
                  ) : (
                    pointsInRoom.map((p) => (
                      <PointCard
                        key={p.id}
                        project={project}
                        point={p}
                        onChange={(patch) =>
                          setProject((prev) => ({
                            ...prev,
                            points: prev.points.map((x) => (x.id === p.id ? { ...x, ...patch } : x)),
                          }))
                        }
                        onApplyPreset={() =>
                          setProject((prev) => ({
                            ...prev,
                            points: prev.points.map((x) =>
                              x.id === p.id ? { ...x, load_W: prev.pointPresets_W[x.type] ?? x.load_W } : x
                            ),
                          }))
                        }
                        onDelete={() =>
                          setProject((prev) => ({
                            ...prev,
                            points: prev.points.filter((x) => x.id !== p.id),
                          }))
                        }
                      />
                    ))
                  )}

                  <div style={{ fontSize: 12, color: ui.colors.muted }}>
                    Tip: Assign points to circuits — Ib updates automatically in the calculations.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
