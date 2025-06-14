CREATE TABLE entry_table (
    id SERIAL PRIMARY KEY, -- Auto-incrementing primary KEY
    user_id UUID NOT NULL, -- Foreign key to the user table

    -- Trading 
    symbol VARCHAR(18) NOT NULL, -- Symbol of the trade
    trade_type VARCHAR(5) NOT NULL, -- Type of the trade buy or sell
    order_type VARCHAR(7) NOT NULL, -- Type of the trade (Market, limit, stop)
    
    entry_price NUMERIC NOT NULL, -- Entry price of the trade
    exit_price NUMERIC NOT NULL, -- Exit price of the trade 
    stop_loss NUMERIC NOT NULL, -- Stop loss price
    commissions NUMERIC NOT NULL DEFAULT 0.00, -- Commissions of the trade
    number_shares NUMERIC NOT NULL, -- Number of shares traded
    take_profit NUMERIC NOT NULL, -- Take profit price 
    market_conditions TEXT NOT NULL, -- Market conditions of the trade
    entry_tactics TEXT NOT NULL, -- entry tactics of the trade
    edges TEXT NOT NULL, -- edges of the trade 

    -- user interaction
    entry_date TIMESTAMP NOT NULL, -- Date of entry
    exit_date TIMESTAMP, -- Date of exit 

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When entry was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When entry was last updated 

    -- CONSTRAINTS
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);