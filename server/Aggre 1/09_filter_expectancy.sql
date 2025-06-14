-- Returns mathematical expectancy within a specified date range for the current user
CREATE OR REPLACE FUNCTION filter_expectancy(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) 
RETURNS NUMERIC
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    total_trades BIGINT;
    winning_trades BIGINT;
    losing_trades BIGINT;
    avg_win_val NUMERIC;
    avg_loss_val NUMERIC;
    win_probability NUMERIC;
    loss_probability NUMERIC;
    result NUMERIC;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE j.is_win = true),
        COUNT(*) FILTER (WHERE j.is_win = false),
        AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true),
        AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false)
    INTO total_trades, winning_trades, losing_trades, avg_win_val, avg_loss_val
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
    
    IF total_trades > 0 THEN
        win_probability := winning_trades::NUMERIC / total_trades;
        loss_probability := losing_trades::NUMERIC / total_trades;
        
        result := ROUND(
            (win_probability * COALESCE(avg_win_val, 0)) + 
            (loss_probability * COALESCE(avg_loss_val, 0)), 
            2
        );
    ELSE
        result := 0;
    END IF;
    
    RETURN result;
END;
$$;