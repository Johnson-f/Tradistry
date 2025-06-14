-- Updated version of 01_entry.sql
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
ADD COLUMN gross_profit DECIMAL(8, 4),
ADD COLUMN gross_profit_dollars DECIMAL(15, 2),
ADD COLUMN net_profit_dollars DECIMAL(15, 2),
ADD COLUMN net_profit_percentage DECIMAL(8, 4),
ADD COLUMN stop_loss_percentage DECIMAL(8, 4),
ADD COLUMN trade_value DECIMAL(15, 2),
ADD COLUMN holding_period INTEGER,
ADD COLUMN risk_reward DECIMAL(10, 4),
ADD COLUMN risk_per_trade DECIMAL(15, 2),
ADD COLUMN is_win BOOLEAN,
ADD COLUMN risk_to_reward DECIMAL(10, 4);

-- Create the trigger function that calculates all values
CREATE OR REPLACE FUNCTION calculate_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure we have valid numeric values
    IF NEW.entry_price IS NULL OR NEW.entry_price <= 0 OR NEW.number_shares IS NULL OR NEW.number_shares <= 0 THEN
        -- Set all calculated fields to NULL if basic inputs are invalid
        NEW.gross_profit := NULL;
        NEW.gross_profit_dollars := NULL;
        NEW.net_profit_dollars := NULL;
        NEW.net_profit_percentage := NULL;
        NEW.stop_loss_percentage := NULL;
        NEW.trade_value := NULL;
        NEW.holding_period := NULL;
        NEW.risk_reward := NULL;
        NEW.risk_per_trade := NULL;
        NEW.is_win := NULL;
        NEW.risk_to_reward := NULL;
        NEW.updated_at := CURRENT_TIMESTAMP;
        RETURN NEW;
    END IF;

    -- Trade value (always calculate if we have valid inputs)
    NEW.trade_value := NEW.number_shares * NEW.entry_price;

    -- Only calculate exit-dependent metrics if exit_price exists
    IF NEW.exit_price IS NOT NULL AND NEW.exit_price > 0 THEN
        -- Gross profit percentage
        NEW.gross_profit := ((NEW.exit_price - NEW.entry_price) / NEW.entry_price) * 100;

        -- Gross profit in dollars
        NEW.gross_profit_dollars := (NEW.exit_price - NEW.entry_price) * NEW.number_shares;

        -- Net profit in dollars (accounting for commissions and trade type)
        IF NEW.trade_type = 'BUY' THEN
            NEW.net_profit_dollars := (NEW.exit_price - NEW.entry_price) * NEW.number_shares - COALESCE(NEW.commissions, 0);
        ELSIF NEW.trade_type = 'SELL' THEN
            NEW.net_profit_dollars := (NEW.entry_price - NEW.exit_price) * NEW.number_shares - COALESCE(NEW.commissions, 0);
        ELSE
            NEW.net_profit_dollars := NULL;
        END IF;

        -- Net profit percentage (based on initial investment)
        IF NEW.net_profit_dollars IS NOT NULL AND NEW.trade_value > 0 THEN
            NEW.net_profit_percentage := (NEW.net_profit_dollars / NEW.trade_value) * 100;
        ELSE
            NEW.net_profit_percentage := NULL;
        END IF;

        -- Is this trade a winner?
        NEW.is_win := CASE
            WHEN NEW.net_profit_dollars IS NOT NULL THEN NEW.net_profit_dollars > 0
            ELSE NULL
        END;
    ELSE
        -- No exit price, so set exit-dependent fields to NULL
        NEW.gross_profit := NULL;
        NEW.gross_profit_dollars := NULL;
        NEW.net_profit_dollars := NULL;
        NEW.net_profit_percentage := NULL;
        NEW.is_win := NULL;
    END IF;

    -- Stop loss percentage
    IF NEW.stop_loss IS NOT NULL THEN
        NEW.stop_loss_percentage := ((NEW.stop_loss - NEW.entry_price) / NEW.entry_price) * 100;
    ELSE
        NEW.stop_loss_percentage := NULL;
    END IF;

    -- Holding period in days
    IF NEW.exit_date IS NOT NULL AND NEW.entry_date IS NOT NULL THEN
        NEW.holding_period := EXTRACT(EPOCH FROM NEW.exit_date - NEW.entry_date)::INTEGER / 86400;
    ELSE
        NEW.holding_period := NULL;
    END IF;

    -- Risk per trade (potential loss based on stop loss)
    IF NEW.stop_loss IS NOT NULL THEN
        IF NEW.trade_type = 'BUY' AND NEW.entry_price > NEW.stop_loss THEN
            NEW.risk_per_trade := (NEW.entry_price - NEW.stop_loss) * NEW.number_shares;
        ELSIF NEW.trade_type = 'SELL' AND NEW.stop_loss > NEW.entry_price THEN
            NEW.risk_per_trade := (NEW.stop_loss - NEW.entry_price) * NEW.number_shares;
        ELSE
            NEW.risk_per_trade := NULL;
        END IF;
    ELSE
        NEW.risk_per_trade := NULL;
    END IF;

    -- Risk reward ratio (potential profit vs potential loss)
    IF NEW.take_profit IS NOT NULL AND NEW.stop_loss IS NOT NULL THEN
        IF NEW.trade_type = 'BUY' AND (NEW.entry_price - NEW.stop_loss) > 0 THEN
            NEW.risk_reward := (NEW.take_profit - NEW.entry_price) / (NEW.entry_price - NEW.stop_loss);
        ELSIF NEW.trade_type = 'SELL' AND (NEW.stop_loss - NEW.entry_price) > 0 THEN
            NEW.risk_reward := (NEW.entry_price - NEW.take_profit) / (NEW.stop_loss - NEW.entry_price);
        ELSE
            NEW.risk_reward := NULL;
        END IF;
    ELSE
        NEW.risk_reward := NULL;
    END IF;

    -- Risk to reward on actual profit (actual profit vs potential loss)
    IF NEW.risk_per_trade IS NOT NULL AND NEW.risk_per_trade > 0 AND NEW.net_profit_dollars IS NOT NULL THEN
        NEW.risk_to_reward := NEW.net_profit_dollars / NEW.risk_per_trade;
    ELSE
        NEW.risk_to_reward := NULL;
    END IF;

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
UPDATE entry_table SET updated_at = CURRENT_TIMESTAMP WHERE id IS NOT NULL;
