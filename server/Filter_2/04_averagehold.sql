-- Returns average holding period in days for the current user 
CREATE OR REPLACE FUNCTION average_holding_period(
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
    SELECT ROUND(AVG(j.holding_period), 2)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.holding_period IS NOT NULL;
    
    RETURN COALESCE(result, 0);
END;
$$;