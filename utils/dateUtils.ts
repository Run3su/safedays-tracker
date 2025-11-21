
import { 
  addDays, 
  format, 
  differenceInDays, 
  isSameDay, 
  isWithinInterval,
  isValid,
  differenceInWeeks
} from 'date-fns';
import { CyclePhaseType, CycleDayData, Cycle, DailyLog, FlowIntensity } from '../types';

// Helper to safely parse stored dates
export const parseDate = (dateStr: string): Date => {
  const d = new Date(dateStr);
  return isValid(d) ? d : new Date();
};

// Local implementation of startOfDay
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getLogForDate = (date: Date, logs: Record<string, DailyLog>): DailyLog | undefined => {
  const key = format(date, 'yyyy-MM-dd');
  return logs[key];
};

export const calculatePhase = (
  targetDate: Date, 
  lastPeriodDate: Date, 
  cycleLength: number,
  periodDuration: number = 5,
  logs: Record<string, DailyLog> = {}
): CyclePhaseType => {
  const tDate = startOfDay(targetDate);
  const pDate = startOfDay(lastPeriodDate);
  
  // Check specific logs first
  const log = getLogForDate(tDate, logs);
  if (log?.flow) {
    return CyclePhaseType.PERIOD;
  }

  const diff = differenceInDays(tDate, pDate);
  
  // Calculate position in cycle
  let dayInCycle = diff % cycleLength;
  if (dayInCycle < 0) dayInCycle += cycleLength;
  
  // Use custom period duration for prediction
  if (dayInCycle >= 0 && dayInCycle < periodDuration) return CyclePhaseType.PERIOD;

  const ovulationDayIndex = cycleLength - 14;
  const fertileStartIndex = ovulationDayIndex - 5;
  const fertileEndIndex = ovulationDayIndex + 1;

  if (dayInCycle === ovulationDayIndex) return CyclePhaseType.OVULATION;
  
  if (dayInCycle >= fertileStartIndex && dayInCycle <= fertileEndIndex) return CyclePhaseType.FERTILE;
  
  return CyclePhaseType.LUTEAL;
};

export const getCycleMarkers = (lastPeriodDate: Date, cycleLength: number) => {
  const periodStart = startOfDay(lastPeriodDate);
  const nextPeriodStart = addDays(periodStart, cycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  return {
    periodStart,
    nextPeriodStart,
    ovulationDate,
    fertileStart,
    fertileEnd
  };
};

export const getPhaseColor = (phase: CyclePhaseType): string => {
  switch (phase) {
    case CyclePhaseType.PERIOD: return 'bg-rose-100 text-rose-700 border-rose-200';
    case CyclePhaseType.OVULATION: return 'bg-purple-100 text-purple-700 border-purple-200';
    case CyclePhaseType.FERTILE: return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-emerald-50 text-emerald-700 border-emerald-100'; 
  }
};

export const getPhaseEmoji = (phase: CyclePhaseType): string => {
  switch (phase) {
    case CyclePhaseType.PERIOD: return '🔴';
    case CyclePhaseType.OVULATION: return '🔵';
    case CyclePhaseType.FERTILE: return '🟡';
    default: return '🟢';
  }
};

export const getPhaseLabel = (phase: CyclePhaseType): string => {
  switch (phase) {
    case CyclePhaseType.PERIOD: return 'Menstruation';
    case CyclePhaseType.OVULATION: return 'Ovulation Day';
    case CyclePhaseType.FERTILE: return 'Fertile Window';
    default: return 'Safe Day';
  }
};

// --- Pregnancy Helpers ---

export const calculatePregnancyStats = (startDateStr?: string) => {
  if (!startDateStr) return null;
  
  const start = new Date(startDateStr);
  const today = new Date();
  const dueDate = addDays(start, 280); // 40 weeks
  
  const weeksPregnant = differenceInWeeks(today, start);
  const daysPregnant = differenceInDays(today, start);
  const daysLeft = differenceInDays(dueDate, today);
  
  let trimester = 1;
  if (weeksPregnant >= 13) trimester = 2;
  if (weeksPregnant >= 27) trimester = 3;

  return {
    dueDate,
    weeksPregnant,
    daysPregnant,
    daysLeft,
    trimester
  };
};

export const getBabySize = (weeks: number): string => {
  if (weeks < 4) return "Poppy Seed";
  if (weeks < 8) return "Raspberry";
  if (weeks < 12) return "Plum";
  if (weeks < 16) return "Avocado";
  if (weeks < 20) return "Banana";
  if (weeks < 24) return "Ear of Corn";
  if (weeks < 28) return "Eggplant";
  if (weeks < 32) return "Squash";
  if (weeks < 36) return "Honeydew";
  if (weeks < 40) return "Pumpkin";
  return "Watermelon";
};

// --- History Helpers ---

export const calculateRecalibratedAverage = (cycles: Cycle[]): number => {
  const completedCycles = cycles.filter(c => c.length && c.length > 10 && c.length < 50);
  
  if (completedCycles.length === 0) return 28;

  const recent = completedCycles.slice(-6);
  const sum = recent.reduce((acc, curr) => acc + (curr.length || 28), 0);
  return Math.round(sum / recent.length);
};
