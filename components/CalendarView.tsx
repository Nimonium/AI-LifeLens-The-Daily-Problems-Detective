import React, { useState, useMemo } from 'react';
import { ScanResult, Event } from '../types';
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';

interface CalendarViewProps {
  scans: ScanResult[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ scans }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Aggregate and sort all events by date/time
  const allEvents = useMemo(() => {
    return scans.flatMap(scan => scan.events).sort((a, b) => {
      // Basic time sort if available
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
  }, [scans]);
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const parseEventDate = (dateString: string) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return new Date(dateString);
    // Note: Month is 0-indexed in Date constructor
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const onDateClick = (date: Date) => {
    setSelectedDate(date);
    // If clicking a date in a different month (prev/next padding), switch view
    if (date.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const selectedEvents = useMemo(() => {
    return allEvents.filter(e => {
      if (!e.date) return false;
      const eventDate = parseEventDate(e.date);
      return eventDate && isSameDay(eventDate, selectedDate);
    });
  }, [allEvents, selectedDate]);

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate); // 0 = Sun
    
    // Previous month calculation
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate);
    
    const days = [];

    // Previous Month Padding
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), dayNum);
      days.push({ date, isCurrentMonth: false });
    }

    // Current Month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next Month Padding (fill to complete 42 cells for 6 rows)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        days.push({ date, isCurrentMonth: false });
    }

    return days.map((item, idx) => {
       const isToday = isSameDay(item.date, new Date());
       const isSelected = isSameDay(item.date, selectedDate);
       
       const dayEvents = allEvents.filter(e => {
        if (!e.date) return false;
        const eventDate = parseEventDate(e.date);
        return eventDate && isSameDay(eventDate, item.date);
      });

      return (
        <div 
          key={`${item.date.toISOString()}-${idx}`} 
          onClick={() => onDateClick(item.date)}
          className={`
            min-h-[6rem] md:min-h-[8rem] border-b border-r border-slate-100 dark:border-slate-700 p-2 relative cursor-pointer transition-colors
            ${item.isCurrentMonth ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600'}
            ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.4)] z-10' : ''}
          `}
        >
           <div className="flex justify-between items-start">
            <span className={`
              w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors
              ${isToday ? 'bg-indigo-600 text-white shadow-md' : item.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}
            `}>
              {item.date.getDate()}
            </span>
            {dayEvents.length > 0 && (
              <span className="md:hidden w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-1"></span>
            )}
          </div>
          
          <div className="mt-1 space-y-1 hidden md:block">
            {dayEvents.slice(0, 3).map((event, eIdx) => (
              <div key={eIdx} className={`
                text-[10px] px-1.5 py-0.5 rounded-md truncate border transition-colors
                ${item.isCurrentMonth 
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 border-indigo-100 dark:border-indigo-800/50' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 opacity-60'}
              `}>
                {event.time ? <span className="opacity-70 font-mono mr-1">{event.time}</span> : ''}{event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-1 flex items-center gap-1 font-medium">
                <MoreHorizontal className="w-3 h-3" /> {dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Calendar Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 transition-colors z-20 shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white transition-colors flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 hidden md:block" />
            Calendar
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm transition-colors">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-md text-slate-500 dark:text-slate-300 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="w-32 text-center font-semibold text-slate-700 dark:text-slate-200 transition-colors select-none text-sm md:text-base">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-md text-slate-500 dark:text-slate-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button 
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDate(now);
              }}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors bg-white dark:bg-slate-800"
            >
              Today
            </button>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 transition-colors shadow-sm z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-800 transition-colors">
          <div className="grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors pb-12 md:pb-0">
            {renderCalendarGrid()}
          </div>
        </div>
      </div>

      {/* Side Panel for Selected Date */}
      <div className="w-full lg:w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-1/3 lg:h-full shrink-0 shadow-2xl lg:shadow-none z-30 transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-colors shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
               <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-1 transition-colors font-medium">
             {selectedEvents.length === 1 ? '1 Event' : `${selectedEvents.length} Events`} scheduled
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">No events for this day</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[150px] transition-colors">Scan a document or sync your calendar to add events.</p>
            </div>
          ) : (
            selectedEvents.map((event, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all cursor-default">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight transition-colors">{event.title}</h4>
                   {event.time && (
                     <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                       {event.time}
                     </span>
                   )}
                </div>
                
                 {event.location && (
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                     <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                     <span className="truncate">{event.location}</span>
                   </div>
                 )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};