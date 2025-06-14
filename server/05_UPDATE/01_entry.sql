-- Update function to update the entry_table
CREATE OR REPLACE FUNCTION update_entry(p_entry_id INTEGER, p_payload JSONB)
RETURNS TABLE (
    id INTEGER,
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
      --Validate the entry exists and belongs to the current user
      IF NOT EXISTS (
            SELECT 1 FROM entry_table
            WHERE entry_table.id = p_entry_id
            AND entry_table.user_id = auth.uid()
      ) THEN
            RAISE EXCEPTION 'Entry not found or access denied';
        END IF;
           
    RETURN QUERY     
    UPDATE entry_table
    SET 
        symbol = COALESCE(p_payload->>'symbol', entry_table.symbol),
        trade_type = COALESCE(p_payload->>'trade_type', entry_table.trade_type),
        order_type = COALESCE(p_payload->>'order_type', entry_table.order_type),
        entry_price = COALESCE((p_payload->>'entry_price')::NUMERIC, entry_table.entry_price),
        exit_price = COALESCE((p_payload->>'exit_price')::NUMERIC, entry_table.exit_price),
        stop_loss = COALESCE((p_payload->>'stop_loss')::NUMERIC, entry_table.stop_loss),
        commissions = COALESCE((p_payload->>'commissions')::NUMERIC, entry_table.commissions),
        number_shares = COALESCE((p_payload->>'number_shares')::NUMERIC, entry_table.number_shares),
        take_profit = COALESCE((p_payload->>'take_profit')::NUMERIC, entry_table.take_profit),
        market_conditions = COALESCE((p_payload->>'market_conditions'), entry_table.market_conditions),
        entry_tactics = COALESCE((p_payload->>'entry_tactics'), entry_table.entry_tactics),
        edges = COALESCE((p_payload->>'edges'), entry_table.edges),
        entry_date = COALESCE((NULLIF(p_payload->>'entry_date', ''))::TIMESTAMP, entry_table.entry_date),
        exit_date = COALESCE((NULLIF(p_payload->>'exit_date', ''))::TIMESTAMP, entry_table.exit_date),
        updated_at = CURRENT_TIMESTAMP -- Always update this field
     WHERE entry_table.id = p_entry_id    
      AND entry_table.user_id = auth.uid() -- Security: only update own entries  
      RETURNING 
        entry_table.id,
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
         RAISE EXCEPTION 'Error updating entry: %', SQLERRM;
            RAISE;
    END;
    $$;            