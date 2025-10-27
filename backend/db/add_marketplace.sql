-- Community Marketplace Feature
-- Peer-to-peer item lending system

-- Items table - stores items available for lending
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'other', -- tools, electronics, books, sports, household, other
  condition VARCHAR(20) DEFAULT 'good', -- new, like_new, good, fair
  daily_rate DECIMAL(10, 2) DEFAULT 0, -- Optional daily rental fee
  deposit_amount DECIMAL(10, 2) NOT NULL, -- Refundable security deposit
  status VARCHAR(20) DEFAULT 'available', -- available, borrowed, unavailable
  min_credit_score INTEGER DEFAULT 500, -- Minimum borrower credit score required
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item borrows table - tracks borrowing transactions
CREATE TABLE IF NOT EXISTS item_borrows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'requested', -- requested, approved, active, returned, completed, rejected, cancelled
  borrow_start_date DATE,
  borrow_end_date DATE,
  actual_return_date DATE,
  deposit_paid DECIMAL(10, 2),
  deposit_refunded DECIMAL(10, 2),
  rental_fee_paid DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace payments table - tracks deposit payments and refunds
CREATE TABLE IF NOT EXISTS marketplace_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrow_id UUID REFERENCES item_borrows(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL, -- deposit, refund, rental_fee
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50) DEFAULT 'mock', -- mock, credit_card, debit_card, bank_account, digital_wallet
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_borrows_item ON item_borrows(item_id);
CREATE INDEX IF NOT EXISTS idx_borrows_borrower ON item_borrows(borrower_id);
CREATE INDEX IF NOT EXISTS idx_borrows_status ON item_borrows(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_payments_borrow ON marketplace_payments(borrow_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payments_borrower ON marketplace_payments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payments_owner ON marketplace_payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payments_type ON marketplace_payments(payment_type);

-- Update timestamp trigger for items
CREATE OR REPLACE FUNCTION update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at_trigger
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_items_updated_at();

-- Update timestamp trigger for item_borrows
CREATE OR REPLACE FUNCTION update_item_borrows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER item_borrows_updated_at_trigger
BEFORE UPDATE ON item_borrows
FOR EACH ROW
EXECUTE FUNCTION update_item_borrows_updated_at();

-- Update timestamp trigger for marketplace_payments
CREATE OR REPLACE FUNCTION update_marketplace_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketplace_payments_updated_at_trigger
BEFORE UPDATE ON marketplace_payments
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_payments_updated_at();
