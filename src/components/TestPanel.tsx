import type { Circuit } from "../types";
import { inputStyle, labelStyle, ui } from "../utils";

export function TestPanel({
  circuit,
  onChange,
}: {
  circuit: Circuit;
  onChange: (patch: Partial<Circuit>) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Disconnection regime */}
      <div style={{ border: `1px solid ${ui.colors.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Disconnection-time regime (your entered limits)</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 10 }}>
          <label style={labelStyle()}>
            <span>Earthing system</span>
            <select value={circuit.earthing} onChange={(e) => onChange({ earthing: e.target.value as any })} style={inputStyle()}>
              <option value="TN">TN</option>
              <option value="TT">TT</option>
            </select>
          </label>

          <label style={labelStyle()}>
            <span>Device type</span>
            <select value={circuit.deviceType} onChange={(e) => onChange({ deviceType: e.target.value as any })} style={inputStyle()}>
              <option value="MCB">MCB</option>
              <option value="RCBO">RCBO</option>
              <option value="RCD">RCD</option>
            </select>
          </label>

          <label style={labelStyle()}>
            <span>Max disconnection time (s)</span>
            <input
              type="number"
              step="0.01"
              value={circuit.maxDisconnectionTime_s}
              onChange={(e) => onChange({ maxDisconnectionTime_s: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>
        </div>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "minmax(240px, 1fr) 2fr", gap: 10, alignItems: "end" }}>
          <label style={labelStyle()}>
            <span>Max Zs for this device (Ω)</span>
            <input
              type="number"
              step="0.001"
              value={circuit.maxZs_device_ohm}
              onChange={(e) => onChange({ maxZs_device_ohm: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>

          <div style={{ fontSize: 12, color: ui.colors.muted, lineHeight: 1.5 }}>
            If both are entered, we check: <strong>Measured Zs ≤ Max Zs device</strong>. We don’t embed tables/curves — you enter your chosen limits.
          </div>
        </div>
      </div>

      {/* Measured tests */}
      <div style={{ border: `1px solid ${ui.colors.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Measured tests</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 10 }}>
          <label style={labelStyle()}>
            <span>Zs measured (Ω)</span>
            <input
              type="number"
              step="0.001"
              value={circuit.Zs_measured_ohm}
              onChange={(e) => onChange({ Zs_measured_ohm: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>

          <label style={labelStyle()}>
            <span>IR @ 500V (MΩ)</span>
            <input
              type="number"
              step="0.1"
              value={circuit.ir_500v_MOhm}
              onChange={(e) => onChange({ ir_500v_MOhm: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>

          <label style={labelStyle()}>
            <span>IR @ 250V (MΩ)</span>
            <input
              type="number"
              step="0.1"
              value={circuit.ir_250v_MOhm}
              onChange={(e) => onChange({ ir_250v_MOhm: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>
        </div>
      </div>

      {/* RCD 1x */}
      <div style={{ border: `1px solid ${ui.colors.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>RCD test (1× IΔn)</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 10 }}>
          <label style={labelStyle()}>
            <span>IΔn (mA)</span>
            <input
              type="number"
              step="1"
              value={circuit.rcd_I_delta_n_mA}
              onChange={(e) => onChange({ rcd_I_delta_n_mA: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>

          <label style={labelStyle()}>
            <span>1× @ 0° (ms)</span>
            <input
              type="number"
              step="1"
              value={circuit.rcd_1x_0deg_ms}
              onChange={(e) => onChange({ rcd_1x_0deg_ms: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>

          <label style={labelStyle()}>
            <span>1× @ 180° (ms)</span>
            <input
              type="number"
              step="1"
              value={circuit.rcd_1x_180deg_ms}
              onChange={(e) => onChange({ rcd_1x_180deg_ms: Number(e.target.value) })}
              style={inputStyle()}
            />
          </label>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: ui.colors.muted }}>
          Only 1× shown for now. We can add 5× and ramp later.
        </div>
      </div>

      {/* Polarity */}
      <div style={{ border: `1px solid ${ui.colors.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Polarity</div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={circuit.polarityPass}
            onChange={(e) => onChange({ polarityPass: e.target.checked })}
          />
          Polarity PASS
        </label>

        <label style={{ ...labelStyle(), marginTop: 10 }}>
          <span>Notes</span>
          <textarea
            value={circuit.polarityNotes}
            onChange={(e) => onChange({ polarityNotes: e.target.value })}
            rows={3}
            style={inputStyle({ resize: "vertical", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 })}
            placeholder="e.g. reversed polarity at … / corrected by …"
          />
        </label>
      </div>

      {/* Continuity */}
      <div style={{ border: `1px solid ${ui.colors.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Continuity / end-to-end (record)</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 10 }}>
          <label style={labelStyle()}>
            <span>R1 end-to-end (Ω)</span>
            <input type="number" step="0.001" value={circuit.R1_e2e_ohm} onChange={(e) => onChange({ R1_e2e_ohm: Number(e.target.value) })} style={inputStyle()} />
          </label>
          <label style={labelStyle()}>
            <span>RN end-to-end (Ω)</span>
            <input type="number" step="0.001" value={circuit.RN_e2e_ohm} onChange={(e) => onChange({ RN_e2e_ohm: Number(e.target.value) })} style={inputStyle()} />
          </label>
          <label style={labelStyle()}>
            <span>R2 end-to-end (Ω)</span>
            <input type="number" step="0.001" value={circuit.R2_e2e_ohm} onChange={(e) => onChange({ R2_e2e_ohm: Number(e.target.value) })} style={inputStyle()} />
          </label>
        </div>
      </div>
    </div>
  );
}
