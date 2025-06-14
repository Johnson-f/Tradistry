-- File for filtering journal entries 
-- This file is working with Aggregate Function

CREATE OR REPLACE FUNCTION aggregate_function_filter(
    user_uuid UUID DEFAULT auth.uid(),
    filter_range TEXT DEFAULT 'all', -- daily, weekly, monthly, yearly, custom, all
    custom_start_date DATE DEFAULT NULL,
    custom_end_date DATE DEFAULT NULL
    )
RETURNS TABLE (
    total_net_profit_dollars NUMERIC,
    average_profit_per_trade NUMERIC,
    gross_profit NUMERIC,
    gross_loss NUMERIC,
    total_wins INTEGER,
    total_losses INTEGER,
    avg_win NUMERIC,
    avg_loss NUMERIC,
    profit_factor NUMERIC,
    expectancy NUMERIC,
    avg_holding_period NUMERIC,
    avg_risk_per_trade NUMERIC,
    avg_risk_reward NUMERIC,
    avg_position_size NUMERIC,
    avg_trade_value NUMERIC,
    total_capital_deployed NUMERIC,
    total_trades BIGINT,
    total_commissions NUMERIC,
    filter_period_start DATE,
    filter_period_end DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public    
AS $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
     -- Determining the date range based on the filter range 
     CASE filter_range
        WHEN 'daily' THEN
            start_date := CURRENT_DATE;
            end_date := CURRENT_DATE;

     WHEN 'weekly' THEN
         start_date := CURRENT_DATE - INTERVAL '7 days';
         end_date := CURRENT_DATE;

    WHEN 'monthly' THEN
         start_date := DATE_TRUNC('month', CURRENT_DATE);
         end_date := CURRENT_DATE;

     WHEN 'yearly' THEN
         start_date := DATE_TRUNC('year', CURRENT_DATE);
         end_date := CURRENT_DATE;
     
     WHEN 'custom' THEN
     -- Use provided custom dates with validation
     IF custom_start_date IS NULL OR custom_end_date IS NULL THEN
        RAISE EXCEPTION 'Custom date range requires both start and end dates';
        END IF;

     IF custom_start_date > custom_end_date THEN
         RAISE EXCEPTION 'Start date can not be after end date';
         END IF;

         start_date := custom_start_date;
         end_date := custom_end_date;

         ELSE
         -- 'all' or any other value - no date filtering
         start_date := NULL;
         end_date := NULL;
         END CASE;     

RETURN QUERY
SELECT
 -- Total net profit in dollars
        COALESCE(SUM(j.net_profit_dollars), 0) AS total_net_profit_dollars,
        
        -- Average profit per trade
        COALESCE(AVG(j.net_profit_dollars), 0) AS average_profit_per_trade,
        
        -- Gross profit (winning trades only)
        COALESCE(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 0) AS gross_profit,
        
        -- Gross loss (losing trades only)
        COALESCE(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0) AS gross_loss,
        
        -- Win rate percentage
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND(100.0 * COUNT(*) FILTER (WHERE j.is_win = true) / COUNT(*), 2)
            ELSE 0
        END AS win_rate,
        
        -- Win/Loss counts
        COUNT(*) FILTER (WHERE j.is_win = true) AS total_wins,
        COUNT(*) FILTER (WHERE j.is_win = false) AS total_losses,
        
        -- Average win/loss amounts
        COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 0) AS avg_win,
        COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0) AS avg_loss,
        
        -- Profit Factor (Gross Profit / Absolute Gross Loss)
        CASE 
            WHEN SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false) < 0 THEN
                COALESCE(
                    SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = true) / 
                    ABS(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false)), 
                    0
                )
            ELSE NULL
        END AS profit_factor,
        
        -- Expectancy (Expected value per trade)
        CASE 
            WHEN COUNT(*) > 0 THEN
                COALESCE(
                    (COUNT(*) FILTER (WHERE j.is_win = true) * 1.0 / COUNT(*)) *
                    COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 0) +
                    (COUNT(*) FILTER (WHERE j.is_win = false) * 1.0 / COUNT(*)) *
                    COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0),
                    0
                )
            ELSE 0
        END AS expectancy,
        
        -- Average holding period
        COALESCE(ROUND(AVG(j.holding_period), 2), 0) AS avg_holding_period,
        
        -- Average risk per trade
        COALESCE(AVG(j.risk_per_trade), 0) AS avg_risk_per_trade,
        
        -- Average risk/reward ratio
        COALESCE(AVG(j.risk_reward), 0) AS avg_risk_reward,
        
        -- Average position size
        COALESCE(AVG(j.number_shares), 0) AS avg_position_size,
        
        -- Average trade value
        COALESCE(AVG(j.trade_value), 0) AS avg_trade_value,
        
        -- Total capital deployed
        COALESCE(SUM(j.entry_price * j.number_shares), 0) AS total_capital_deployed,
        
        -- Total number of trades
        COUNT(*) AS total_trades,
        
        -- Total commissions paid
        COALESCE(SUM(j.commissions), 0) AS total_commissions,
        
        -- Return the actual filter period used
        start_date AS filter_period_start,
        end_date AS filter_period_end
        
    FROM journal_entries j
    WHERE j.user_id = user_uuid
        AND (
            -- Apply date filtering only if dates are specified
            start_date IS NULL 
            OR (
                j.trade_date >= start_date 
                AND j.trade_date <= end_date
            )
        );    
END;
$$;

