-- Add payout_type column to payouts table
-- This migration adds support for automatic vs manual payouts

-- Add payout_type column
ALTER TABLE payouts 
ADD payout_type VARCHAR(20) DEFAULT 'manual';

-- Add comment for clarity (PostgreSQL only)
-- COMMENT ON COLUMN payouts.payout_type IS 'Type of payout: manual, automatic, or scheduled';

-- Update existing payouts to have 'manual' type
UPDATE payouts 
SET payout_type = 'manual' 
WHERE payout_type IS NULL;
