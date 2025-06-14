-- Index for performance
CREATE INDEX IF NOT EXISTS idx_option_table_is_win ON option_table (is_win);

CREATE INDEX IF NOT EXISTS idx_option_table_net_profit ON option_table (net_profit_dollars);

CREATE INDEX IF NOT EXISTS idx_option_table_holding_period ON option_table (holding_period);
