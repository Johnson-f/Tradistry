-- Returns average position sizing for the current user
CREATE OR REPLACE FUNCTION average_position_size(
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
    SELECT ROUND(AVG(j.number_shares), 2)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.number_shares IS NOT NULL;
    
    RETURN COALESCE(result, 0);
END;
$$;