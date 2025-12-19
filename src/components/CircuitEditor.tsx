import { useState } from "react";
import type { Circuit, CircuitCalc } from "../types";
import {
  badgeStyle,
  buttonStyle,
  inputStyle,
  labelStyle,
  overallCircuitState,
  panelStyle,
  subCardStyle,
  ui,
} from "../utils";
import { TestPanel } from "./TestPanel";

export function CircuitEditor({
  circuit,
  calc,
  onChange,
}: {
  circuit: Circuit;
  calc: CircuitCalc;
  onChange: (patch: Partial<Circuit>) => void;
}) {
  const overall = overallCircuitState(calc);
  const [tab, setTab] = useState<"design" | "tests" | "notes">("design");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Top row: name + badges */}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={circuit.name}
            onChange={(e) => onChange({ name: e.target.value })}
            style={inputStyle({ fontSize: 16, fontWeight: 900, flex: "1 1 380px" })}
          />

          <span style={badgeStyle(overall)}>OVERALL: {overall.toUpperCase()}</span>
          <span style={badgeStyle(calc.passesVoltDrop)}>VD</span>
          <span style={badgeStyle(calc.passesIbInIz)}>Ib/In/Iz</span>
          <span style={badgeStyle(calc.passesZs_meas_device)}>Zs(meas≤dev)</span>
          <span style={badgeStyle(calc.IR_state)}>IR</span>
          <span style={badgeStyle(calc.RCD_state)}>RCD 1×</span>
          <span style={badgeStyle(calc.polarity_state)}>Polarity</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setTab("design")} style={buttonStyle({ variant: "secondary", active: tab === "design" })}>
            Design
          </button>
          <button type="button" onClick={() => setTab("tests")} style={buttonStyle({ variant: "secondary", active: tab === "tests" })}>
            Tests
          </button>
          <button type="button" onClick={() => setTab("notes")} style={buttonStyle({ variant: "secondary", active: tab === "notes" })}>
            Notes
          </button>
        </div>
      </div>

      {/* DESIGN */}
      {tab === "design" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) minmax(360px, 1.35fr) minmax(280px, 1fr)",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* Protective device */}
          <div style={subCardStyle()}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Protective device</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={labelStyle()}>
                <span>Breaker curve</span>
                <select
                  value={circuit.breakerCurve}
                  onChange={(e) => onChange({ breakerCurve: e.target.value as any })}
                  style={inputStyle()}
                >
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>

              <label style={labelStyle()}>
                <span>In (A)</span>
                <input
                  type="number"
                  value={circuit.In_A}
                  onChange={(e) => onChange({ In_A: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: ui.colors.muted }}>
              Device rating and curve for this circuit.
            </div>
          </div>

          {/* Design / cable */}
          <div style={subCardStyle()}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Design / cable</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <label style={labelStyle()}>
                <span>Ib (A) (auto from points)</span>
                <input type="number" value={calc.Ib_A} readOnly style={inputStyle({ background: ui.colors.surface, fontWeight: 800 })} />
              </label>

              <label style={labelStyle()}>
                <span>Iz (A) effective</span>
                <input
                  type="number"
                  value={circuit.Iz_A}
                  onChange={(e) => onChange({ Iz_A: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>

              <label style={labelStyle()}>
                <span>Volt drop limit (%)</span>
                <input
                  type="number"
                  step="0.1"
                  value={circuit.voltDropLimit_percent}
                  onChange={(e) => onChange({ voltDropLimit_percent: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>

              <label style={labelStyle()}>
                <span>Length (m)</span>
                <input
                  type="number"
                  step="0.1"
                  value={circuit.length_m}
                  onChange={(e) => onChange({ length_m: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>

              <label style={labelStyle()}>
                <span>mV/A/m</span>
                <input
                  type="number"
                  step="0.1"
                  value={circuit.mvPerAmpPerM}
                  onChange={(e) => onChange({ mvPerAmpPerM: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>

              <label style={labelStyle()}>
                <span>R1+R2 (design) (Ω)</span>
                <input
                  type="number"
                  step="0.001"
                  value={circuit.R1R2_design_ohm}
                  onChange={(e) => onChange({ R1R2_design_ohm: Number(e.target.value) })}
                  style={inputStyle()}
                />
              </label>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: ui.colors.muted, lineHeight: 1.5 }}>
              These are design/estimate inputs. Enter your values from permitted sources.
            </div>
          </div>

          {/* Quick results */}
          <div style={subCardStyle()}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Quick results</div>

            <div style={{ display: "grid", gap: 6, fontSize: 13, lineHeight: 1.6 }}>
              <div>
                Volt drop: <strong>{calc.voltDrop_V} V</strong> (<strong>{calc.voltDrop_percent}%</strong>)
              </div>
              <div>
                Zs (calc): <strong>{calc.Zs_calc_ohm} Ω</strong>
              </div>
              <div>
                Zs (meas): <strong>{calc.Zs_measured_ohm > 0 ? calc.Zs_measured_ohm : "—"}</strong>
              </div>
              <div>
                Max Zs device: <strong>{circuit.maxZs_device_ohm > 0 ? circuit.maxZs_device_ohm : "—"}</strong>
              </div>

              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${ui.colors.border}`, color: ui.colors.muted }}>
                {calc.notes.map((n, i) => (
                  <div key={i}>• {n}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TESTS */}
      {tab === "tests" && (
        <div style={panelStyle()}>
          <TestPanel circuit={circuit} onChange={onChange} />
        </div>
      )}

      {/* NOTES */}
      {tab === "notes" && (
        <div style={panelStyle()}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Circuit notes / remarks</div>

          <textarea
            value={circuit.notesText}
            onChange={(e) => onChange({ notesText: e.target.value })}
            placeholder="Special locations, deviations, limitations, unusual readings, client requests, temporary supplies, etc."
            rows={8}
            style={inputStyle({ resize: "vertical", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 })}
          />

          <div style={{ marginTop: 8, fontSize: 12, color: ui.colors.muted }}>
            Saved per circuit (shows in EIC/Schedule and PDF export).
          </div>
        </div>
      )}
    </div>
  );
}
