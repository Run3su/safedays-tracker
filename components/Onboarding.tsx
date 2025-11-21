import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { UserSettings } from '../types';

interface OnboardingProps {
  onComplete: (settings: Partial<UserSettings>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<number>(28);

  const handleNext = () => {
    if (step === 1 && date) {
      setStep(2);
    } else if (step === 2) {
      onComplete({
        lastPeriodDate: new Date(date).toISOString(),
        averageCycleLength: cycleLength,
        isOnboarded: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-orange-50 dark:from-night-950 dark:to-night-900 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-night-800 text-rose-500 mb-4 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-night-100 tracking-tight">Welcome to SafeDays</h1>
          <p className="text-gray-500 dark:text-night-200">Let's get to know your cycle.</p>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <div className="h-2 bg-gray-100 dark:bg-night-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-500 ease-out"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Step {step} of 2</p>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-night-200">
                  When did your last period start?
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800 text-gray-900 dark:text-night-100 focus:bg-white dark:focus:bg-night-900 focus:border-rose-500 focus:ring-rose-500 transition-colors"
                />
              </div>
              <Button 
                fullWidth 
                onClick={handleNext} 
                disabled={!date}
              >
                Next Step
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-night-200">
                  How long is your average cycle?
                </label>
                <p className="text-xs text-gray-500 dark:text-night-200">Usually between 21 and 35 days</p>
                <select
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-800 text-gray-900 dark:text-night-100 focus:bg-white dark:focus:bg-night-900 focus:border-rose-500 focus:ring-rose-500 transition-colors"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 21).map(days => (
                    <option key={days} value={days}>{days} Days</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Complete
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};