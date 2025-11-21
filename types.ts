
export interface Cycle {
  startDate: string; // ISO string
  endDate?: string;
  length?: number;
}

export enum AppMode {
  TRACKING = 'TRACKING',
  PREGNANCY = 'PREGNANCY'
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO'
}

export enum FlowIntensity {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HEAVY = 'HEAVY'
}

export interface DailyLog {
  flow?: FlowIntensity;
  spotting?: boolean;
}

export interface UserSettings {
  isOnboarded: boolean;
  averageCycleLength: number;
  periodDuration: number; // Default 5
  lastPeriodDate: string; // ISO date string YYYY-MM-DD
  cycles: Cycle[];
  logs: Record<string, DailyLog>; // Key is YYYY-MM-DD
  mode: AppMode;
  theme: Theme;
  pregnancyStartDate?: string; // ISO string (LMP)
}

export enum CyclePhaseType {
  PERIOD = 'PERIOD',
  FOLLICULAR = 'FOLLICULAR',
  FERTILE = 'FERTILE',
  OVULATION = 'OVULATION',
  LUTEAL = 'LUTEAL',
}

export interface CycleDayData {
  date: Date;
  phase: CyclePhaseType;
  isToday: boolean;
  isPeriodStart: boolean;
}

export interface PhaseColors {
  bg: string;
  text: string;
  border: string;
  indicator: string;
  label: string;
}
