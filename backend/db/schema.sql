-- PayItForward Database Schema
-- Digital ROSCA/Tanda Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  language_preference VARCHAR(10) DEFAULT 'en',
  profile_verified BOOLEAN DEFAULT FALSE,
  credit_score INTEGER DEFAULT 500,
  total_circles_joined INTEGER DEFAULT 0,
  total_payments_made INTEGER DEFAULT 0,
  total_vouches_given INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circles table (lending groups)
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  max_members INTEGER DEFAULT 20,
  current_members INTEGER DEFAULT 1,
  current_cycle INTEGER DEFAULT 1,
  current_pool_amount DECIMAL(10, 2) DEFAULT 0, -- Tracks pooled funds for current cycle
  payout_order JSONB, -- Array of user IDs in payout order
  next_payout_date DATE,
  next_payout_user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, disbanded
  invite_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circle members junction table
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, removed
  role VARCHAR(20) DEFAULT 'member', -- admin, member
  position_in_cycle INTEGER,
  has_received_payout BOOLEAN DEFAULT FALSE,
  payout_received_date DATE,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vouched_by UUID REFERENCES users(id),
  total_contributions DECIMAL(10, 2) DEFAULT 0,
  missed_payments INTEGER DEFAULT 0,
  UNIQUE(circle_id, user_id)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  cycle_number INTEGER NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, late
  payment_method VARCHAR(50) DEFAULT 'mock', -- mock, card, bank, cash
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  cycle_number INTEGER NOT NULL,
  payout_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouches table (collaborative feature)
CREATE TABLE vouches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES users(id) ON DELETE CASCADE, -- person giving vouch
  vouchee_id UUID REFERENCES users(id) ON DELETE CASCADE, -- person receiving vouch
  status VARCHAR(20) DEFAULT 'active', -- active, revoked
  trust_level INTEGER DEFAULT 5, -- 1-10 scale
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(circle_id, voucher_id, vouchee_id)
);

-- Credit history table
CREATE TABLE credit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- payment_made, payment_missed, vouch_given, vouch_received, payout_received
  impact INTEGER NOT NULL, -- positive or negative points
  previous_score INTEGER,
  new_score INTEGER,
  circle_id UUID REFERENCES circles(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI risk assessments table
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id),
  assessment_type VARCHAR(50) NOT NULL, -- join_request, payment_pattern, fraud_detection
  risk_score DECIMAL(5, 2), -- 0-100 scale
  risk_level VARCHAR(20), -- low, medium, high, critical
  factors JSONB, -- Array of risk factors identified
  ai_model_version VARCHAR(50),
  recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- payment_due, payment_received, vouch_request, payout_ready
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_circles_admin ON circles(admin_id);
CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX idx_circle_members_user ON circle_members(user_id);
CREATE INDEX idx_circle_members_status ON circle_members(status);
CREATE INDEX idx_payments_circle ON payments(circle_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payouts_circle ON payouts(circle_id);
CREATE INDEX idx_payouts_recipient ON payouts(recipient_id);
CREATE INDEX idx_vouches_circle ON vouches(circle_id);
CREATE INDEX idx_vouches_voucher ON vouches(voucher_id);
CREATE INDEX idx_vouches_vouchee ON vouches(vouchee_id);
CREATE INDEX idx_credit_history_user ON credit_history(user_id);
CREATE INDEX idx_risk_assessments_user ON risk_assessments(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
