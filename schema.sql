CREATE TABLE IF NOT EXISTS holdings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  country TEXT,
  trade_ccy TEXT DEFAULT 'EUR',
  invested DECIMAL(12,2) DEFAULT 0,
  current DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO holdings (id, name, ticker, country, invested, current, trade_ccy) VALUES
(1, 'Vanguard S&P 500 UCITS ETF', 'VUAA', 'USA', 2502.99, 2712.05, 'EUR'),
(2, 'iShares Nasdaq 100 UCITS ETF', 'NQSE', 'USA', 1638.99, 1926.83, 'EUR'),
(3, 'Berkshire Hathaway Class B', 'BRK.B', 'USA', 1692.81, 1844.66, 'USD'),
(4, 'Alphabet Inc Class C', 'GOOG', 'USA', 758.00, 1639.32, 'USD'),
(5, 'Amazon.com Inc', 'AMZN', 'USA', 212.34, 215.31, 'USD'),
(6, 'NVIDIA Corp', 'NVDA', 'USA', 916.45, 3295.55, 'USD'),
(7, 'Apple Inc', 'AAPL', 'USA', 1979.04, 2602.34, 'USD'),
(8, 'Taiwan Semiconductor', 'TSM', 'Taiwan', 437.46, 788.44, 'USD'),
(9, 'Broadcom Inc', 'AVGO', 'USA', 248.51, 384.69, 'USD'),
(10, 'iRobot Corp (bankrupt)', 'IRBTQ', 'USA', 152.44, 0.63, 'USD'),
(11, 'Gold', 'XAU', 'Global', 185.22, 293.43, 'EUR'),
(12, 'Cash (Revolut)', 'CASH', '—', 2177.11, 2177.11, 'EUR');

SELECT setval('holdings_id_seq', 13, false);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON holdings
FOR ALL USING (true) WITH CHECK (true);
