-- Delete a specific entry from the table
CREATE OR REPLACE FUNCTION delete_entry(
    p_entry_id INTEGER,
    p_column_name TEXT DEFAULT NULL 
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public    
AS $$
DECLARE
    rows_affected INTEGER;
    sql_query TEXT;
BEGIN
    -- Validate that the entry exists and belongs to the current user FIRST
    IF NOT EXISTS (
        SELECT 1 FROM entry_table 
        WHERE id = p_entry_id 
        AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No journal entry found with id % for the authenticated user', p_entry_id;
    END IF;

    -- If no column name is provided, delete the entire row (new code)
    IF p_column_name IS NULL THEN
        DELETE FROM entry_table WHERE id = p_entry_id AND user_id = auth.uid();
        RETURN TRUE;
        END IF;

    -- Validate column name to prevent SQL injection
    IF p_column_name NOT IN (
        'symbol', 'trade_type', 'order_type', 'entry_price',
        'exit_price', 'stop_loss', 'commissions', 'number_shares',
        'take_profit', 'entry_date', 'exit_date', 'market_conditions',
        'entry_tactics', 'edges'
    ) THEN 
        RAISE EXCEPTION 'Invalid column name: %', p_column_name;
    END IF;

    -- Build a dynamic SQL query to clear the specified column
    sql_query := FORMAT('UPDATE entry_table SET %I = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = auth.uid()', p_column_name);

    -- Execute the dynamic SQL query
    EXECUTE sql_query USING p_entry_id;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    -- This should always be 1 since we validated existence above
    IF rows_affected = 0 THEN
        RAISE EXCEPTION 'Unexpected error: No rows were updated';
    END IF;

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error clearing column data: %', SQLERRM;
        RETURN FALSE;        
END;
$$;