-- Clear existing data
DELETE FROM holdings;

-- Insert new dummy data
INSERT INTO holdings (id, name, ticker, country, invested, current, trade_ccy) VALUES
(1, 'iShares Core S&P 500 ETF', 'IVV', 'USA', 3200.00, 3850.00, 'USD'),
(2, 'Vanguard FTSE Developed Markets ETF', 'VEA', 'Global', 1850.00, 1920.00, 'EUR'),
(3, 'Microsoft Corporation', 'MSFT', 'USA', 2100.00, 2580.00, 'USD'),
(4, 'Tesla Inc', 'TSLA', 'USA', 1450.00, 1680.00, 'USD'),
(5, 'Meta Platforms Inc', 'META', 'USA', 890.00, 1120.00, 'USD'),
(6, 'Netflix Inc', 'NFLX', 'USA', 650.00, 720.00, 'USD'),
(7, 'Johnson & Johnson', 'JNJ', 'USA', 1200.00, 1250.00, 'USD'),
(8, 'Visa Inc', 'V', 'USA', 980.00, 1150.00, 'USD'),
(9, 'Procter & Gamble', 'PG', 'USA', 740.00, 780.00, 'USD'),
(10, 'Coca-Cola Company', 'KO', 'USA', 550.00, 590.00, 'USD'),
(11, 'Silver', 'XAG', 'Global', 420.00, 510.00, 'EUR'),
(12, 'Cash (Savings)', 'CASH', '—', 1500.00, 1500.00, 'EUR');

-- Reset sequence
SELECT setval('holdings_id_seq', 13, false);
