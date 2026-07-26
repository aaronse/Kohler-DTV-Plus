/**
 * Shapes returned by the controller's CGI endpoints.
 *
 * These are transcribed from a live K-99695 (controller firmware 0.0.3.89) and
 * from the controller's own js/control.js + js/settings.js. Only the fields we
 * actually consume are typed; both endpoints return a great deal more.
 */

/** GET /values.cgi — full configuration + coarse state. ~300 keys. */
export interface KohlerValues {
  // Presence of hardware
  valve1_installed: boolean;
  valve2_installed: boolean;
  amp_installed: boolean;
  steam_installed: boolean;
  music_installed: boolean;
  rainpanel_installed: boolean;
  light1_installed: boolean;
  light2_installed: boolean;
  light3_installed: boolean;

  // Valve 1 outlet configuration: "outlet_0" (unassigned) .. "outlet_23".
  one_type: string;
  two_type: string;
  three_type: string;
  four_type: string;
  five_type: string;
  six_type: string;
  one_massage: boolean;
  two_massage: boolean;
  three_massage: boolean;
  four_massage: boolean;
  five_massage: boolean;
  six_massage: boolean;
  valve1_outlet_num: number;
  def_outlet: number;

  // Valve 2 mirrors the above with a v2_ prefix.
  v2_one_type: string;
  v2_two_type: string;
  v2_three_type: string;
  v2_four_type: string;
  v2_five_type: string;
  v2_six_type: string;
  v2_one_massage: boolean;
  v2_two_massage: boolean;
  v2_three_massage: boolean;
  v2_four_massage: boolean;
  v2_five_massage: boolean;
  v2_six_massage: boolean;
  valve2_outlet_num: number;
  v2_def_outlet: number;

  // Temperature
  def_temp: number;
  max_temp: number;
  v2_def_temp: number;
  v2_max_temp: number;
  valve1_temp_string: string | number;
  valve2_temp_string: string | number;
  /** 0 = Fahrenheit, 1 = Celsius. */
  units: number;

  // Run state
  shower_on: boolean;
  steam_running: boolean;
  massage_enabled: boolean;
  massage: boolean;
  CurrentUser: number;

  // Presets
  user_1: string;
  user_2: string;
  user_3: string;
  user_4: string;
  user_5: string;
  user_6: string;
  user_1_enabled: boolean | string;
  user_2_enabled: boolean | string;
  user_3_enabled: boolean | string;
  user_4_enabled: boolean | string;
  user_5_enabled: boolean | string;
  user_6_enabled: boolean | string;

  // Audio
  volume: number;
  amp_volume_string: string | number;

  // Connection health, e.g. "conn" | "not_seen" | "dis"
  valve_1_con_string: string;
  valve_2_con_string: string;
  controller_con_string: string;
  amp_con_string: string;
  steam_con_string: string;
  ui1_con_string: string;
  num_interface: number;

  // Identity
  IP: string;
  MAC: string;
  controller_version_string: string;
  time: string;

  [key: string]: unknown;
}

/** GET /system_info.cgi — the live, fast-moving status the interface polls. */
export interface KohlerSystemInfo {
  valve1_Currentstatus: string;
  valve1Setpoint: string | number;
  valve1outlet1: boolean;
  valve1outlet2: boolean;
  valve1outlet3: boolean;
  valve1outlet4: boolean;
  valve1outlet5: boolean;
  valve1outlet6: boolean;
  valve1_massage: number;

  valve2_Currentstatus: string;
  valve2Setpoint: string | number;
  valve2outlet1: boolean;
  valve2outlet2: boolean;
  valve2outlet3: boolean;
  valve2outlet4: boolean;
  valve2outlet5: boolean;
  valve2outlet6: boolean;
  valve2_massage: number;

  steamStatus: string;
  steamTempStatus: string | number;
  steamTimeStatus: string;
  steamTimeMinutes: number;

  musicStatus: string;
  volStatus: string;
  muteStatus: string;

  LZ1Status: string;
  LZ2Status: string;
  LZ3Status: string;
  RainpanelStatus: string;

  spa_on: boolean;
  ui_shower_on: boolean;
  ui_steam_running: boolean;
  devices_running: boolean;

  /** "&degF" or "&degC" */
  degree_symbol: string;

  [key: string]: unknown;
}

export interface StatusResponse {
  ok: boolean;
  ts: number;
  host: string;
  values: KohlerValues | null;
  system: KohlerSystemInfo | null;
  /** values.cgi came from the proxy's short-lived cache rather than the wire. */
  valuesCached?: boolean;
  error?: string;
}

/** Massage cycling mode, as sent in quick_shower.cgi's valveN_massage param. */
export const MassageMode = {
  Off: 0,
  Single: 1,
  Wave: 2,
  Custom1: 3,
  Custom2: 4,
} as const;
export type MassageModeValue = (typeof MassageMode)[keyof typeof MassageMode];
