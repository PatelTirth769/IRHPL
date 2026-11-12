import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, startOfDay 
} from 'date-fns';
import { calendarService } from '../services/calendar.service';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_TYPES = {
  pass_deadline: { label: 'Pass Deadlines', color: 'bg-blue-500', dot: 'bg-blue-500' },
  expiry: { label: 'Pass/Doc Expiries', color: 'bg-rose-500', dot: 'bg-rose-500' },
  license_expiry: { label: 'License Expiries', color: 'bg-amber-500', dot: 'bg-amber-500' },
  license_renewal: { label: 'License Renewals', color: 'bg-emerald-500', dot: 'bg-emerald-500' }
};

const CalendarIndex = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'list'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    pass_deadline: true,
    expiry: true,
    license_expiry: true,
    license_renewal: true
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await calendarService.getEvents();
      // Ensure we parse ISO dates correctly, store a raw Date object for easy comparison
      const formattedEvents = (res.data?.data || []).map(e => ({
        ...e,
        parsedDate: parseISO(e.date)
      }));
      setEvents(formattedEvents);
    } catch (err) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredEvents = events.filter(e => filters[e.type]);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 transition">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 w-48 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 transition">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('month')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Month</span>
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <List className="w-4 h-4" />
            <span>Agenda</span>
          </button>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(EVENT_TYPES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters[key] 
                ? `${config.color.replace('500', '100')} text-${config.color.replace('bg-', '').replace('500', '800')} border-${config.color.replace('bg-', '').replace('500', '200')}`
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${filters[key] ? config.dot : 'bg-slate-300'}`}></span>
            {config.label}
          </button>
        ))}
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-xs text-slate-500 uppercase tracking-wider py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-slate-200">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Find events for this day
        const dayEvents = filteredEvents.filter(e => isSameDay(e.parsedDate, cloneDay));
        
        // Group dots to max 4 to avoid overflow
        const displayEvents = dayEvents.slice(0, 4);
        const moreCount = dayEvents.length - 4;

        days.push(
          <div
            key={day}
            className={`min-h-[100px] bg-white border-b border-r border-slate-100 p-2 transition hover:bg-slate-50
              ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 text-slate-400' : 'text-slate-700'}
              ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}
            `}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}
              `}>
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-2 space-y-1">
              {displayEvents.map(e => (
                <div 
                  key={e.id}
                  onClick={() => navigate(e.link)}
                  className={`text-[10px] leading-tight px-1.5 py-1 rounded truncate cursor-pointer font-medium
                    ${EVENT_TYPES[e.type].color.replace('500', '100')} text-${EVENT_TYPES[e.type].color.replace('bg-', '').replace('500', '800')}
                    hover:brightness-95
                  `}
                  title={e.title}
                >
                  {e.title}
                </div>
              ))}
              {moreCount > 0 && (
                <div className="text-[10px] text-slate-500 font-medium px-1">
                  +{moreCount} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-slate-100">{rows}</div>;
  };

  const renderAgenda = () => {
    // Sort events upcoming from today onwards
    const upcomingEvents = filteredEvents
      .filter(e => e.parsedDate >= startOfDay(new Date())) // We don't have startOfDay imported, let's just sort all
      .sort((a, b) => a.parsedDate - b.parsedDate);

    if (upcomingEvents.length === 0) {
      return (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-500 font-medium">No upcoming events found for selected filters.</h3>
        </div>
      );
    }

    let currentDateHeader = '';

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {upcomingEvents.map(e => {
            const dateStr = format(e.parsedDate, 'EEEE, MMMM d, yyyy');
            const showHeader = dateStr !== currentDateHeader;
            if (showHeader) currentDateHeader = dateStr;

            return (
              <div key={e.id}>
                {showHeader && (
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    {dateStr}
                  </div>
                )}
                <div 
                  onClick={() => navigate(e.link)}
                  className="p-4 flex items-center hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full mr-4 ${EVENT_TYPES[e.type].dot}`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{e.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{EVENT_TYPES[e.type].label}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">Unified view of all deadlines, expiries, and renewals.</p>
      </div>

      {renderFilters()}

      {loading ? (
        <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          Loading calendar data...
        </div>
      ) : (
        <>
          {view === 'month' && (
            <div>
              {renderHeader()}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {renderDays()}
                {renderCells()}
              </div>
            </div>
          )}

          {view === 'list' && (
            <div>
              {renderHeader()}
              {renderAgenda()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarIndex;
