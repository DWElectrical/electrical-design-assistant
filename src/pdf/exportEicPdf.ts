import type { Project } from "../types";
import { calcCircuit, overallCircuitState, round } from "../utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportEicPdf(project: Project) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.text("Electrical Installation Design Assistant", 40, 40);
  doc.setFontSize(11);
  doc.text(`Project: ${project.name}`, 40, 62);
  doc.text(`Uo: ${project.nominalVoltage_V}V   Ze: ${project.originZe_ohm}Ω   PFC: ${project.pfc_kA}kA`, 40, 78);

  const cuById = new Map(project.consumerUnits.map((c) => [c.id, c.name]));

  // Circuits table
  const circuitRows = project.circuits.map((c) => {
    const pts = project.points.filter((p) => p.circuitId === c.id);
    const calc = calcCircuit(project, c, pts);
    const overall = overallCircuitState(calc);

    return [
      cuById.get(c.cuId) ?? "CU",
      c.name,
      `${c.breakerCurve}${c.In_A}`,
      `${calc.Ib_A}`,
      `${c.Iz_A}`,
      `${calc.voltDrop_percent}`,
      c.Zs_measured_ohm > 0 ? `${round(c.Zs_measured_ohm, 3)}` : "",
      c.maxZs_device_ohm > 0 ? `${round(c.maxZs_device_ohm, 3)}` : "",
      overall.toUpperCase(),
    ];
  });

  autoTable(doc, {
    startY: 100,
    head: [[
      "CU",
      "Circuit",
      "Device",
      "Ib (A)",
      "Iz (A)",
      "VD (%)",
      "Zs meas (Ω)",
      "Max Zs device (Ω)",
      "Overall",
    ]],
    body: circuitRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
  });

  // Points table
  const afterCircuitsY = (doc as any).lastAutoTable?.finalY ?? 100;
  doc.setFontSize(12);
  doc.text("Points schedule", 40, afterCircuitsY + 26);

  const pointRows = project.points.map((p) => {
    const room = project.rooms.find((r) => r.id === p.roomId)?.name ?? "";
    const circuit = project.circuits.find((c) => c.id === p.circuitId)?.name ?? "";
    return [room, p.type, p.label, `${p.load_W}`, circuit];
  });

  autoTable(doc, {
    startY: afterCircuitsY + 36,
    head: [["Room", "Type", "Label", "Load (W)", "Circuit"]],
    body: pointRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
  });

  doc.save(`${project.name.replaceAll(" ", "_")}_EIC_Schedule.pdf`);
}
