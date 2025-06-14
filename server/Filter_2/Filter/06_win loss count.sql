-- Returns both wins and losses count for the current user 
CREATE OR REPLACE FUNCTION win_loss_counts(
    user_uuid UUID DEFAULT auth.uid()
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
        AND j.net_profit_dollars IS NOT NULL;
END;
$$;