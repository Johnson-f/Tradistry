-- Aggregate function that uses individual function
-- Updated aggregate function that uses individual functions
CREATE OR REPLACE FUNCTION aggregate_function_modular(
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
DECLARE
    win_loss_data RECORD;
    avg_win_loss_data RECORD;
BEGIN
    -- Get win/loss counts
    SELECT * INTO win_loss_data FROM get_win_loss_counts(user_uuid);
    
    -- Get average win/loss amounts
    SELECT * INTO avg_win_loss_data FROM get_average_win_loss(user_uuid);
    
    RETURN QUERY
    SELECT 
        get_total_net_profit(user_uuid),
        get_average_profit_per_trade(user_uuid),
        get_gross_profit(user_uuid),
        get_gross_loss(user_uuid),
        get_win_rate(user_uuid),
        win_loss_data.total_wins,
        win_loss_data.total_losses,
        avg_win_loss_data.avg_win,
        avg_win_loss_data.avg_loss,
        get_profit_factor(user_uuid),
        get_expectancy(user_uuid),
        get_average_holding_period(user_uuid),
        get_average_risk_per_trade(user_uuid),
        get_average_risk_reward(user_uuid),
        get_average_position_size(user_uuid),
        get_average_trade_value(user_uuid),
        get_total_capital_deployed(user_uuid),
        get_total_trades(user_uuid),
        get_total_commissions(user_uuid);
END;
$$;