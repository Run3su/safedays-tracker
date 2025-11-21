
import React from 'react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { Card } from './ui/Card';
import { UserSettings, CyclePhaseType, AppMode } from '../types';
import { 
  calculatePhase, 
  getCycleMarkers, 
  getPhaseEmoji, 
  calculatePregnancyStats,
  getBabySize
} from '../utils/dateUtils';
import { Sparkles, AlertCircle, CalendarCheck, Baby, Heart } from 'lucide-react';

interface DashboardProps {
  settings: UserSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  if (settings.mode === AppMode.PREGNANCY && settings.pregnancyStartDate) {
    return <PregnancyDashboard settings={settings} />;
  }
  return <TrackingDashboard settings={settings} />;
};

const PregnancyDashboard: React.FC<DashboardProps> = ({ settings }) => {
  const stats = calculatePregnancyStats(settings.pregnancyStartDate);
  
  if (!stats) return <div>Invalid Pregnancy Data</div>;

  const progressPercent = Math.min(100, (stats.weeksPregnant / 40) * 100);

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-night-100">Pregnancy</h2>
        <span className="text-sm font-medium text-rose-500 dark:text-rose-400">Week {stats.weeksPregnant}</span>
      </header>

      <Card className="p-8 text-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-night-900 dark:to-night-800 border-rose-200 dark:border-night-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white dark:bg-night-700 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="mb-4 relative z-10">
          <div className="w-24 h-24 bg-white dark:bg-night-800 rounded-full mx-auto flex items-center justify-center shadow-sm text-4xl mb-4">
            👶
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-night-100">
             Size of a {getBabySize(stats.weeksPregnant)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-night-200 mt-1 dark:text-gray-300">
            Trimester {stats.trimester}
          </p>
        </div>

        <div className="relative h-3 bg-white dark:bg-night-950 rounded-full overflow-hidden mb-2 shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-rose-400 rounded-full transition-all duration-1000" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-night-200 font-medium">
          <span>0w</span>
          <span>Due: {format(stats.dueDate, 'MMM d')}</span>
          <span>40w</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 space-y-2 bg-white dark:bg-night-900 border-blue-100 dark:border-night-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <CalendarCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Days Left</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-night-100">{stats.daysLeft}</p>
        </Card>

        <Card className="p-4 space-y-2 bg-white dark:bg-night-900 border-rose-100 dark:border-night-700">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Heart size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Current Week</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-night-100">{stats.weeksPregnant}</p>
        </Card>
      </div>

      <Card className="p-4 bg-white dark:bg-night-900">
         <h4 className="font-semibold text-gray-800 dark:text-night-100 mb-3 flex items-center gap-2">
           <Baby className="w-4 h-4 text-rose-500" />
           Weekly Update
         </h4>
         <p className="text-sm text-gray-600 dark:text-night-200 leading-relaxed dark:text-gray-300">
           Your baby is growing fast! At {stats.weeksPregnant} weeks, major developments are happening. 
           Remember to stay hydrated and keep taking your prenatal vitamins.
         </p>
      </Card>
    </div>
  );
};

const TrackingDashboard: React.FC<DashboardProps> = ({ settings }) => {
  const today = new Date();
  const lastPeriod = new Date(settings.lastPeriodDate);
  
  // Update to pass logs and periodDuration
  const currentPhase = calculatePhase(
    today, 
    lastPeriod, 
    settings.averageCycleLength, 
    settings.periodDuration, 
    settings.logs
  );
  
  const markers = getCycleMarkers(lastPeriod, settings.averageCycleLength);

  const daysUntilPeriod = differenceInDays(markers.nextPeriodStart, today);
  const daysUntilOvulation = differenceInDays(markers.ovulationDate, today);
  
  const isPeriodLate = daysUntilPeriod < 0;

  const PhaseBadge = ({ phase }: { phase: CyclePhaseType }) => {
    const labels: Record<CyclePhaseType, string> = {
      [CyclePhaseType.PERIOD]: 'Period Phase',
      [CyclePhaseType.FERTILE]: 'Fertile Window',
      [CyclePhaseType.OVULATION]: 'Ovulation Day',
      [CyclePhaseType.LUTEAL]: 'Safe Phase',
      [CyclePhaseType.FOLLICULAR]: 'Follicular Phase'
    };
    
    const colors: Record<CyclePhaseType, string> = {
      [CyclePhaseType.PERIOD]: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      [CyclePhaseType.FERTILE]: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      [CyclePhaseType.OVULATION]: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      [CyclePhaseType.LUTEAL]: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      [CyclePhaseType.FOLLICULAR]: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[phase]}`}>
        {labels[phase]}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-night-100">Cycle Overview</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-night-200 dark:text-gray-300">{format(today, 'MMMM d, yyyy')}</span>
      </header>

      <Card className="p-8 text-center bg-gradient-to-br from-white to-pink-50/50 dark:from-night-900 dark:to-night-800">
        <div className="mb-6 transform transition-transform hover:scale-110 duration-300 cursor-default inline-block">
          <span className="text-7xl filter drop-shadow-md">{getPhaseEmoji(currentPhase)}</span>
        </div>
        
        <div className="space-y-2">
          <PhaseBadge phase={currentPhase} />
          <h3 className="text-3xl font-bold text-gray-800 dark:text-night-100 mt-4">
            {currentPhase === CyclePhaseType.PERIOD 
                ? "Period" 
                : isPeriodLate 
                    ? <span className="text-rose-600 dark:text-rose-400">Period Late</span>
                    : `${daysUntilPeriod} Days`
            }
          </h3>
          <p className="text-gray-500 dark:text-night-200 font-medium dark:text-gray-300">
            {currentPhase === CyclePhaseType.PERIOD ? "Track your flow in Calendar" : isPeriodLate ? "Tap calendar to update" : "until next period"}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 space-y-3 bg-purple-50/50 dark:bg-night-800 border-purple-100 dark:border-night-700">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Ovulation</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-night-100">
              {isPast(markers.ovulationDate) && !isToday(markers.ovulationDate) ? 'Past' : isToday(markers.ovulationDate) ? 'Today' : daysUntilOvulation + 'd'}
            </p>
            <p className="text-xs text-gray-500 dark:text-night-200 dark:text-gray-300">{format(markers.ovulationDate, 'MMM d')}</p>
          </div>
        </Card>

        <Card className="p-4 space-y-3 bg-amber-50/50 dark:bg-night-800 border-amber-100 dark:border-night-700">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">Fertile</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-night-100">
              {format(markers.fertileStart, 'MMM d')}
            </p>
            <p className="text-xs text-gray-500 dark:text-night-200 dark:text-gray-300">
              - {format(markers.fertileEnd, 'MMM d')}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-night-800 border-b border-gray-100 dark:border-night-700">
          <h4 className="font-semibold text-gray-700 dark:text-night-100 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Key Dates
          </h4>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-night-800">
          <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-night-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-gray-600 dark:text-night-200 dark:text-gray-300">Next Period</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-night-100">{format(markers.nextPeriodStart, 'EEE, MMM d')}</span>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-night-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-600 dark:text-night-200 dark:text-gray-300">Predicted Ovulation</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-night-100">{format(markers.ovulationDate, 'EEE, MMM d')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
