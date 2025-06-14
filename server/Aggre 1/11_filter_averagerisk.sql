-- Returns average risk per trade within a specified date range for the current user
CREATE OR REPLACE FUNCTION filter_average_risk_per_trade(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) 
RETURNS NUMERIC
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    result NUMERIC;
BEGIN
    SELECT ROUND(AVG(j.risk_per_trade), 2)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND j.risk_per_trade IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
    
    RETURN COALESCE(result, 0);
END;
$$;