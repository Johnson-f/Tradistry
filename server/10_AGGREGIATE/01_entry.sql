-- Aggregate function for calculations as a function
-- I add any calculations i want to have the sum or average 
-- This is directed to the frontend 
-- I add to my pre calculations before i update this, then i go the the filter 

CREATE OR REPLACE FUNCTION aggregate_function(
    user_uuid UUID DEFAULT auth.uid()
    )
RETURNS TABLE (
    total_net_profit_dollars NUMERIC,
    average_profit_per_trade NUMERIC,
    gross_profit NUMERIC,
    gross_loss NUMERIC,
    win_rate NUMERIC,
    total_wins BIGINT,
    total_losses BIGINT,
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
    total_commissions NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
      -- Total net profit in dollars
      SUM(j.net_profit_dollars) AS total_net_profit_dollars,

      -- Average profit per trade
        AVG(j.net_profit_dollars) as average_profit_per_trade,
        
        -- Gross profit (winning trades)
        SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = true) as gross_profit,
        
        -- Gross loss (losing trades)
        SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false) as gross_loss,
        
        -- Win rate percentage
        ROUND(100.0 * COUNT(*) FILTER (WHERE j.is_win = true) / NULLIF(COUNT(*), 0), 2) as win_rate,
        
        -- Win/Loss counts
        COUNT(*) FILTER (WHERE j.is_win = true) as total_wins,
        COUNT(*) FILTER (WHERE j.is_win = false) as total_losses,
        
        -- Average win/loss amounts
        AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true) as avg_win,
        AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false) as avg_loss,
        
        -- Profit Factor
        CASE 
            WHEN SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false) < 0 THEN
                SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = true) /
                ABS(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false))
            ELSE NULL
        END as profit_factor,
        
        -- Expectancy
        CASE 
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE j.is_win = true) * 1.0 / COUNT(*)) *
                COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 0) +
                (COUNT(*) FILTER (WHERE j.is_win = false) * 1.0 / COUNT(*)) *
                COALESCE(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0)
            ELSE NULL
        END as expectancy,
        
        -- Other averages
        AVG(j.risk_per_trade) as avg_risk_per_trade,
        ROUND(AVG(j.holding_period), 2) as avg_holding_period,
        AVG(j.risk_reward) as avg_risk_reward,
        AVG(j.number_shares) as avg_position_size,
        AVG(j.trade_value) as avg_trade_value,
        SUM(j.entry_price * j.number_shares) as total_capital_deployed,
        COUNT(*) as total_trades,
        SUM(j.commissions) as total_commissions 
    FROM journal_entries j
    WHERE j.user_id = user_uuid;
END;
$$;

