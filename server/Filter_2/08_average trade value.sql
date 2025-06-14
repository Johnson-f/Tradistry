-- Returns average trade value for the current user
CREATE OR REPLACE FUNCTION average_trade_value(
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
    SELECT ROUND(AVG(j.trade_value), 2)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.trade_value IS NOT NULL;
    
    RETURN COALESCE(result, 0);
END;
$$;