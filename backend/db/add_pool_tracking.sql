-- Migration: Add pool tracking to circles table
-- Date: 2025-01-26
-- Description: Adds current_pool_amount column to track pooled funds for current cycle

ALTER TABLE circles
ADD COLUMN IF NOT EXISTS current_pool_amount DECIMAL(10, 2) DEFAULT 0;

-- Update existing circles to have 0 pool amount
UPDATE circles
SET current_pool_amount = 0
WHERE current_pool_amount IS NULL;
