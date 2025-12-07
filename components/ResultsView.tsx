import React, { useState, useMemo, useEffect } from 'react';
import { ScanResult, Priority } from '../types';
import { ArrowLeft, Download, Share2, Calendar, CheckSquare, StickyNote, GraduationCap, MapPin, Clock, Filter, ArrowUpDown, Trash2, AlertTriangle } from 'lucide-react';

interface ResultsViewProps {
  scan: ScanResult;
  onBack: () => void;
  onDeleteScan: (id: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ scan, onBack, onDeleteScan }) => {
  // Local state for tasks to handle completion toggling and deletion
  const [localTasks, setLocalTasks] = useState(scan.tasks);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showDeleteScanConfirm, setShowDeleteScanConfirm] = useState(false);
  
  // Sync local tasks if the scan prop changes (e.g., re-analyzing)
  useEffect(() => {
    setLocalTasks(scan.tasks);
  }, [scan.tasks]);

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskSort, setTaskSort] = useState<'deadline' | 'priority' | 'title'>('deadline');

  const handleToggleTask = (taskId: string) => {
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setLocalTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  const handleDeleteScanConfirm = () => {
    onDeleteScan(scan.id);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let processed = [...localTasks];

    // Filter
    if (taskFilter === 'pending') processed = processed.filter(t => !t.completed);
    if (taskFilter === 'completed') processed = processed.filter(t => t.completed);

    // Sort
    processed.sort((a, b) => {
      if (taskSort === 'deadline') {
        // Handle missing deadlines (put them last)
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      if (taskSort === 'priority') {
        const priorityWeight = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (taskSort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return processed;
  }, [localTasks, taskFilter, taskSort]);

  const completedCount = localTasks.filter(t => t.completed).length;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200 relative">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Scan Results</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{new Date(scan.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setShowDeleteScanConfirm(true)}
             className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg flex items-center gap-2 transition-colors mr-2"
          >
             <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image & Items */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-900 dark:text-white transition-colors">Original Scan</div>
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative group">
                <img src={scan.imageUrl} alt="Original" className="w-full h-full object-contain" />
                {/* Simulated bounding boxes overlay could go here */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            </div>

            {scan.itemsDetected.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Detected Items
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scan.itemsDetected.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-slate-200 dark:border-slate-600 transition-colors">
                      {item.name} <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">{(item.confidence * 100).toFixed(0)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {scan.studyPlan && scan.studyPlan.length > 0 && (
               <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-6 transition-colors">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2 transition-colors">
                  <GraduationCap className="w-5 h-5" />
                  AI Study Plan
                </h3>
                <ul className="space-y-3">
                  {scan.studyPlan.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-indigo-800 dark:text-indigo-200 text-sm transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 bg-white dark:bg-indigo-900 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 shadow-sm transition-colors">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Extracted Data */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Summary */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">AI Summary</h3>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed transition-colors">{scan.summary}</p>
            </div>

            {/* Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                    Action Items
                  </h3>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold transition-colors">
                      {localTasks.length} Total
                    </span>
                    {completedCount > 0 && (
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold transition-colors">
                        {completedCount} Done
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Filter Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value as any)}
                      className="w-full sm:w-32 appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={taskSort}
                      onChange={(e) => setTaskSort(e.target.value as any)}
                      className="w-full sm:w-32 appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                    >
                      <option value="deadline">Deadline</option>
                      <option value="priority">Priority</option>
                      <option value="title">Name</option>
                    </select>
                    <ArrowUpDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredAndSortedTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    {localTasks.length === 0 ? "No tasks found" : "No tasks match your filter"}
                  </div>
                ) : (
                  filteredAndSortedTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="group p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <div 
                         className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            task.completed 
                              ? 'bg-emerald-500 border-emerald-500 scale-105' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                          }`}
                         onClick={() => handleToggleTask(task.id)}
                      >
                        <CheckSquare className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${task.completed ? 'scale-100' : 'scale-0'}`} />
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                        <p className={`text-slate-900 dark:text-slate-200 font-medium transition-all duration-300 ${
                          task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}>
                          {task.title}
                        </p>
                        <div className={`flex items-center gap-3 mt-1.5 transition-opacity duration-300 ${task.completed ? 'opacity-50' : 'opacity-100'}`}>
                          {task.deadline && (
                            <span className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 transition-colors">
                              <Calendar className="w-3 h-3" /> Due: {task.deadline}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.priority === Priority.HIGH ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                            task.priority === Priority.MEDIUM ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          } transition-colors`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); confirmDeleteTask(task.id); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Events */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Events Detected
                </h3>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold transition-colors">{scan.events.length}</span>
              </div>
              <div className="p-4 grid gap-4">
                {scan.events.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 dark:text-slate-500">No events found</div>
                ) : (
                  scan.events.map(event => (
                    <div key={event.id} className="flex bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 transition-colors">
                      <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-2 w-16 h-16 mr-4 shadow-sm transition-colors">
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{new Date(event.date || Date.now()).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-xl font-bold text-slate-900 dark:text-white">{new Date(event.date || Date.now()).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white transition-colors">{event.title}</h4>
                        <div className="flex flex-wrap gap-4 mt-2">
                           {event.time && (
                             <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-colors">
                               <Clock className="w-3 h-3" /> {event.time}
                             </span>
                           )}
                           {event.location && (
                             <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-colors">
                               <MapPin className="w-3 h-3" /> {event.location}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                  <StickyNote className="w-5 h-5 text-amber-500" />
                  Notes & Details
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {scan.notes.length === 0 ? (
                    <div className="col-span-2 p-4 text-center text-slate-400 dark:text-slate-500">No notes found</div>
                 ) : (
                    scan.notes.map(note => (
                      <div key={note.id} className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 relative transition-colors">
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-r-[16px] border-t-white dark:border-t-slate-800 border-r-amber-100/50 dark:border-r-amber-900/30 rounded-bl-lg transition-colors"></div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 text-sm transition-colors">{note.title || 'Untitled Note'}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 transition-colors">{note.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-sm transition-colors">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                 )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Task?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Scan Confirmation Modal */}
      {showDeleteScanConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Scan Result?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this entire scan result? This will remove all associated tasks, events, and notes.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteScanConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteScanConfirm}
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