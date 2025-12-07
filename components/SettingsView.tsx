
import React, { useState, useRef } from 'react';
import { User, Bell, Shield, Moon, LogOut, ChevronRight, AlertTriangle, Database, Trash2, Check, X, Camera } from 'lucide-react';
import { AppView, UserProfile } from '../types';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (view: AppView) => void;
  onClearData: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  onNavigate, 
  onClearData,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailDigest: false,
    calendarSync: true
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  
  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleClearDataConfirm = () => {
    onClearData();
    setShowClearDataConfirm(false);
  };

  const handleStartEdit = () => {
    setTempProfile(userProfile);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = () => {
    onUpdateProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate initials for avatar fallback
  const initials = userProfile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 relative pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">Manage your account preferences and application settings.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
           <div className="relative group shrink-0">
             {isEditingProfile ? (
               <div 
                 className="w-20 h-20 rounded-full cursor-pointer relative overflow-hidden"
                 onClick={() => fileInputRef.current?.click()}
               >
                 {tempProfile.avatar ? (
                   <img src={tempProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                     {initials}
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="text-white w-6 h-6" />
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={handleAvatarChange}
                 />
               </div>
             ) : (
               <div className="w-20 h-20 rounded-full overflow-hidden">
                 {userProfile.avatar ? (
                   <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                     {initials}
                   </div>
                 )}
               </div>
             )}
           </div>
           
           <div className="flex-1 w-full text-center sm:text-left space-y-2 sm:space-y-0">
             {isEditingProfile ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                   <input 
                     type="text" 
                     value={tempProfile.name}
                     onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                     placeholder="John Doe"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role / Bio</label>
                   <input 
                     type="text" 
                     value={tempProfile.role || ''}
                     onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})}
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                     placeholder="Product Manager"
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                   <input 
                     type="email" 
                     value={tempProfile.email}
                     onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                     placeholder="john@example.com"
                   />
                 </div>
               </div>
             ) : (
               <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">{userProfile.name}</h3>
                 <p className="text-slate-500 dark:text-slate-400 transition-colors font-medium">{userProfile.role || 'No Role Set'}</p>
                 <p className="text-slate-400 dark:text-slate-500 text-sm transition-colors mt-1">{userProfile.email}</p>
               </div>
             )}
           </div>

           <div className="flex gap-2 w-full sm:w-auto self-start">
             {isEditingProfile ? (
               <>
                 <button 
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                 >
                   <X className="w-4 h-4" /> Cancel
                 </button>
                 <button 
                    onClick={handleSaveProfile}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                 >
                   <Check className="w-4 h-4" /> Save
                 </button>
               </>
             ) : (
               <button 
                  onClick={handleStartEdit}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
               >
                 Edit Profile
               </button>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* General Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            General
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            <div 
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => onNavigate(AppView.ACCOUNT_SECURITY)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white transition-colors">Account Security</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Password, 2FA</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
             <div 
               className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
               onClick={onToggleDarkMode}
             >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white transition-colors">Appearance</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{isDarkMode ? 'Dark mode active' : 'Light mode active'}</p>
                </div>
              </div>
              {/* Toggle Switch */}
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Notifications
          </div>
          <div className="p-4 space-y-4">
             {/* Push Notifications Toggle */}
             <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePreference('notifications')}>
                <div>
                   <p className="font-medium text-slate-900 dark:text-white transition-colors">Push Notifications</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Receive alerts on your device</p>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors ${preferences.notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifications ? 'left-6' : 'left-1'}`}></div>
                </div>
             </div>

             {/* Email Digest Toggle */}
             <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePreference('emailDigest')}>
                <div>
                   <p className="font-medium text-slate-900 dark:text-white transition-colors">Email Digest</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Daily summary of tasks</p>
                </div>
                 <div className={`w-11 h-6 rounded-full relative transition-colors ${preferences.emailDigest ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.emailDigest ? 'left-6' : 'left-1'}`}></div>
                </div>
             </div>

              {/* Calendar Sync Toggle */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePreference('calendarSync')}>
                <div>
                   <p className="font-medium text-slate-900 dark:text-white transition-colors">Calendar Sync</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Auto-add events</p>
                </div>
                <div className={`w-11 h-6 rounded-full relative transition-colors ${preferences.calendarSync ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.calendarSync ? 'left-6' : 'left-1'}`}></div>
                </div>
             </div>
          </div>
        </div>

        {/* Data & Storage Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <Database className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Data & Storage
          </div>
          <div className="p-4">
             <div 
               className="flex items-center justify-between cursor-pointer group"
               onClick={() => setShowClearDataConfirm(true)}
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white transition-colors">Clear All Data</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Delete all scans and history</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg">
                  Local
                </div>
             </div>
          </div>
        </div>

      </div>

      <button 
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-500 dark:text-slate-400">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to sign out? You'll need to sign back in to access your data.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Clear All Data?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                This action will permanently delete all your scanned documents, tasks, and events. <span className="font-bold text-red-500">This cannot be undone.</span>
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowClearDataConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearDataConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
