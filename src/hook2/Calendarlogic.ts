import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useCalendarLogic = (initialDate = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate); // Which month the calendar is currently showing
    const [tradingData, setTradingData] = useState<Record<number, { pnl: number; trades: number }>>({}); // Grouped entries by day
    const [loading, setLoading] = useState(true); // Loading state for the calendar 
    const [stats, setStats] = useState<any>(null); // Summary statistics for the current month
    const [weeklyData, setWeeklyData] = useState<any[]>([]); // Final, augmented weekly data
    const [rawWeeklyData, setRawWeeklyData] = useState<any[]>([]); // Data directly from RPC
    const [entries, setEntries] = useState<any[]>([]); 

    // Fetch entries for the current month (now includes both entry_table and option_table)
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                setLoading(true);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const from = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const toStr = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching combined trading data for:', { from, toStr });

                // Fetch aggregated trading data by day using RPC (now includes options)
                const { data: aggData, error: aggError } = await supabase
                    .rpc('aggregate_tradesby_day', {
                        p_start_date: from,
                        p_end_date: toStr
                    });
                
                console.log('Combined RPC Response (entries + options):', { aggData, aggError });

                if (aggError) {
                    console.error('Error fetching combined trading data:', aggError);
                    setTradingData({});
                } else if (aggData && aggData.length > 0) {
                    const grouped: Record<number, { pnl: number; trades: number }> = {};
                    aggData.forEach((row: any) => {
                        const day = new Date(row.entry_date).getDate();
                        grouped[day] = { 
                            pnl: parseFloat(row.total_pnl) || 0, 
                            trades: parseInt(row.total_trades) || 0 
                        };
                    });
                    console.log('Combined grouped data (entries + options):', grouped);
                    setTradingData(grouped);
                } else {
                    console.log('No combined trading data returned from RPC');
                    setTradingData({});
                }
            } catch (error) {
                console.error('Error in fetchEntries:', error);
                setTradingData({});
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [currentDate]);

    // Summary statistics for the current month using RPC (now includes options)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const p_start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const p_end_date = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching combined stats for:', { p_start_date, p_end_date });

                const { data, error } = await supabase  
                    .rpc('monthly_trading_summary', {
                        p_start_date,
                        p_end_date
                    });

                console.log('Combined Stats RPC Response (entries + options):', { data, error });

                if (error) {
                    console.error('Error fetching combined stats:', error);
                    setStats(null);
                } else {
                    setStats(data && data.length > 0 ? data[0] : null);
                }
            } catch (error) {
                console.error('Error in fetchStats:', error);
                setStats(null);
            }
        };
        fetchStats();
    }, [currentDate]);

    // Group trades by week using RPC (now includes options)
    useEffect(() => {
        const fetchWeeklySummary = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const p_start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const p_end_date = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching combined weekly summary for:', { p_start_date, p_end_date });

                const { data, error } = await supabase
                    .rpc('weekly_summary', {
                        p_start_date,
                        p_end_date
                    });

                console.log('Combined Weekly RPC Response (entries + options):', { data, error });

                if (error) {
                    console.error('Error fetching combined weekly summary:', error);
                    setRawWeeklyData([]);
                } else {
                    setRawWeeklyData(data || []);
                }
            } catch (error) {
                console.error('Error in fetchWeeklySummary:', error);
                setRawWeeklyData([]);
            }
        };
        fetchWeeklySummary();
    }, [currentDate]);

    // This effect augments weekly data with P&L calculated from daily data (now includes options)
    useEffect(() => {
        if (rawWeeklyData.length > 0 && Object.keys(tradingData).length > 0) {
            
            // Helper to get the week number of a date (Sunday as the first day of the week)
            const getWeekOfYear = (date: Date) => {
                const target = new Date(date.valueOf());
                const dayNr = (date.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                const firstThursday = target.valueOf();
                target.setMonth(0, 1);
                if (target.getDay() !== 4) {
                    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
                }
                return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
            };
            
            const weeklyPnlMap = new Map<number, number>();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            for (const dayOfMonth in tradingData) {
                const dayData = tradingData[dayOfMonth];
                if (dayData && typeof dayData.pnl === 'number') {
                    const date = new Date(year, month, parseInt(dayOfMonth, 10));
                    const weekNo = getWeekOfYear(date);
                    
                    const currentPnl = weeklyPnlMap.get(weekNo) || 0;
                    weeklyPnlMap.set(weekNo, currentPnl + dayData.pnl);
                }
            }
            
            const augmentedData = rawWeeklyData.map(week => ({
                ...week,
                total_pnl: weeklyPnlMap.get(week.week_number) || week.weekly_pnl || 0,
            }));
            
            setWeeklyData(augmentedData);
        } else {
             // If there's no trading data, still pass the raw weekly data (with PnL as 0)
            setWeeklyData(rawWeeklyData.map(week => ({...week, total_pnl: week.weekly_pnl || 0})));
        }
    }, [tradingData, rawWeeklyData, currentDate]);

    useEffect(() => {
        console.log('Combined Stats (entries + options):', stats);
        console.log('Combined TradingData (entries + options):', tradingData);
        console.log('Combined WeeklyData (entries + options):', weeklyData);
    }, [stats, tradingData, weeklyData]);

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