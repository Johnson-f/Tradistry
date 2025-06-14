-- First, drop existing generated columns if they exist
ALTER TABLE entry_table
DROP COLUMN IF EXISTS gross_profit,
DROP COLUMN IF EXISTS gross_profit_dollars,
DROP COLUMN IF EXISTS net_profit_dollars,
DROP COLUMN IF EXISTS net_profit_percentage,
DROP COLUMN IF EXISTS stop_loss_percentage,
DROP COLUMN IF EXISTS trade_value,
DROP COLUMN IF EXISTS holding_period,
DROP COLUMN IF EXISTS risk_reward,
DROP COLUMN IF EXISTS risk_per_trade,
DROP COLUMN IF EXISTS is_win,
DROP COLUMN IF EXISTS risk_to_reward;

-- Now add them as regular columns (not generated)
ALTER TABLE entry_table
ADD COLUMN gross_profit DECIMAL(5, 2),
ADD COLUMN gross_profit_dollars DECIMAL(12, 2),
ADD COLUMN net_profit_dollars DECIMAL(12, 3),
ADD COLUMN net_profit_percentage DECIMAL(6, 2),
ADD COLUMN stop_loss_percentage DECIMAL(5, 2),
ADD COLUMN trade_value DECIMAL(11, 3),
ADD COLUMN holding_period INTEGER,
ADD COLUMN risk_reward NUMERIC,
ADD COLUMN risk_per_trade DECIMAL(12, 2),
ADD COLUMN is_win BOOLEAN,
ADD COLUMN risk_to_reward NUMERIC;

-- Create the trigger function that calculates all values
CREATE OR REPLACE FUNCTION calculate_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Gross profit percentage
    NEW.gross_profit := CASE 
        WHEN NEW.exit_price IS NOT NULL AND NEW.entry_price > 0 THEN 
            (NEW.exit_price - NEW.entry_price) / NEW.entry_price * 100 
        ELSE NULL 
    END;

    -- Gross profit in dollars
    NEW.gross_profit_dollars := CASE 
        WHEN NEW.exit_price IS NOT NULL THEN 
            (NEW.exit_price - NEW.entry_price) * NEW.number_shares 
        ELSE NULL 
    END;

    -- Net profit in dollars (accounting for commissions and trade type)
    NEW.net_profit_dollars := CASE 
        WHEN NEW.exit_price IS NOT NULL AND NEW.trade_type = 'BUY' THEN 
            (NEW.exit_price - NEW.entry_price) * NEW.number_shares - COALESCE(NEW.commissions, 0)
        WHEN NEW.exit_price IS NOT NULL AND NEW.trade_type = 'SELL' THEN 
            (NEW.entry_price - NEW.exit_price) * NEW.number_shares - COALESCE(NEW.commissions, 0)
        ELSE NULL
    END;

    -- Net profit percentage
    NEW.net_profit_percentage := CASE 
        WHEN NEW.net_profit_dollars IS NOT NULL AND NEW.entry_price > 0 AND NEW.number_shares > 0 THEN 
            (NEW.net_profit_dollars / (NEW.entry_price * NEW.number_shares)) * 100
        ELSE NULL
    END;

    -- Stop loss percentage
    NEW.stop_loss_percentage := CASE 
        WHEN NEW.stop_loss IS NOT NULL AND NEW.entry_price > 0 THEN 
            (NEW.stop_loss - NEW.entry_price) / NEW.entry_price * 100 
        ELSE NULL 
    END;

    -- Trade value
    NEW.trade_value := CASE 
        WHEN NEW.entry_price > 0 AND NEW.number_shares > 0 THEN 
            NEW.number_shares * NEW.entry_price
        ELSE NULL
    END;

    -- Holding period in days
    NEW.holding_period := CASE 
        WHEN NEW.exit_date IS NOT NULL AND NEW.entry_date IS NOT NULL THEN 
            EXTRACT(EPOCH FROM NEW.exit_date - NEW.entry_date) / 86400 
        ELSE NULL 
    END;

    -- Risk per trade (potential loss based on stop loss)
    NEW.risk_per_trade := CASE
        WHEN NEW.stop_loss IS NOT NULL AND NEW.trade_type = 'BUY' AND NEW.entry_price > NEW.stop_loss THEN 
            (NEW.entry_price - NEW.stop_loss) * NEW.number_shares
        WHEN NEW.stop_loss IS NOT NULL AND NEW.trade_type = 'SELL' AND NEW.stop_loss > NEW.entry_price THEN 
            (NEW.stop_loss - NEW.entry_price) * NEW.number_shares
        ELSE NULL
    END;

    -- Risk reward ratio (potential profit vs potential loss)
    NEW.risk_reward := CASE 
        WHEN NEW.take_profit IS NOT NULL AND NEW.stop_loss IS NOT NULL AND NEW.trade_type = 'BUY' THEN 
            CASE 
                WHEN (NEW.entry_price - NEW.stop_loss) > 0 THEN
                    (NEW.take_profit - NEW.entry_price) / (NEW.entry_price - NEW.stop_loss)
                ELSE NULL
            END
        WHEN NEW.take_profit IS NOT NULL AND NEW.stop_loss IS NOT NULL AND NEW.trade_type = 'SELL' THEN
            CASE 
                WHEN (NEW.stop_loss - NEW.entry_price) > 0 THEN
                    (NEW.entry_price - NEW.take_profit) / (NEW.stop_loss - NEW.entry_price)
                ELSE NULL
            END
        ELSE NULL
    END;

    -- Is this trade a winner? (depends on net_profit_dollars)
    NEW.is_win := CASE 
        WHEN NEW.net_profit_dollars IS NOT NULL THEN NEW.net_profit_dollars > 0
        ELSE NULL
    END;

    -- Risk to reward on actual profit (actual profit vs potential loss)
    NEW.risk_to_reward := CASE
        WHEN NEW.risk_per_trade IS NOT NULL AND NEW.risk_per_trade > 0 AND NEW.net_profit_dollars IS NOT NULL THEN 
            NEW.net_profit_dollars / NEW.risk_per_trade 
        ELSE NULL
    END;

    -- Update the updated_at timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_calculate_entry_insert ON entry_table;
DROP TRIGGER IF EXISTS trigger_calculate_entry_update ON entry_table;

-- Create triggers for INSERT and UPDATE
CREATE TRIGGER trigger_calculate_entry_insert
    BEFORE INSERT ON entry_table
    FOR EACH ROW
    EXECUTE FUNCTION calculate_entry();

CREATE TRIGGER trigger_calculate_entry_update
    BEFORE UPDATE ON entry_table
    FOR EACH ROW
    EXECUTE FUNCTION calculate_entry();

-- Update existing records to recalculate metrics (if any)
UPDATE entry_table SET updated_at = updated_at WHERE id IS NOT NULL;