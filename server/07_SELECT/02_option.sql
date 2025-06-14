-- Function to get a specific entry by ID
CREATE OR REPLACE FUNCTION select_option()
RETURNS TABLE (
    id INTEGER,
    created_at TIMESTAMP,
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
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
     RETURN QUERY
     SELECT
         option_table.id,
         option_table.created_at,
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
         option_table.updated_at
     FROM option_table
     WHERE option_table.user_id = auth.uid();

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error retrieving entry: %', SQLERRM;
        RAISE;
END;
$$;
