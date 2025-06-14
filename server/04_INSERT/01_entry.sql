-- Insert function to add to the table
CREATE OR REPLACE FUNCTION insert_entry(p_payload JSONB)
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
    INSERT INTO entry_table (
        user_id,
        symbol,
        trade_type,
        order_type,
        entry_price,
        exit_price,
        stop_loss,
        commissions,
        number_shares,
        take_profit,
        market_conditions,
        entry_tactics,
        edges,
        entry_date,
        exit_date,
        created_at,
        updated_at
    ) VALUES (
         COALESCE((p_payload->>'p_user_id')::UUID, auth.uid()), -- Ensure user_id is valid
        NULLIF(p_payload->>'p_symbol', ''), -- Handle empty strings
        NULLIF(p_payload->>'p_trade_type', ''),
        NULLIF(p_payload->>'p_order_type', ''),
        (p_payload->>'p_entry_price')::NUMERIC, -- Cast to NUMERIC
        (p_payload->>'p_exit_price')::NUMERIC,
        (p_payload->>'p_stop_loss')::NUMERIC,
        COALESCE((p_payload->>'p_commissions')::NUMERIC, 0), -- Default to 0 if NULL
        (p_payload->>'p_number_shares')::NUMERIC,
        (p_payload->>'p_take_profit')::NUMERIC,
        NULLIF(p_payload->>'p_market_conditions', ''),
        NULLIF(p_payload->>'p_entry_tactics', ''),
        NULLIF(p_payload->>'p_edges', ''),
        (NULLIF(p_payload->>'p_entry_date', ''))::TIMESTAMP,
        (NULLIF(p_payload->>'p_exit_date', ''))::TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING 
        entry_table.id, -- Explicitly qualify the id column
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
        entry_table.updated_at;
    
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting entry_table: %', SQLERRM;
        RAISE;
END;
$$;
