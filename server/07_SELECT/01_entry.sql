-- Function to get a specific entry by ID
CREATE OR REPLACE FUNCTION select_entry()
RETURNS TABLE (
    id INTEGER,
    created_at TIMESTAMP,
    user_id UUID,
    symbol VARCHAR(18),
    trade_type VARCHAR(5),
    order_type VARCHAR(7),
    entry_price NUMERIC,
    exit_price NUMERIC,
    stop_loss NUMERIC,
    commissions NUMERIC,
    number_shares NUMERIC,
    take_profit NUMERIC,
    market_conditions TEXT,
    entry_tactics TEXT,
    edges TEXT,
    entry_date TIMESTAMP,
    exit_date TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        entry_table.id,
        entry_table.created_at,
        entry_table.user_id,
        entry_table.symbol,
        entry_table.trade_type,
        entry_table.order_type,
        entry_table.entry_price,
        entry_table.exit_price,
        entry_table.stop_loss,
        entry_table.commissions,
        entry_table.number_shares,
        entry_table.take_profit,
        entry_table.market_conditions,
        entry_table.entry_tactics,
        entry_table.edges,
        entry_table.entry_date,
        entry_table.exit_date,
        entry_table.updated_at
    FROM entry_table
    WHERE entry_table.user_id = auth.uid();
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error retrieving entry: %', SQLERRM;
        RAISE;
END;
$$;