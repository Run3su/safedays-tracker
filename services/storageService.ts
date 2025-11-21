
import { UserSettings, AppMode, Cycle, Theme, DailyLog, FlowIntensity } from '../types';
import { differenceInDays, format } from 'date-fns';
import { calculateRecalibratedAverage } from '../utils/dateUtils';

const STORAGE_KEY = 'safedays_data_v2';

// Initial default state
const defaultSettings: UserSettings = {
  isOnboarded: false,
  averageCycleLength: 28,
  periodDuration: 5,
  lastPeriodDate: new Date().toISOString(),
  cycles: [],
  logs: {},
  mode: AppMode.TRACKING,
  theme: Theme.AUTO
};

export const getSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultSettings;
    
    const parsed = JSON.parse(data);
    
    // Migrations
    if (!parsed.cycles) parsed.cycles = [{ startDate: parsed.lastPeriodDate }];
    if (!parsed.mode) parsed.mode = AppMode.TRACKING;
    if (!parsed.theme) parsed.theme = Theme.AUTO;
    if (!parsed.logs) parsed.logs = {};
    if (!parsed.periodDuration) parsed.periodDuration = 5;
    
    // Migration: PURPLE -> DARK
    if (parsed.theme === 'PURPLE') parsed.theme = Theme.DARK;
    
    return parsed;
  } catch (e) {
    console.error("Error reading settings", e);
    return defaultSettings;
  }
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving settings", e);
  }
};

export const saveDailyLog = (date: Date, logUpdates: Partial<DailyLog>): UserSettings => {
  const current = getSettings();
  const key = format(date, 'yyyy-MM-dd');
  const existing = current.logs[key] || {};
  
  const newLog = { ...existing, ...logUpdates };
  
  // Cleanup empty logs to save space
  if (!newLog.flow && !newLog.spotting) {
    delete current.logs[key];
  } else {
    current.logs[key] = newLog;
  }

  const updated = { ...current, logs: { ...current.logs } };
  saveSettings(updated);
  return updated;
};

export const updateCycleStart = (newDate: Date): UserSettings => {
  const current = getSettings();
  const newDateStr = newDate.toISOString();

  const sortedCycles = [...current.cycles].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const lastCycle = sortedCycles[sortedCycles.length - 1];
  const isCorrection = lastCycle && Math.abs(differenceInDays(newDate, new Date(lastCycle.startDate))) < 5;

  let updatedCycles = [...sortedCycles];

  if (isCorrection) {
    updatedCycles[updatedCycles.length - 1] = {
      ...lastCycle,
      startDate: newDateStr
    };
  } else {
    if (lastCycle) {
      const prevStart = new Date(lastCycle.startDate);
      const length = differenceInDays(newDate, prevStart);
      if (length > 10) {
        updatedCycles[updatedCycles.length - 1] = {
          ...lastCycle,
          endDate: new Date(newDate.getTime() - 86400000).toISOString(),
          length: length
        };
      }
    }
    updatedCycles.push({ startDate: newDateStr });
  }

  const newAverage = calculateRecalibratedAverage(updatedCycles);

  const updated: UserSettings = {
    ...current,
    lastPeriodDate: newDateStr,
    cycles: updatedCycles,
    averageCycleLength: newAverage > 0 ? newAverage : current.averageCycleLength
  };

  saveSettings(updated);
  return updated;
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing settings", e);
  }
};
