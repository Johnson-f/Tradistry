-- Returns profit factor within a specified date range for the current user
CREATE OR REPLACE FUNCTION filter_profit_factor(
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
    gross_profit_val NUMERIC;
    gross_loss_val NUMERIC;
    result NUMERIC;
BEGIN
    SELECT 
        COALESCE(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = true), 0),
        COALESCE(SUM(j.net_profit_dollars) FILTER (WHERE j.is_win = false), 0)
    INTO gross_profit_val, gross_loss_val
    FROM entry_table j
    WHERE j.user_id = user_uuid
        AND j.net_profit_dollars IS NOT NULL
        AND (start_date IS NULL OR j.entry_date >= start_date)
        AND (end_date IS NULL OR j.entry_date <= end_date);
    
    IF gross_loss_val < 0 THEN
        result := ROUND(gross_profit_val / ABS(gross_loss_val), 2);
    ELSE
        result := NULL;
    END IF;
    
    RETURN result;
END;
$$;
