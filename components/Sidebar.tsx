
import React from 'react';
import { LayoutDashboard, Camera, Calendar, FileText, Settings, LogOut } from 'lucide-react';
import { AppView, UserProfile } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  userProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userProfile }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.SCANNER, label: 'New Scan', icon: Camera },
    { id: AppView.CALENDAR, label: 'Calendar', icon: Calendar },
    { id: AppView.DOCUMENTS, label: 'Documents', icon: FileText },
  ];

  // Generate initials for avatar fallback
  const initials = userProfile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-screen w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed left-0 top-0 z-20 hidden md:flex transition-colors duration-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Camera className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white transition-colors">LifeLens</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700 transition-colors">
        <button 
          onClick={() => onChangeView(AppView.SETTINGS)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
             currentView === AppView.SETTINGS
               ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
               : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentView === AppView.SETTINGS ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'}`} />
          Settings
        </button>
        <div className="mt-4 flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-indigo-200 dark:border-indigo-800 bg-indigo-100 dark:bg-indigo-900/50">
             {userProfile.avatar ? (
               <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                 {initials}
               </div>
             )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors">{userProfile.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">{userProfile.role || 'Free Plan'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
