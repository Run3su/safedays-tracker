
import React, { useEffect } from 'react';
import { Trash2, Settings as SettingsIcon, History, Baby, CheckCircle2, Moon, Sun, Clock, Droplets } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UserSettings, AppMode, Theme } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onClearData }) => {
  
  const updateSetting = (updates: Partial<UserSettings>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const handleModeChange = (newMode: AppMode) => {
    if (newMode === settings.mode) return;
    
    const updates: Partial<UserSettings> = { mode: newMode };
    if (newMode === AppMode.PREGNANCY && !settings.pregnancyStartDate) {
      updates.pregnancyStartDate = new Date().toISOString();
    }

    updateSetting(updates);
    toast.success(`Switched to ${newMode === AppMode.PREGNANCY ? 'Pregnancy' : 'Cycle Tracking'} mode`);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure? This will delete all your cycle history and reset the app to the welcome screen.')) {
      onClearData();
      toast.success('All data cleared');
    }
  };

  const getInputValue = (isoDate?: string) => {
    if (!isoDate) return new Date().toISOString().split('T')[0];
    return isoDate.split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      updateSetting({ pregnancyStartDate: date.toISOString() });
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in duration-500">
       <header className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-night-100">Settings</h2>
      </header>

      {/* Theme Settings */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-night-100 flex items-center gap-2">
             <Moon size={20} className="text-gray-600 dark:text-night-200" />
             Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => updateSetting({ theme: Theme.LIGHT })}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2 ${
              settings.theme === Theme.LIGHT
              ? 'border-rose-500 bg-rose-50 dark:bg-night-800 text-rose-700 dark:text-rose-300' 
              : 'border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 text-gray-500 dark:text-night-200'
            }`}
          >
            <Sun size={18} />
            Light
          </button>
          <button 
            onClick={() => updateSetting({ theme: Theme.DARK })}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2 ${
              settings.theme === Theme.DARK
              ? 'border-gray-600 bg-gray-100 dark:bg-night-800 dark:border-gray-400 text-gray-900 dark:text-white' 
              : 'border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 text-gray-500 dark:text-night-200'
            }`}
          >
            <Moon size={18} />
            Dark
          </button>
          <button 
            onClick={() => updateSetting({ theme: Theme.AUTO })}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2 ${
              settings.theme === Theme.AUTO
              ? 'border-blue-500 bg-blue-50 dark:bg-night-800 text-blue-700 dark:text-blue-300' 
              : 'border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 text-gray-500 dark:text-night-200'
            }`}
          >
            <Clock size={18} />
            Auto
          </button>
        </div>
      </Card>

      {/* App Mode Toggle */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-night-100 flex items-center gap-2">
             <Baby size={20} className="text-rose-500" />
             App Mode
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleModeChange(AppMode.TRACKING)}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              settings.mode === AppMode.TRACKING 
              ? 'border-rose-500 bg-rose-50 dark:bg-night-800 text-rose-700 dark:text-rose-300' 
              : 'border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 text-gray-500 dark:text-night-200'
            }`}
          >
            Cycle Tracking
          </button>
          <button 
             onClick={() => handleModeChange(AppMode.PREGNANCY)}
             className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              settings.mode === AppMode.PREGNANCY 
              ? 'border-rose-500 bg-rose-50 dark:bg-night-800 text-rose-700 dark:text-rose-300' 
              : 'border-gray-100 dark:border-night-700 bg-white dark:bg-night-900 text-gray-500 dark:text-night-200'
            }`}
          >
            Pregnancy
          </button>
        </div>

        {settings.mode === AppMode.PREGNANCY && (
           <div className="pt-2 animate-in fade-in slide-in-from-top-2">
             <label className="block text-sm font-medium text-gray-700 dark:text-night-200 mb-2">
               Start of Last Period (LMP)
             </label>
             <input
                type="date"
                value={getInputValue(settings.pregnancyStartDate)}
                onChange={handleDateChange}
                className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800 text-gray-900 dark:text-night-100 focus:bg-white dark:focus:bg-night-900 focus:border-rose-500 focus:ring-rose-500 transition-colors dark:text-white dark:placeholder-gray-400"
              />
           </div>
        )}
      </Card>

      {/* Cycle Config */}
      {settings.mode === AppMode.TRACKING && (
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-night-100 flex items-center gap-2">
              <SettingsIcon size={20} className="text-gray-500 dark:text-night-200" />
              Configuration
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-night-200">
                  Average Cycle Length
                </label>
                <select
                  value={settings.averageCycleLength}
                  onChange={(e) => updateSetting({ averageCycleLength: Number(e.target.value) })}
                  className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800 text-gray-900 dark:text-night-100 focus:bg-white dark:focus:bg-night-900 focus:border-rose-500 focus:ring-rose-500 transition-colors dark:text-white"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 21).map(days => (
                    <option key={days} value={days}>{days} Days</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-night-200">
                  Period Duration
                </label>
                <div className="flex items-center gap-2">
                   <select
                    value={settings.periodDuration || 5}
                    onChange={(e) => updateSetting({ periodDuration: Number(e.target.value) })}
                    className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800 text-gray-900 dark:text-night-100 focus:bg-white dark:focus:bg-night-900 focus:border-rose-500 focus:ring-rose-500 transition-colors dark:text-white"
                  >
                    {[3,4,5,6,7,8,9,10].map(days => (
                      <option key={days} value={days}>{days} Days</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 dark:text-night-200 whitespace-nowrap">
                    Default prediction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Cycle History */}
      {settings.mode === AppMode.TRACKING && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-night-800 border-b border-gray-100 dark:border-night-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-night-100 flex items-center gap-2">
              <History size={20} className="text-gray-500 dark:text-night-200" />
              Cycle History
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-night-800">
            {[...settings.cycles].reverse().map((cycle, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-night-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-night-700'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-night-100">
                      {format(new Date(cycle.startDate), 'MMMM d, yyyy')}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-night-200">Started</span>
                  </div>
                </div>
                {cycle.length ? (
                   <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-night-800 text-xs font-semibold text-gray-600 dark:text-night-200">
                     {cycle.length} days
                   </span>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    Current <CheckCircle2 size={12} />
                  </span>
                )}
              </div>
            ))}
            {settings.cycles.length === 0 && (
              <div className="p-8 text-center text-gray-400 dark:text-night-200 text-sm">No history available yet.</div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 mt-8">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
          <Trash2 size={20} />
          Danger Zone
        </h3>
        <Button 
          fullWidth 
          variant="outline" 
          className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 focus:ring-red-200 bg-white dark:bg-transparent dark:text-white"
          onClick={handleClear}
        >
          Clear All Data
        </Button>
      </Card>
      
      <div className="text-center text-xs text-gray-400 dark:text-night-200 pt-8">
        SafeDays v2.4 • Privacy Focused
      </div>
    </div>
  );
};
