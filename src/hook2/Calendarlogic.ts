import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useCalendarLogic = (initialDate = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate); // Which month the calendar is currently showing
    const [tradingData, setTradingData] = useState<Record<number, { pnl: number; trades: number }>>({}); // Grouped entries by day
    const [loading, setLoading] = useState(true); // Loading state for the calendar 
    const [stats, setStats] = useState<any>(null); // Summary statistics for the current month
    const [weeklyData, setWeeklyData] = useState<any[]>([]); // Weekly aggregated data 
    const [entries, setEntries] = useState<any[]>([]); 

    // Fetch entries for the current month
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                setLoading(true);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const from = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const toStr = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching data for:', { from, toStr });

                // Fetch aggregated trading data by day using RPC
                const { data: aggData, error: aggError } = await supabase
                    .rpc('aggregate_tradesby_day', {
                        p_start_date: from,
                        p_end_date: toStr
                    });
                
                console.log('RPC Response:', { aggData, aggError });

                if (aggError) {
                    console.error('Error fetching aggregated data:', aggError);
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
                    console.log('Grouped data:', grouped);
                    setTradingData(grouped);
                } else {
                    console.log('No data returned from RPC');
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

    // Summary statistics for the current month using RPC
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const p_start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const p_end_date = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching stats for:', { p_start_date, p_end_date });

                const { data, error } = await supabase  
                    .rpc('monthly_trading_summary', {
                        p_end_date,
                        p_start_date
                    });

                console.log('Stats RPC Response:', { data, error });

                if (error) {
                    console.error('Error fetching stats:', error);
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

    // Group trades by week (replace this with rpc)
    useEffect(() => {
        const fetchWeeklySummary = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const p_start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
                const to = new Date(year, month, 0);
                const p_end_date = `${year}-${month.toString().padStart(2, '0')}-${to.getDate().toString().padStart(2, '0')}`;

                console.log('Fetching weekly summary for:', { p_start_date, p_end_date });

                const { data, error } = await supabase
                    .rpc('weekly_summary', {
                        p_end_date,
                        p_start_date
                    });

                console.log('Weekly RPC Response:', { data, error });

                if (error) {
                    console.error('Error fetching weekly summary:', error);
                    setWeeklyData([]);
                } else {
                    setWeeklyData(data || []);
                }
            } catch (error) {
                console.error('Error in fetchWeeklySummary:', error);
                setWeeklyData([]);
            }
        };
        fetchWeeklySummary();
    }, [currentDate]);

    useEffect(() => {
        console.log('Stats:', stats);
        console.log('TradingData:', tradingData);
        console.log('WeeklyData:', weeklyData);
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