-- Total net profit within a date range & symbol for the current user 
CREATE OR REPLACE FUNCTION filter_net_profit(
    user_uuid UUID DEFAULT auth.uid(),
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    symbol TEXT DEFAULT NULL
) 
RETURNS NUMERIC
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE
    result NUMERIC;
BEGIN
    SELECT COALESCE(SUM(j.net_profit_dollars), 0)
    INTO result
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
        AND (symbol IS NULL OR j.symbol = symbol);
    
    RETURN result;
END;
$$;