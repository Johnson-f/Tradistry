-- Returns win rate within a specified date range and win rate of a symbol for the current user 
CREATE OR REPLACE FUNCTION filter_win_rate(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    symbol TEXT DEFAULT NULL
) 
RETURNS NUMERIC
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    total_trades BIGINT;
    winning_trades BIGINT;
    result NUMERIC;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE j.is_win = true)
    INTO total_trades, winning_trades
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date)
        AND (symbol IS NULL OR j.symbol = symbol);
    
    IF total_trades > 0 THEN
        result := ROUND(100.0 * winning_trades / total_trades, 2);
    ELSE
        result := 0;
    END IF;
    
    RETURN result;
END;
$$;