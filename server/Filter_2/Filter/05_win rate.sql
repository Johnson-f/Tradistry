-- Returns win rate of the current user as a percentage 
CREATE OR REPLACE FUNCTION win_rate(
    user_uuid UUID DEFAULT auth.uid()
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
        AND j.net_profit_dollars IS NOT NULL;
    
    IF total_trades > 0 THEN
        result := ROUND(100.0 * winning_trades / total_trades, 2);
    ELSE
        result := 0;
    END IF;
    
    RETURN result;
END;
$$;