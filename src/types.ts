export type BreakerCurve = "B" | "C" | "D";
export type EarthingSystem = "TN" | "TT";
export type DeviceType = "MCB" | "RCBO" | "RCD";

export type ConsumerUnit = {
  id: string;
  name: string;
  parentCuId?: string;
};

export type Circuit = {
  id: string;
  cuId: string;
  name: string;

  breakerCurve: BreakerCurve;
  In_A: number;
  Ib_A: number; // stored value (we auto-calc from points in utils)
  Iz_A: number;

  length_m: number;
  mvPerAmpPerM: number;

  Ze_design_ohm: number;
  R1R2_design_ohm: number;

  voltDropLimit_percent: number;
  nominalVoltage_V: number;

  // Testing / cert data
  Zs_measured_ohm: number;

  // user-entered device regime / limits
  earthing: EarthingSystem;
  deviceType: DeviceType;
  maxDisconnectionTime_s: number;

  // ✅ user enters max Zs for chosen device/regime
  maxZs_device_ohm: number;

  // RCD test
  rcd_I_delta_n_mA: number;
  rcd_1x_0deg_ms: number;
  rcd_1x_180deg_ms: number;

  // IR
  ir_500v_MOhm: number;
  ir_250v_MOhm: number;

  // Polarity
  polarityPass: boolean;
  polarityNotes: string;

  // Origin readings (optional per circuit)
  pfc_kA: number;
  Ze_measured_ohm: number;

  // End-to-end continuity
  R1_e2e_ohm: number;
  RN_e2e_ohm: number;
  R2_e2e_ohm: number;

  // ✅ Notes (saved per circuit)
  notesText: string;
};

export type Room = { id: string; name: string };

export type PointType = "Socket" | "Light" | "Switch" | "Data" | "Cooker" | "Shower";

export type Point = {
  id: string;
  roomId: string;
  circuitId: string;
  type: PointType;
  label: string;
  load_W: number;
};

export type Project = {
  id: string;
  name: string;

  nominalVoltage_V: number; // supply Uo
  originZe_ohm: number; // Ze at origin
  pfc_kA: number; // PFC at origin

  consumerUnits: ConsumerUnit[];
  circuits: Circuit[];
  rooms: Room[];
  points: Point[];

  selectedCuId: string;
  selectedCircuitId: string | null;
  selectedRoomId: string;

  pointPresets_W: Record<PointType, number>;
};

export type CircuitCalc = {
  Ib_A: number;

  voltDrop_V: number;
  voltDrop_percent: number;
  passesVoltDrop: "pass" | "fail" | "na";

  Zs_calc_ohm: number;
  passesZs_calc: "pass" | "fail" | "na";

  passesIbInIz: "pass" | "fail" | "na";

  Zs_measured_ohm: number;
  passesZs_meas_general: "pass" | "fail" | "na";
  passesZs_meas_device: "pass" | "fail" | "na";

  IR_state: "pass" | "fail" | "na";
  RCD_state: "pass" | "fail" | "na";
  polarity_state: "pass" | "fail" | "na";

  notes: string[];
};

export type CuSummary = {
  cuId: string;
  cuName: string;
  totalCircuits: number;
  passCount: number;
  failCount: number;
  naCount: number;
  overall: "pass" | "fail" | "na";
};
