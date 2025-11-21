
import React, { useState } from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  isSameMonth, 
  isSameDay, 
  isToday,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Info, Baby, Droplets, X } from 'lucide-react';
import { UserSettings, CyclePhaseType, AppMode, FlowIntensity, DailyLog } from '../types';
import { calculatePhase, getLogForDate } from '../utils/dateUtils';
import { saveDailyLog, updateCycleStart } from '../services/storageService';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface CalendarViewProps {
  settings: UserSettings;
  onUpdateDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ settings, onUpdateDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const isPregnancyMode = settings.mode === AppMode.PREGNANCY;

  // Helpers
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const subMonths = (date: Date, amount: number) => addMonths(date, -amount);
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0,0,0,0);
    return d;
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Interactions
  const handleDayClick = (date: Date) => {
    if (isPregnancyMode) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSaveLog = (log: Partial<DailyLog>, isPeriodStart: boolean) => {
    if (!selectedDate) return;
    
    // 1. Save the symptom log
    const newSettings = saveDailyLog(selectedDate, log);
    
    // 2. If Period Start is checked, update the cycle start
    if (isPeriodStart) {
       // This triggers parent update which reloads settings
       onUpdateDate(selectedDate);
       // Ensure we add a flow log if they marked start but didn't pick flow
       if (!log.flow) {
         saveDailyLog(selectedDate, { flow: FlowIntensity.MEDIUM });
       }
    } else {
       // If unchecking period start, we just update the log. 
       // Note: removing a cycle start is harder (requires deleting from cycles array), 
       // currently we assume "Start" just marks it as the *latest* period if compatible.
       // For this simplified app, we'll just trigger the settings reload via onUpdateDate 
       // if we logged something substantial.
       onUpdateDate(selectedDate); // Use this to trigger refresh of settings prop
    }
    
    toast.success("Daily log updated");
    setShowModal(false);
  };

  return (
    <div className="p-4 pb-24 space-y-6 h-full animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-night-100">Calendar</h2>
        <div className="flex gap-2 bg-white dark:bg-night-900 rounded-lg shadow-sm p-1 border border-gray-100 dark:border-night-800">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-50 dark:hover:bg-night-800 rounded-md text-gray-600 dark:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 font-medium min-w-[100px] text-center text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-50 dark:hover:bg-night-800 rounded-md text-gray-600 dark:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-night-900 rounded-2xl shadow-sm border border-gray-100 dark:border-night-800 p-4">
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-white uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-1">
          {calendarDays.map((day, idx) => {
            let phase = CyclePhaseType.LUTEAL;
            if (!isPregnancyMode) {
               phase = calculatePhase(day, new Date(settings.lastPeriodDate), settings.averageCycleLength, settings.periodDuration, settings.logs);
            }

            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isPeriodStart = !isPregnancyMode && isSameDay(day, new Date(settings.lastPeriodDate));
            const isDayToday = isToday(day);
            const dayLog = getLogForDate(day, settings.logs);
            const hasFlow = !!dayLog?.flow;
            const hasSpotting = !!dayLog?.spotting;

            // Base Colors
            let bgClass = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800 dark:text-white'; 
            let dotColor = 'bg-emerald-500 dark:bg-white';

            if (phase === CyclePhaseType.PERIOD) {
              // Distinguish predicted vs logged
              if (hasFlow || isPeriodStart) {
                  bgClass = 'bg-rose-600 text-white font-bold dark:bg-rose-600 dark:text-white'; // Logged/Confirmed
              } else {
                  bgClass = 'bg-rose-200 text-rose-900 font-bold dark:bg-rose-900 dark:text-white border-2 border-rose-300 dark:border-rose-700 border-dashed'; // Predicted
              }
              dotColor = 'bg-rose-600 dark:bg-white';
            } else if (phase === CyclePhaseType.FERTILE) {
              bgClass = 'bg-amber-200 text-amber-900 font-medium dark:bg-amber-500 dark:text-white';
              dotColor = 'bg-amber-600 dark:bg-white';
            } else if (phase === CyclePhaseType.OVULATION) {
              bgClass = 'bg-purple-200 text-purple-900 font-extrabold ring-2 ring-purple-300 dark:ring-purple-200 dark:bg-purple-600 dark:text-white';
              dotColor = 'bg-purple-600 dark:bg-white';
            }

            if (!isCurrentMonth) {
              bgClass = 'bg-gray-50 dark:bg-transparent text-gray-300 dark:text-night-700';
              dotColor = 'bg-gray-200 dark:bg-night-800';
            }
            
            if (isPregnancyMode && isCurrentMonth) {
               bgClass = 'bg-pink-100 text-pink-900 dark:bg-pink-700 dark:text-white';
               dotColor = 'hidden';
            }

            return (
              <div key={day.toISOString()} className="flex flex-col items-center">
                <button
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200
                    ${bgClass}
                    ${isDayToday ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-night-900 z-10' : ''}
                    ${isPeriodStart && !hasFlow ? 'ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-night-900' : ''}
                  `}
                >
                  {format(day, 'd')}
                  
                  {/* Indicators */}
                  <div className="absolute -bottom-2 flex gap-0.5">
                    {hasFlow && (
                       <Droplets size={8} className="text-white dark:text-white fill-current" />
                    )}
                    {hasSpotting && (
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-800 border border-white"></div>
                    )}
                    {!hasFlow && !hasSpotting && phase !== CyclePhaseType.PERIOD && (
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legends & Info */}
      {isPregnancyMode ? (
        <div className="flex items-start gap-3 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-100 dark:border-pink-900 text-pink-800 dark:text-pink-300">
          <Baby className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">Pregnancy mode active.</p>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="bg-white dark:bg-night-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-night-800">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-white">Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-white">Fertile</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-white">Ovulation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-medium text-gray-600 dark:text-white">Safe</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                    Tap any date to log symptoms, flow, or mark the start of your period.
                </p>
            </div>
        </div>
      )}

      {/* Day Details Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-full max-w-sm bg-white dark:bg-night-900 p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                     {format(selectedDate, 'EEEE, MMM d')}
                   </h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Daily Log</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 dark:bg-night-800 rounded-full text-gray-500 dark:text-white">
                   <X size={20} />
                 </button>
              </div>

              <DayLogForm 
                 date={selectedDate} 
                 initialLog={getLogForDate(selectedDate, settings.logs)}
                 isPeriodStart={isSameDay(selectedDate, new Date(settings.lastPeriodDate))}
                 onSave={handleSaveLog}
              />
           </Card>
        </div>
      )}
    </div>
  );
};

// Sub-component for the form to keep main view clean
const DayLogForm: React.FC<{ 
  date: Date; 
  initialLog?: DailyLog;
  isPeriodStart: boolean; 
  onSave: (log: Partial<DailyLog>, isPeriodStart: boolean) => void; 
}> = ({ initialLog, isPeriodStart, onSave }) => {
  const [isStart, setIsStart] = useState(isPeriodStart);
  const [flow, setFlow] = useState<FlowIntensity | undefined>(initialLog?.flow);
  const [spotting, setSpotting] = useState<boolean>(initialLog?.spotting || false);

  const handleSave = () => {
    onSave({ flow: flow || undefined, spotting }, isStart);
  };

  return (
    <div className="space-y-6">
       {/* Period Start Toggle */}
       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-night-800 rounded-xl">
         <span className="font-medium text-gray-900 dark:text-white">Period Started</span>
         <button 
           onClick={() => setIsStart(!isStart)}
           className={`w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-1 ${isStart ? 'bg-rose-500' : 'bg-gray-300 dark:bg-night-700'}`}
         >
           <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${isStart ? 'translate-x-5' : ''}`} />
         </button>
       </div>

       {/* Flow Selector */}
       <div className="space-y-3">
         <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Flow Intensity</label>
         <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => setFlow(undefined)}
              className={`py-2 px-1 rounded-lg text-xs font-medium border ${!flow ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black' : 'border-gray-200 dark:border-night-700 text-gray-600 dark:text-gray-400'}`}
            >
              None
            </button>
            {[FlowIntensity.LIGHT, FlowIntensity.MEDIUM, FlowIntensity.HEAVY].map(intensity => (
               <button
                 key={intensity}
                 onClick={() => setFlow(intensity)}
                 className={`py-2 px-1 rounded-lg text-xs font-medium border capitalize ${flow === intensity ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 dark:border-night-700 text-gray-600 dark:text-gray-400'}`}
               >
                 {intensity.toLowerCase()}
               </button>
            ))}
         </div>
       </div>

       {/* Spotting */}
       <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spotting</span>
          <button 
           onClick={() => setSpotting(!spotting)}
           className={`w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-1 ${spotting ? 'bg-amber-500' : 'bg-gray-300 dark:bg-night-700'}`}
         >
           <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${spotting ? 'translate-x-5' : ''}`} />
         </button>
       </div>

       <Button fullWidth onClick={handleSave}>Save Log</Button>
    </div>
  );
};
