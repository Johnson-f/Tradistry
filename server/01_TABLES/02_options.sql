CREATE TABLE option_table (
    id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    user_id UUID NOT NULL, -- Foreign key to user table (auth)
    -- option_table
    symbol VARCHAR(18) NOT NULL, -- Symbol of the option contract
    strategy TEXT NOT NULL, -- Strategy of the option (Iron Condor, Long calls)
    option_type VARCHAR(4) NOT NULL, -- Contract type, put or call
    strike_price NUMERIC NOT NULL, -- Strike price of the stock
    expiration_date TIMESTAMP NOT NULL, -- Contracts expiration
    entry_price NUMERIC NOT NULL, -- Entry price of the contracts
    number_contracts NUMERIC NOT NULL, -- Number of contracts traded
    exit_price NUMERIC, -- Exit price of the contracts (nullable for open positions)
    commissions NUMERIC NOT NULL, -- Commission of the contracts
    order_type VARCHAR(7) NOT NULL, -- Buy method for the trade (limit, market)
    -- Advanced stuff
    implied_volatility NUMERIC NOT NULL,
    -- Auto calculated
    total_premium NUMERIC DEFAULT 0,  --  Entry * 100 * number_contracts
    -- Dates
    entry_date TIMESTAMP NOT NULL, -- Date of entry
    exit_date TIMESTAMP, -- Date of exit (nullable for open positions)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When entry was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When entry was last updated
    -- CONSTRAINTS
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);
