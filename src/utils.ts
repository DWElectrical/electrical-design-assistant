import type { CSSProperties } from "react";
import type { Circuit, CircuitCalc, CuSummary, Point, Project } from "./types";

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function round(n: number, dp = 2) {
  const p = Math.pow(10, dp);
  return Math.round(n * p) / p;
}

export type BadgeState = "pass" | "fail" | "na";

export const ui = {
  colors: {
    bg: "#ffffff",
    text: "#111111",
    muted: "#6b7280",
    border: "#e5e7eb",
    surface: "#fafafa",
    surface2: "#f6f6f6",
    dangerBg: "#fde8e8",
    dangerText: "#9b1c1c",
    okBg: "#e7f7ee",
    okText: "#0b6b2f",
  },
  radius: {
    card: 16,
    box: 12,
    pill: 999,
    input: 12,
  },
};

export function pageStyle(): CSSProperties {
  return {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    padding: 18,
    maxWidth: 1250,
    margin: "0 auto",
    backgroundColor: ui.colors.bg,
    color: ui.colors.text,
  };
}

export function cardStyle(): CSSProperties {
  return {
    border: `1px solid ${ui.colors.border}`,
    borderRadius: ui.radius.card,
    padding: 18,
    background: ui.colors.bg,
  };
}

export function panelStyle(): CSSProperties {
  return {
    border: `1px solid ${ui.colors.border}`,
    borderRadius: ui.radius.card,
    padding: 16,
    background: ui.colors.bg,
  };
}

export function subCardStyle(): CSSProperties {
  return {
    border: `1px solid ${ui.colors.border}`,
    borderRadius: ui.radius.box,
    padding: 14,
    background: ui.colors.bg,
  };
}

export function inputStyle(extra?: CSSProperties): CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: ui.radius.input,
    border: `1px solid ${ui.colors.border}`,
    outline: "none",
    backgroundColor: ui.colors.bg,
    color: ui.colors.text,
    fontSize: 13,
    ...extra,
  };
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function buttonStyle(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}): CSSProperties {
  const variant = opts?.variant ?? "secondary";
  const size = opts?.size ?? "md";
  const active = opts?.active ?? false;

  const pad = size === "sm" ? "8px 10px" : "10px 12px";

  const base: CSSProperties = {
    padding: pad,
    borderRadius: 12,
    border: `1px solid ${ui.colors.border}`,
    background: ui.colors.bg,
    color: ui.colors.text,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    lineHeight: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
    ...(opts?.fullWidth ? { width: "100%" } : null),
    ...(opts?.disabled
      ? { opacity: 0.55, cursor: "not-allowed" }
      : null),
  };

  if (variant === "primary") {
    base.background = "#111111";
    base.border = "1px solid #111111";
    base.color = "#ffffff";
  }

  if (variant === "secondary") {
    base.background = active ? ui.colors.surface2 : ui.colors.bg;
    base.border = active ? "2px solid #111111" : `1px solid ${ui.colors.border}`;
    base.color = ui.colors.text;
  }

  if (variant === "ghost") {
    base.background = ui.colors.bg;
    base.border = `1px solid ${ui.colors.border}`;
    base.color = ui.colors.text;
  }

  if (variant === "danger") {
    base.background = ui.colors.dangerBg;
    base.border = "1px solid #f5b5b5";
    base.color = ui.colors.dangerText;
  }

  // Active override for any variant if needed
  if (active && variant === "ghost") {
    base.border = "2px solid #111111";
    base.background = ui.colors.surface2;
  }

  return base;
}

export function labelStyle(): CSSProperties {
  return { display: "grid", gap: 6, fontSize: 12, color: ui.colors.text };
}

export function helpTextStyle(): CSSProperties {
  return { fontSize: 12, color: ui.colors.muted, lineHeight: 1.5 };
}

export function badgeStyle(state: BadgeState): CSSProperties {
  const ok = state === "pass";
  const na = state === "na";
  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: ui.radius.pill,
    fontSize: 12,
    fontWeight: 900,
    background: na ? "#f3f4f6" : ok ? ui.colors.okBg : ui.colors.dangerBg,
    color: na ? "#374151" : ok ? ui.colors.okText : ui.colors.dangerText,
    border: `1px solid ${na ? ui.colors.border : ok ? "#bde7cc" : "#f5b5b5"}`,
    whiteSpace: "nowrap",
  };
}

export function wattsToAmps(watts: number, volts: number) {
  if (!Number.isFinite(watts) || watts < 0) return 0;
  if (!Number.isFinite(volts) || volts <= 0) return 0;
  return watts / volts;
}

export function calcCircuit(project: Project, c: Circuit, pts: Point[]): CircuitCalc {
  const notes: string[] = [];

  const totalW = pts.reduce(
    (sum, p) => sum + (Number.isFinite(p.load_W) ? p.load_W : 0),
    0
  );
  const Uo = c.nominalVoltage_V || project.nominalVoltage_V;
  const Ib = wattsToAmps(totalW, Uo);

  const voltDrop_V = (c.mvPerAmpPerM * Ib * c.length_m) / 1000;
  const voltDrop_percent = Uo > 0 ? (voltDrop_V / Uo) * 100 : 0;

  const passesVoltDrop: BadgeState =
    c.voltDropLimit_percent > 0
      ? voltDrop_percent <= c.voltDropLimit_percent
        ? "pass"
        : "fail"
      : "na";

  if (passesVoltDrop === "fail") {
    notes.push(
      `Volt drop ${round(voltDrop_percent, 2)}% exceeds limit ${c.voltDropLimit_percent}%.`
    );
  }

  const passesIbInIz: BadgeState =
    c.In_A > 0 && c.Iz_A > 0 ? (Ib <= c.In_A && c.In_A <= c.Iz_A ? "pass" : "fail") : "na";

  if (passesIbInIz === "fail") {
    if (Ib > c.In_A) notes.push(`Ib (${round(Ib, 2)}A) > In (${c.In_A}A).`);
    if (c.In_A > c.Iz_A) notes.push(`In (${c.In_A}A) > Iz (${c.Iz_A}A).`);
  }

  const Zs_calc_ohm = (c.Ze_design_ohm || project.originZe_ohm) + (c.R1R2_design_ohm || 0);
  const passesZs_calc: BadgeState = Zs_calc_ohm > 0 ? "pass" : "na";

  const Zs_measured_ohm = c.Zs_measured_ohm || 0;

  const passesZs_meas_general: BadgeState = Zs_measured_ohm > 0 ? "pass" : "na";

  const passesZs_meas_device: BadgeState =
    Zs_measured_ohm > 0 && c.maxZs_device_ohm > 0
      ? Zs_measured_ohm <= c.maxZs_device_ohm
        ? "pass"
        : "fail"
      : "na";

  if (passesZs_meas_device === "fail") {
    notes.push(
      `Measured Zs (${round(Zs_measured_ohm, 3)}Ω) > Max Zs device (${round(c.maxZs_device_ohm, 3)}Ω).`
    );
  }

  const IR_state: BadgeState =
    c.ir_500v_MOhm > 0 || c.ir_250v_MOhm > 0 ? "pass" : "na";

  const RCD_state: BadgeState =
    c.rcd_1x_0deg_ms > 0 || c.rcd_1x_180deg_ms > 0 ? "pass" : "na";

  const polarity_state: BadgeState = c.polarityPass ? "pass" : "fail";

  if (notes.length === 0) notes.push("No issues flagged for entered values.");

  return {
    Ib_A: round(Ib, 2),

    voltDrop_V: round(voltDrop_V, 2),
    voltDrop_percent: round(voltDrop_percent, 2),
    passesVoltDrop,

    Zs_calc_ohm: round(Zs_calc_ohm, 3),
    passesZs_calc,

    passesIbInIz,

    Zs_measured_ohm: round(Zs_measured_ohm, 3),
    passesZs_meas_general,
    passesZs_meas_device,

    IR_state,
    RCD_state,
    polarity_state,

    notes,
  };
}

export function overallCircuitState(calc: CircuitCalc): BadgeState {
  const checks: BadgeState[] = [
    calc.passesVoltDrop,
    calc.passesIbInIz,
    calc.passesZs_meas_device,
    calc.polarity_state,
  ];

  if (checks.some((s) => s === "fail")) return "fail";
  if (checks.every((s) => s === "na")) return "na";
  return "pass";
}

export function summarizePerCu(project: Project): CuSummary[] {
  const byCu = new Map<string, { pass: number; fail: number; na: number; total: number }>();

  for (const cu of project.consumerUnits) {
    byCu.set(cu.id, { pass: 0, fail: 0, na: 0, total: 0 });
  }

  for (const c of project.circuits) {
    const bucket = byCu.get(c.cuId);
    if (!bucket) continue;

    const pts = project.points.filter((p) => p.circuitId === c.id);
    const calc = calcCircuit(project, c, pts);
    const overall = overallCircuitState(calc);

    bucket.total += 1;
    if (overall === "pass") bucket.pass += 1;
    else if (overall === "fail") bucket.fail += 1;
    else bucket.na += 1;
  }

  return project.consumerUnits.map((cu) => {
    const b = byCu.get(cu.id) ?? { pass: 0, fail: 0, na: 0, total: 0 };
    const overall: BadgeState =
      b.fail > 0 ? "fail" : b.total > 0 && b.pass === b.total ? "pass" : "na";

    return {
      cuId: cu.id,
      cuName: cu.name,
      totalCircuits: b.total,
      passCount: b.pass,
      failCount: b.fail,
      naCount: b.na,
      overall,
    };
  });
}
