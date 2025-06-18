import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import { useCalendarLogic } from '../hook2/Calendarlogic';

// Utility Functions
const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000) {
    return `${amount >= 0 ? '' : '-'}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${amount >= 0 ? '' : '-'}$${absAmount.toFixed(0)}`;
};

// Function to get the class for each day based on PnL
const getDayClass = (pnl: number) => {
    if (pnl > 15000) return 'bg-green-600';
    if (pnl > 5000) return 'bg-green-500';
    if (pnl > 0) return 'bg-green-400';
    if (pnl > -5000) return 'bg-red-400';
    if (pnl > -15000) return 'bg-red-500';
    return 'bg-red-600';
}

// UI components for the stats card, calendar header, and grid 
const StatsCard = ({ title, value, subtitle, hasTooltip = true }: any) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-400 text-sm">{title}</span>
      {hasTooltip && (
        <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-xs">?</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-green-400">
      {value}
    </div>
    {subtitle && (
      <div className="text-sm mt-1">
        {subtitle}
      </div>
    )}
  </div>
);

const CalendarHeader = ({ currentDate, onNavigate }: any) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-4">
      <button
        onClick={() => onNavigate(-1)}
        className="p-2 hover:bg-gray-700 rounded"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-semibold">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h2>
      <button
        onClick={() => onNavigate(1)}
        className="p-2 hover:bg-gray-700 rounded"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
    <div className="bg-gray-800 px-3 py-1 rounded text-sm">
      This month
    </div>
  </div>
);

const CalendarGrid = ({ days }: any) => (
  <div className="lg:col-span-3">
    {/* Day headers */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center text-gray-400 text-sm py-2">
          {day}
        </div>
      ))}
    </div>
    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-1">
      {days.map((dayInfo: any, index: number) => (
        <div
          key={index}
          className={`
            aspect-square p-2 border border-gray-700 relative
            ${!dayInfo.isCurrentMonth ? 'opacity-30' : ''}
            ${dayInfo.isToday ? 'ring-2 ring-blue-500' : ''}
            ${dayInfo.dayData ? getDayClass(dayInfo.dayData.pnl) : 'bg-gray-800'}
          `}
        >
          <div className="text-xs text-gray-300 mb-1">{dayInfo.day}</div>
          {dayInfo.dayData && (
            <div className="text-xs">
              <div className="font-semibold text-white">
                {formatCurrency(dayInfo.dayData.pnl)}
              </div>
              <div className="text-gray-300">
                {dayInfo.dayData.trades} trade{dayInfo.dayData.trades !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

{/*const WeeklySummary = ({ weeklyData }: any) => (
  <div className="space-y-4">
    {weeklyData && weeklyData.length > 0 ? (
      weeklyData.map((week: any, index: number) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Week {week.week || index + 1}</div>
          <div className={`text-xl font-bold mb-1 ${(week.pnl || week.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(week.pnl || week.total_pnl || 0)}
            </div>
          <div className="text-sm text-blue-400">
            {week.days || week.trading_days || 0} day{(week.days || week.trading_days || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      ))
    ) : (
      <div className="text-gray-400 text-center">No weekly data available</div>
    )}
  </div>
);*/}

const WeeklySummary = ({ weeklyData }: any) => (
    <div className="space-y-4">
      {weeklyData && weeklyData.length > 0 ? (
        weeklyData.map((week: any, index: number) => {
            console.log(`Week ${index + 1} data:`, week);
          // Try all possible field names for net profit
          const netPnl = week.weekly_pnl ?? week.total_pnl ?? week.pnl ?? 0;
          return (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">
                Week {week.week_number || index + 1}
              </div>
              <div className={`text-xl font-bold mb-1 ${netPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netPnl)}
              </div>
              <div className="text-sm text-blue-400">
                {week.trading_days || 0} day{(week.trading_days || 0) !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-gray-400 text-center">No weekly data available</div>
      )}
    </div>
  );
  

// Main Component
const Calendarbody = () => {
  const {
    currentDate,
    stats,
    weeklyData,
    getCalendarDays,
    navigateMonth,
    loading
  } = useCalendarLogic();

  console.log('Component render:', { stats, weeklyData, loading });

  const calendarDays = getCalendarDays();

  // Provide safe fallback values if stats is null
  const totalPnl = stats?.total_pnl ?? 0;
  const winRate = stats?.win_rate ?? 0;
  const avgWin = stats?.average_win ?? 0;
  const avgLoss = stats?.average_loss ?? 0;
  const tradingDays = stats?.trading_days ?? stats?.tradingDays ?? 0;

  return (
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Net P&L"
          value={formatCurrency(totalPnl)}
        />
        <StatsCard
          title="Trade win %"
          value={`${winRate.toFixed(2)}%`}
        />
        <StatsCard
          title="Avg win/loss trade"
          value={avgLoss !== 0 ? (avgWin / Math.abs(avgLoss)).toFixed(2) : '0.00'}
          subtitle={
            <div className="flex gap-4">
              <span className="text-green-400">{formatCurrency(avgWin)}</span>
              <span className="text-red-400">{formatCurrency(avgLoss)}</span>
            </div>
          }
        />
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Monthly stats:</div>
          <div className="flex gap-2 items-center">
            <span className="bg-green-600 px-2 py-1 rounded text-sm">
              {formatCurrency(totalPnl)}
            </span>
            <span className="text-blue-400 text-sm">{tradingDays} days</span>
          </div>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={navigateMonth}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <CalendarGrid days={calendarDays} />
        {/* Weekly Summary */}
        <WeeklySummary weeklyData={weeklyData} />
      </div>
      
      {loading && <div className="text-center mt-4 text-blue-400">Loading...</div>}

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-gray-800 rounded text-xs">
          <div>Loading: {loading.toString()}</div>
          <div>Stats: {JSON.stringify(stats, null, 2)}</div>
          <div>Weekly Data Count: {weeklyData?.length || 0}</div>
        </div>
      )}
    </div>
  );
};

export default Calendarbody;