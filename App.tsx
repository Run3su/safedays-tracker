import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Home, Calendar as CalendarIcon, Settings as SettingsIcon } from 'lucide-react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { getSettings, saveSettings, updateCycleStart, clearSettings } from './services/storageService';
import { UserSettings, Theme } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const data = getSettings();
      setSettings(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Theme Effect
  useEffect(() => {
    if (!settings) return;

    const checkTheme = () => {
      const hour = new Date().getHours();
      // Night is between 8 PM (20) and 6 AM (6)
      const isNight = hour >= 20 || hour < 6;
      
      const shouldBeDark = 
        settings.theme === Theme.DARK || 
        (settings.theme === Theme.AUTO && isNight);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    checkTheme();
    
    // If Auto, check every minute to switch exactly at 8pm/6am
    let interval: ReturnType<typeof setInterval>;
    if (settings.theme === Theme.AUTO) {
      interval = setInterval(checkTheme, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings?.theme]);

  const handleOnboardingComplete = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings!, ...newSettings, isOnboarded: true };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleDateUpdate = (date: Date) => {
    const updated = updateCycleStart(date);
    setSettings(updated);
  };

  const handleSettingsUpdate = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearData = () => {
    clearSettings();
    setSettings(getSettings()); // Reset to default
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-night-950 text-rose-500">Loading...</div>;

  // Onboarding Flow
  if (!settings?.isOnboarded) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // Main App Layout
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-night-950 dark:to-night-900 font-sans text-gray-900 dark:text-night-100 transition-colors duration-500">
        <Toaster position="top-center" richColors theme={settings.theme === Theme.DARK || settings.theme === Theme.AUTO ? 'dark' : 'light'} />
        
        <div className="max-w-md mx-auto bg-white dark:bg-night-950 min-h-screen shadow-2xl shadow-pink-100/50 dark:shadow-none relative transition-colors duration-500">
          <Routes>
            <Route path="/" element={<Dashboard settings={settings} />} />
            <Route 
              path="/calendar" 
              element={<CalendarView settings={settings} onUpdateDate={handleDateUpdate} />} 
            />
            <Route 
              path="/settings" 
              element={
                <SettingsView 
                  settings={settings} 
                  onUpdateSettings={handleSettingsUpdate} 
                  onClearData={handleClearData}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 max-w-md w-full bg-white dark:bg-night-900 border-t border-gray-100 dark:border-night-800 flex justify-around items-center p-2 pb-safe safe-area-inset-bottom z-50 transition-colors duration-300">
            <NavLink 
              to="/" 
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200
                ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-night-800' : 'text-gray-400 dark:text-night-700 hover:text-blue-500'}
              `}
            >
              <Home size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-medium mt-1">Cycle</span>
            </NavLink>
            
            <NavLink 
              to="/calendar" 
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200
                ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-night-800' : 'text-gray-400 dark:text-night-700 hover:text-blue-500'}
              `}
            >
              <CalendarIcon size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-medium mt-1">Calendar</span>
            </NavLink>

            <NavLink 
              to="/settings" 
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200
                ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-night-800' : 'text-gray-400 dark:text-night-700 hover:text-blue-500'}
              `}
            >
              <SettingsIcon size={24} strokeWidth={2.5} />
              <span className="text-[10px] font-medium mt-1">Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </Router>
  );
};

export default App;