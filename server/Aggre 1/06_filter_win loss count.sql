-- Returns win/loss count within a specified date range for the current user
CREATE OR REPLACE FUNCTION filter_win_loss_counts(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) 
RETURNS TABLE (
    total_wins BIGINT,
    total_losses BIGINT
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE j.is_win = true) AS total_wins,
        COUNT(*) FILTER (WHERE j.is_win = false) AS total_losses
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
END;
$$;