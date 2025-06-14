-- Returns total commissions paid by the current user
CREATE OR REPLACE FUNCTION total_commissions(
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
    SELECT COALESCE(SUM(j.commissions), 0)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.commissions IS NOT NULL;
    
    RETURN result;
END;
$$;