// This hook is used to fetch economic events and earnings data for the selected date in the calendar 
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useCalendarData = (selectedDate: Date | null) => {
  const [economicEvents, setEconomicEvents] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setEconomicEvents([]);
      setEarningsData([]);
      return;
    }

    const fetchCalendarData = async () => {
      setLoading(true);
      const dateStr = selectedDate.toISOString().slice(0, 10);

      console.log('Fetching calendar data for date:', dateStr);

      try {
        // Fetch economic events for the selected date
        const { data: economicData, error: economicError } = await supabase
          .from('economic_events')
          .select('*')
          .eq('event_date', dateStr)
          .order('event_time', { ascending: true });

        console.log('Economic events query result:', { economicData, economicError });

        if (economicError) {
          console.error('Error fetching economic events:', economicError);
        } else {
          setEconomicEvents(economicData || []);
        }

        // Fetch earnings data for the selected date - only the fields you specified
        const { data: earningsData, error: earningsError } = await supabase
          .from('company_earnings')
          .select('symbol, earnings_date, fiscal_year, fiscal_quarter, eps_estimate, revenue_estimate')
          .eq('earnings_date', dateStr)
          .order('earnings_date', { ascending: true });

        console.log('Earnings data query result:', { earningsData, earningsError });

        if (earningsError) {
          console.error('Error fetching earnings data:', earningsError);
        } else {
          setEarningsData(earningsData || []);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedDate]);

  return {
    economicEvents,
    earningsData,
    loading
  };
}; 