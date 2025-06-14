-- Pre calculations for the options table
ALTER TABLE option_table
DROP COLUMN IF EXISTS gross_profit_percentage,
DROP COLUMN IF EXISTS gross_profit_dollars,
DROP COLUMN IF EXISTS net_profit_dollars,
DROP COLUMN IF EXISTS net_profit_percentage,
DROP COLUMN IF EXISTS trade_value, -- Total value of the trade
DROP COLUMN IF EXISTS return_on_investment,
DROP COLUMN IF EXISTS holding_period,
DROP COLUMN IF EXISTS stop_loss_percentage,
DROP COLUMN IF EXISTS is_win, -- Checks if the trade is a winner or loser
DROP COLUMN IF EXISTS risk_reward_ratio; -- Removed trailing comma

-- Will update later on (this is what I can think of right now)

-- Add columns with proper data types for options trading
ALTER TABLE option_table
ADD COLUMN gross_profit_percentage DECIMAL(10, 4),
ADD COLUMN gross_profit_dollars DECIMAL(15, 2),
ADD COLUMN net_profit_dollars DECIMAL(15, 2),
ADD COLUMN net_profit_percentage DECIMAL(10, 4),
ADD COLUMN trade_value DECIMAL(15, 2), -- Total premium paid/received
ADD COLUMN return_on_investment DECIMAL(10, 4), -- ROI percentage
ADD COLUMN holding_period INTEGER, -- Days held
ADD COLUMN stop_loss_percentage DECIMAL(10, 4),
ADD COLUMN is_win BOOLEAN,
ADD COLUMN risk_reward_ratio DECIMAL(10, 4);

-- Create a trigger function that calculates all values
CREATE OR REPLACE FUNCTION calculate_option()
RETURNS TRIGGER AS $$
DECLARE
      exit_premium DECIMAL(15, 2);
BEGIN
     -- Validate basic inputs
     IF NEW.entry_price IS NULL OR NEW.entry_price <= 0 OR
           NEW.number_contracts IS NULL OR NEW.number_contracts <= 0 THEN
            -- Set all calculated fields to NULL if basic inputs are invalid
            NEW.gross_profit_percentage := NULL;
            NEW.gross_profit_dollars := NULL;
            NEW.net_profit_dollars := NULL;
            NEW.net_profit_percentage := NULL;
            NEW.trade_value := NULL;
            NEW.return_on_investment := NULL;
            NEW.holding_period := NULL;
            NEW.stop_loss_percentage := NULL;
            NEW.is_win := NULL;
            NEW.risk_reward_ratio := NULL;
            NEW.updated_at := CURRENT_TIMESTAMP;
            RETURN NEW;
        END IF;

        -- Calculate total premium (always calculate this)
            -- For options: premium per contract * 100 shares per contract * number of contracts
            NEW.total_premium := NEW.entry_price * 100 * NEW.number_contracts;

            -- Trade value is the total premium (money at risk or received)
            NEW.trade_value := NEW.total_premium;

            -- Only calculate exit-dependent metrics if exit_price exists
            IF NEW.exit_price IS NOT NULL AND NEW.exit_price >= 0 THEN
                -- Calculate exit premium
                DECLARE
                    exit_premium DECIMAL(15, 2);
                BEGIN
                    exit_premium := NEW.exit_price * 100 * NEW.number_contracts;

                    -- Gross profit in dollars
                    -- For options: (exit_price - entry_price) * 100 * number_contracts
                    NEW.gross_profit_dollars := (NEW.exit_price - NEW.entry_price) * 100 * NEW.number_contracts;

                    -- Gross profit percentage
                    NEW.gross_profit_percentage := (NEW.gross_profit_dollars / NEW.total_premium) * 100;

                    -- Net profit in dollars (subtract commissions)
                    NEW.net_profit_dollars := NEW.gross_profit_dollars - COALESCE(NEW.commissions, 0);

                    -- Net profit percentage (based on initial premium paid)
                    NEW.net_profit_percentage := (NEW.net_profit_dollars / NEW.total_premium) * 100;

                    -- Return on Investment (same as net profit percentage for options)
                    NEW.return_on_investment := NEW.net_profit_percentage;

                    -- Is this trade a winner?
                    NEW.is_win := NEW.net_profit_dollars > 0;

                    -- Risk/Reward ratio for closed positions
                    -- For options, this is the ratio of max profit to max loss
                    -- Simplified: profit/loss ratio relative to premium paid
                    IF NEW.total_premium > 0 THEN
                        NEW.risk_reward_ratio := ABS(NEW.net_profit_dollars / NEW.total_premium);
                    ELSE
                        NEW.risk_reward_ratio := NULL;
                    END IF;
                END;
            ELSE
                -- No exit price, so set exit-dependent fields to NULL
                NEW.gross_profit_percentage := NULL;
                NEW.gross_profit_dollars := NULL;
                NEW.net_profit_dollars := NULL;
                NEW.net_profit_percentage := NULL;
                NEW.return_on_investment := NULL;
                NEW.is_win := NULL;
                NEW.risk_reward_ratio := NULL;
            END IF;

            -- Holding period in days
            IF NEW.exit_date IS NOT NULL AND NEW.entry_date IS NOT NULL THEN
                NEW.holding_period := EXTRACT(EPOCH FROM NEW.exit_date - NEW.entry_date)::INTEGER / 86400;
            ELSE
                NEW.holding_period := NULL;
            END IF;

            -- Stop loss percentage (if you implement stop loss for options)
            -- This would be based on the premium, not the underlying stock price
            -- For now, setting to NULL as it's not commonly used in options the same way
            NEW.stop_loss_percentage := NULL;

            -- Update the updated_at timestamp
            NEW.updated_at := CURRENT_TIMESTAMP;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Drop existing triggers if they exist
        DROP TRIGGER IF EXISTS trigger_calculate_option_insert ON option_table;
        DROP TRIGGER IF EXISTS trigger_calculate_option_update ON option_table;

        -- Create triggers for INSERT and UPDATE
        CREATE TRIGGER trigger_calculate_option_insert
            BEFORE INSERT ON option_table
            FOR EACH ROW
            EXECUTE FUNCTION calculate_option();

        CREATE TRIGGER trigger_calculate_option_update
            BEFORE UPDATE ON option_table
            FOR EACH ROW
            EXECUTE FUNCTION calculate_option();

        -- Update existing records to recalculate metrics (if any)
        UPDATE option_table SET updated_at = CURRENT_TIMESTAMP WHERE id IS NOT NULL;
END
