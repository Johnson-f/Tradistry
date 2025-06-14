-- New version
-- For inserting data into the database
CREATE OR REPLACE FUNCTION insert_option (p_payload JSONB)
RETURNS TABLE (
    id INTEGER,
    user_id UUID,
    symbol VARCHAR(18),
    strategy TEXT,
    option_type VARCHAR(4),
    strike_price NUMERIC,
    expiration_date TIMESTAMP,
    entry_price NUMERIC,
    number_contracts NUMERIC,
    exit_price NUMERIC,
    commissions NUMERIC,
    order_type VARCHAR(7),
    implied_volatility NUMERIC,
    entry_date TIMESTAMP,
    exit_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO option_table (
        user_id,
        symbol,
        strategy,
        option_type,
        strike_price,
        expiration_date,
        entry_price,
        number_contracts,
        exit_price,
        commissions,
        order_type,
        implied_volatility,
        entry_date,
        exit_date,
        created_at,
        updated_at
    ) VALUES (
        COALESCE((p_payload->>'user_id')::UUID, auth.uid()),
        NULLIF(p_payload->>'symbol', ''),
        NULLIF(p_payload->>'strategy', ''),
        NULLIF(p_payload->>'option_type', ''),
        COALESCE((NULLIF(p_payload->>'strike_price', ''))::NUMERIC, 0),
        COALESCE((NULLIF(p_payload->>'expiration_date', ''))::TIMESTAMP, NULL),
        COALESCE((NULLIF(p_payload->>'entry_price', ''))::NUMERIC, 0),
        COALESCE((NULLIF(p_payload->>'number_contracts', ''))::NUMERIC, 0),
        CASE
            WHEN p_payload->>'exit_price' IS NULL OR p_payload->>'exit_price' = '' THEN NULL
            ELSE (p_payload->>'exit_price')::NUMERIC
        END,
        COALESCE((NULLIF(p_payload->>'commissions', ''))::NUMERIC, 0),
        COALESCE(NULLIF(p_payload->>'order_type', ''), 'Limit'),
        COALESCE((NULLIF(p_payload->>'implied_volatility', ''))::NUMERIC, 0),
        CASE
            WHEN p_payload->>'entry_date' IS NULL OR p_payload->>'entry_date' = '' THEN NULL
            ELSE (p_payload->>'entry_date')::TIMESTAMP
        END,
        CASE
            WHEN p_payload->>'exit_date' IS NULL OR p_payload->>'exit_date' = '' THEN NULL
            ELSE (p_payload->>'exit_date')::TIMESTAMP
        END,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING
        option_table.id,
        option_table.user_id,
        option_table.symbol,
        option_table.strategy,
        option_table.option_type,
        option_table.strike_price,
        option_table.expiration_date,
        option_table.entry_price,
        option_table.number_contracts,
        option_table.exit_price,
        option_table.commissions,
        option_table.order_type,
        option_table.implied_volatility,
        option_table.entry_date,
        option_table.exit_date,
        option_table.created_at,
        option_table.updated_at;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting option_table: %', SQLERRM;
    RAISE;
END;
$$;
