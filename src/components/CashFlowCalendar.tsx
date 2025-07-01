import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, DollarSign, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { CashFlowEvent, Currency } from '../types';
import { formatCurrency } from '../utils/advancedCalculations';

interface CashFlowCalendarProps {
  events: CashFlowEvent[];
  currency: Currency;
}

const CashFlowCalendar: React.FC<CashFlowCalendarProps> = ({ events, currency }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getCalendarDays = () => {
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      return days;
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startOfCalendar = new Date(startOfMonth);
      startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());
      
      const days = [];
      const totalDays = 42; // 6 weeks
      
      for (let i = 0; i < totalDays; i++) {
        const day = new Date(startOfCalendar);
        day.setDate(startOfCalendar.getDate() + i);
        days.push(day);
      }
      
      return days;
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-3 w-3" />;
      case 'expense': return <TrendingDown className="h-3 w-3" />;
      case 'bill': return <Clock className="h-3 w-3" />;
      case 'loan_payment': return <DollarSign className="h-3 w-3" />;
      case 'goal_contribution': return <Target className="h-3 w-3" />;
      default: return <DollarSign className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === 'overdue') return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
    
    switch (type) {
      case 'income': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'expense': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'bill': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'loan_payment': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'goal_contribution': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  // Calculate daily net flow
  const getDailyNetFlow = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const income = dayEvents
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const expenses = dayEvents
      .filter(e => e.type !== 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    return income - expenses;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Flow Calendar</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Visualize your upcoming income and expenses</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <button
            onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            }
          </h3>
          
          <button
            onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-1 mb-2`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-1`}>
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const netFlow = getDailyNetFlow(date);
              const isToday = date.toDateString() === today.toDateString();
              const isCurrentMonthDay = isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border border-gray-200 dark:border-gray-600 rounded-lg ${
                    isToday 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${
                    !isCurrentMonthDay && viewMode === 'month' 
                      ? 'opacity-40' 
                      : ''
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      isToday 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {date.getDate()}
                    </span>
                    {netFlow !== 0 && (
                      <span className={`text-xs font-medium ${
                        netFlow > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {netFlow > 0 ? '+' : ''}{formatCurrency(netFlow, currency)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div 
                        key={eventIndex}
                        className={`flex items-center text-xs p-1 rounded ${getEventColor(event.type, event.status)}`}
                      >
                        <span className="mr-1">{getEventIcon(event.type)}</span>
                        <span className="truncate">{event.name}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Expense</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Bill</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Loan Payment</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Goal Contribution</span>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.type, event.status)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      event.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount, currency)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.isRecurring ? 'Recurring' : 'One-time'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CashFlowCalendar;