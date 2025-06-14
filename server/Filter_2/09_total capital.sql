-- Returns total capital deployed by the current user
CREATE OR REPLACE FUNCTION total_capital_deployed(
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
    SELECT COALESCE(SUM(j.entry_price * j.number_shares), 0)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.entry_price IS NOT NULL
        AND j.number_shares IS NOT NULL;
    
    RETURN result;
END;
$$;