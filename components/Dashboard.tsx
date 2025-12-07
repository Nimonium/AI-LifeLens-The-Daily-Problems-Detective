import React, { useState } from 'react';
import { ScanResult, Task, AppView } from '../types';
import { Plus, Clock, CheckCircle2, ArrowRight, BrainCircuit, Trash2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  scans: ScanResult[];
  onNavigate: (view: AppView) => void;
  onViewResult: (scan: ScanResult) => void;
  onDeleteScan: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ scans, onNavigate, onViewResult, onDeleteScan }) => {
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);

  // Aggregate data
  const totalTasks = scans.reduce((acc, scan) => acc + scan.tasks.length, 0);
  const totalEvents = scans.reduce((acc, scan) => acc + scan.events.length, 0);
  
  // Dummy data for the chart
  const data = [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 7 },
    { name: 'Thu', tasks: 2 },
    { name: 'Fri', tasks: 6 },
    { name: 'Sat', tasks: 8 },
    { name: 'Sun', tasks: 5 },
  ];

  const handleConfirmDelete = () => {
    if (scanToDelete) {
      onDeleteScan(scanToDelete);
      setScanToDelete(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Good Morning, John</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">You have {totalTasks} pending tasks and {totalEvents} upcoming events.</p>
        </div>
        <button 
          onClick={() => onNavigate(AppView.SCANNER)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Scan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-40 transition-colors">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">+12%</span>
           </div>
           <div>
             <span className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{totalTasks}</span>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Total Tasks Extracted</p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-40 transition-colors">
           <div className="flex justify-between items-start">
             <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
               <Clock className="w-6 h-6" />
             </div>
           </div>
           <div>
             <span className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{totalEvents}</span>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Upcoming Events</p>
           </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between h-40 relative overflow-hidden">
           <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
               <BrainCircuit className="w-5 h-5" />
               <span className="font-semibold text-white/90">LifeLens AI</span>
             </div>
             <p className="text-sm text-indigo-100 leading-relaxed">
               Your productivity has increased by digitizing {scans.length} physical documents this week.
             </p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Scans List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Recent Scans</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">View All</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scans.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                 <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                   <Clock className="text-slate-400 w-6 h-6" />
                 </div>
                 <p className="text-slate-500 dark:text-slate-400 font-medium">No scans yet. Start by scanning your desk!</p>
              </div>
            ) : (
              scans.map(scan => (
                <div key={scan.id} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative" onClick={() => onViewResult(scan)}>
                  <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-700 mb-4 overflow-hidden relative">
                    <img src={scan.imageUrl} alt="Scan thumbnail" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 transition-colors">{scan.summary}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> {scan.tasks.length} Tasks
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" /> {scan.events.length} Events
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setScanToDelete(scan.id); }}
                    className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Productivity Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 transition-colors">Activity Overview</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="tasks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl transition-colors">
             <div>
               <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Category</p>
               <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Academic Notes</p>
             </div>
             <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>

      </div>

      {/* Delete Scan Confirmation Modal */}
      {scanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Scan?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this scan result? All extracted tasks and events will be removed.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setScanToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};