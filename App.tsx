
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { ResultsView } from './components/ResultsView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { AccountSecurityView } from './components/AccountSecurityView';
import { LoginView } from './components/LoginView';
import { AppView, ScanResult, UserProfile } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Productivity Enthusiast'
  });

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleScanComplete = (result: ScanResult) => {
    setScans(prev => [result, ...prev]);
    setActiveScan(result);
    setCurrentView(AppView.RESULTS);
  };

  const handleViewResult = (scan: ScanResult) => {
    setActiveScan(scan);
    setCurrentView(AppView.RESULTS);
  };

  const handleDeleteScan = (scanId: string) => {
    setScans(prev => prev.filter(s => s.id !== scanId));
    if (activeScan && activeScan.id === scanId) {
      setActiveScan(null);
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleClearData = () => {
    setScans([]);
    setActiveScan(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            scans={scans} 
            onNavigate={setCurrentView} 
            onViewResult={handleViewResult}
            onDeleteScan={handleDeleteScan}
          />
        );
      case AppView.SCANNER:
        return (
          <Scanner 
            onScanComplete={handleScanComplete} 
            onCancel={() => setCurrentView(AppView.DASHBOARD)} 
          />
        );
      case AppView.RESULTS:
        if (!activeScan) return <Dashboard scans={scans} onNavigate={setCurrentView} onViewResult={handleViewResult} onDeleteScan={handleDeleteScan} />;
        return (
          <ResultsView 
            scan={activeScan} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
            onDeleteScan={handleDeleteScan}
          />
        );
      case AppView.CALENDAR:
        return <CalendarView scans={scans} />;
      case AppView.SETTINGS:
        return (
          <SettingsView 
            isDarkMode={isDarkMode} 
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
            onNavigate={setCurrentView}
            onClearData={handleClearData}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            onLogout={handleLogout}
          />
        );
      case AppView.ACCOUNT_SECURITY:
        return (
          <AccountSecurityView 
            onBack={() => setCurrentView(AppView.SETTINGS)}
          />
        );
      default:
        return <Dashboard scans={scans} onNavigate={setCurrentView} onViewResult={handleViewResult} onDeleteScan={handleDeleteScan} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex font-sans text-slate-600 dark:text-slate-300 transition-colors duration-200">
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          userProfile={userProfile}
        />
        
        <main className="flex-1 md:ml-64 relative">
          {renderContent()}
        </main>
        
        {/* Mobile nav placeholder (simplified) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-around z-30 transition-colors duration-200">
          <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`text-xs flex flex-col items-center gap-1 font-medium ${currentView === AppView.DASHBOARD ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Home</button>
          <button onClick={() => setCurrentView(AppView.SCANNER)} className={`text-xs flex flex-col items-center gap-1 font-medium ${currentView === AppView.SCANNER ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Scan</button>
          <button onClick={() => setCurrentView(AppView.CALENDAR)} className={`text-xs flex flex-col items-center gap-1 font-medium ${currentView === AppView.CALENDAR ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Calendar</button>
          <button onClick={() => setCurrentView(AppView.SETTINGS)} className={`text-xs flex flex-col items-center gap-1 font-medium ${currentView === AppView.SETTINGS || currentView === AppView.ACCOUNT_SECURITY ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Settings</button>
        </div>
      </div>
    </div>
  );
}

export default App;
