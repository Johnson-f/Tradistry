-- Update function to update the option_table
CREATE OR REPLACE FUNCTION update_option(p_entry_id INTEGER, p_payload JSONB)
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
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
     --Validate the entry exists and belongs to the current user
     IF NOT EXISTS (
            SELECT 1 FROM option_table
            WHERE option_table.id = p_entry_id
            AND option_table.user_id = auth.uid()
     ) THEN
         RAISE EXCEPTION 'Entry not found or access denined';
         END IF;

     RETURN QUERY
     UPDATE option_table
     SET
         symbol = COALESCE(p_payload->>'symbol', option_table.symbol),
         strategy = COALESCE(p_payload->>'strategy', option_table.strategy),
         option_type = COALESCE(p_payload->>'option_type', option_table.option_type),
         strike_price = COALESCE((p_payload->>'strike_price')::NUMERIC, option_table.strike_price),
         expiration_date = COALESCE((NULLIF(p_payload->>'expiration_date', ''))::TIMESTAMP, option_table.expiration_date),
         entry_price = COALESCE((p_payload->>'entry_price')::NUMERIC, option_table.entry_price),
         number_contracts = COALESCE((p_payload->>'number_contracts')::NUMERIC, option_table.number_contracts),
         exit_price = COALESCE((p_payload->>'exit_price')::NUMERIC, option_table.exit_price),
         commissions = COALESCE((p_payload->>'commissions')::NUMERIC, option_table.commissions),
         order_type = COALESCE(p_payload->>'order_type', option_table.order_type),
         implied_volatility = COALESCE((p_payload->>'implied_volatility')::NUMERIC, option_table.implied_volatility),
         entry_date = COALESCE((NULLIF(p_payload->>'entry_date', ''))::TIMESTAMP, option_table.entry_date),
         exit_date = COALESCE((NULLIF(p_payload->>'exit_date', ''))::TIMESTAMP, option_table.exit_date),
         updated_at = CURRENT_TIMESTAMP -- Always update this field
         WHERE option_table.id = p_entry_id
           AND option_table.user_id = auth.uid() --Security: only update own entries
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
             option_table.updated_at;

             EXCEPTION
                 WHEN OTHERS THEN
                     RAISE EXCEPTION 'Error updating entry: %', SQLERRM;


END;
$$;
