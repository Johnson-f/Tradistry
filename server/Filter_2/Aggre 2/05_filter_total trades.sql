-- Returns total number of trades within a specified date range for the current user 
CREATE OR REPLACE FUNCTION filter_total_trades(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
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
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
    
    RETURN result;
END;
$$;