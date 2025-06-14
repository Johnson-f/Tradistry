-- Returns average win/loss amounts within a specified date range for the current user
CREATE OR REPLACE FUNCTION filter_average_win_loss(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
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
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
END;
$$;