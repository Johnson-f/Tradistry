-- Returns average risk-reward ratio for the current user 
CREATE OR REPLACE FUNCTION average_risk_reward(
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
    SELECT ROUND(AVG(j.risk_reward), 2)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.risk_reward IS NOT NULL;
    
    RETURN COALESCE(result, 0);
END;
$$;