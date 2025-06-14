-- Returns the average win and loss amount for the current user
CREATE OR REPLACE FUNCTION average_win_loss(
    user_uuid UUID DEFAULT auth.uid()
) 
RETURNS TABLE (
    avg_win NUMERIC,
    avg_loss NUMERIC
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 2) AS avg_win,
        ROUND(AVG(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 2) AS avg_loss
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL;
END;
$$;