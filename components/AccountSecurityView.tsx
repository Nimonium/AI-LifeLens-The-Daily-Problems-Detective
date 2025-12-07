import React from 'react';
import { ArrowLeft, Shield, Lock, Smartphone } from 'lucide-react';

interface AccountSecurityViewProps {
  onBack: () => void;
}

export const AccountSecurityView: React.FC<AccountSecurityViewProps> = ({ onBack }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg px-2 py-1 -ml-2 group"
      >
        <div className="p-1 rounded-md group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        Back to Settings
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 transition-colors">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          Account Security
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14 transition-colors">
          Manage your password and security preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Login & Recovery</h2>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="p-6 flex items-start gap-4">
            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white transition-colors">Password</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Last changed 3 months ago
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Change
            </button>
          </div>

          <div className="p-6 flex items-start gap-4">
            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white transition-colors">Two-Factor Authentication</h3>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">Enabled</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Your account is protected with 2FA via authenticator app.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};