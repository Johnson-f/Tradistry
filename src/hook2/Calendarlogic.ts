import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useCalendarLogic = (initialDate = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate); // Which month the calendar is currently showing
    const [tradingData, setTradingData] = useState<Record<number, { pnl: number; trades: number }>>({}); // Grouped entries by day
    const [loading, setLoading] = useState(true); // Loading state for the calendar 
    const [stats, setStats] = useState<any>(null); // Summary statistics for the current month
    const [entries, setEntries] = useState<any[]>([]); 

    // Fetch entries for the current month
    useEffect(() => {
        const fetchEntries = async () => {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const from = `${year}-${month.toString().padStart(2, '0')}-01`;
            const to = new Date(year, month, 0);
            const toStr = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                // Fetch aggregated trading data by day using RPC
                const { data: aggData, error: aggError } = await supabase
                .rpc('aggregate_tradesby_day', {
                    p_start_date: from,
                    p_end_date: toStr
                });
            if (aggError) {
                console.error(aggError);
                setTradingData({});
            } else if (aggData) {
                const grouped: Record<number, { pnl: number; trades: number }> = {};
                aggData.forEach((row: any) => {
                    {/*grouped[row.day] = { pnl: row.pnl, trades: row.trades };*/}
                    const day = new Date(row.entry_date).getDate();
                    grouped[day] = { pnl: row.total_pnl, trades: row.total_trades };
                });
                setTradingData(grouped);
            } else {
                setTradingData({});
            }
            setLoading(false);
        };
        fetchEntries();
    }, [currentDate]);

          // Summary statistics for the current month using RPC
             useEffect(() => {
                const fetchStats = async () => {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth() + 1;
                    const p_start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
                    const to = new Date(year, month, 0);
                    const p_end_date = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                    let { data, error } = await supabase  
                        .rpc('monthly_trading_summary', {
                            p_end_date,
                            p_start_date
                        });
                        if (error) {
                            console.error(error);
                            setStats(null);
                        } else {
                            setStats(data && data[0] ? data[0] : null);
                        }
                    };
                fetchStats();
             }, [currentDate]);

            // Group trades by week (replace this with rpc)
            // . weeklyData (Group days into weeks, calculate weekly PnL)
            const weeklyData = useMemo(() => {
                const weeks = [];
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
            
                let weekStart = new Date(firstDay);
                weekStart.setDate(firstDay.getDate() - firstDay.getDay());
            
                let weekNum = 1;
                while (weekStart <= lastDay) {
                  let weekPnL = 0;
                  let weekDays = 0;
            
                  for (let i = 0; i < 7; i++) {
                    const currentDay = new Date(weekStart);
                    currentDay.setDate(weekStart.getDate() + i);
            
                    if (currentDay.getMonth() === month) {
                      const dayData = tradingData[currentDay.getDate()];
                      if (dayData) {
                        weekPnL += dayData.pnl;
                        weekDays++;
                      }
                    }
                  }

                  if (weekDays > 0) {
                    weeks.push({
                      week: weekNum,
                      pnl: weekPnL,
                      days: weekDays
                    });
                    weekNum++;
                  }
            
                  weekStart.setDate(weekStart.getDate() + 7);
                }
            
                return weeks;
              }, [currentDate, tradingData]);

              // Builds the calendar grid
              const getCalendarDays = () => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const startDate = new Date(firstDay);
                startDate.setDate(firstDay.getDate() - firstDay.getDay());
            
                const days = [];
                const current = new Date(startDate);
            
                for (let i = 0; i < 42; i++) {
                  const day = current.getDate();
                  const isCurrentMonth = current.getMonth() === month;
                  const dayData = isCurrentMonth ? tradingData[day] : null;
                  const isToday = current.toDateString() === new Date().toDateString();
            
                  days.push({
                    day,
                    isCurrentMonth,
                    dayData,
                    isToday,
                    date: new Date(current)
                  });
            
                  current.setDate(current.getDate() + 1);
                }

                return days;
  };

  // Function to navigate to the previous/next month
  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Function to return 
  return {
    currentDate,
    tradingData,
    stats,
    weeklyData,
    getCalendarDays,
    navigateMonth,
    loading
  };
};