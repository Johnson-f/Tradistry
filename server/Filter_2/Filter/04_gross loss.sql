-- Returns total loss from losing trades for the current user
CREATE OR REPLACE FUNCTION gross_loss(
    user_uuid UUID DEFAULT auth.uid()
) 
RETURNS NUMERIC
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    result NUMERIC;
BEGIN
    SELECT COALESCE(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL;
    
    RETURN result;
END;
$$;