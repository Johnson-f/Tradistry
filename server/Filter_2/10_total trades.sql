-- Returns total number of trades for the current user 
CREATE OR REPLACE FUNCTION total_trades(
    user_uuid UUID DEFAULT auth.uid()
) 
RETURNS BIGINT
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    result BIGINT;
BEGIN
    SELECT COUNT(*)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL;
    
    RETURN result;
END;
$$;