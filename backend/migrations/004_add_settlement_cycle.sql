-- Migration: Add settlement_cycle for tracking settlement history
-- When a group is fully settled, the cycle increments.
-- Balance calculations only consider expenses/settlements in the current cycle.
-- This ensures both views show $0 after a full settlement, while preserving history.

-- Add settlement_cycle to groups table (tracks current cycle number)
ALTER TABLE groups 
ADD COLUMN settlement_cycle INT DEFAULT 1 
COMMENT 'Current settlement cycle. Increments when group is fully settled.';

-- Add settlement_cycle to expenses table (tracks which cycle an expense belongs to)
ALTER TABLE expenses 
ADD COLUMN settlement_cycle INT DEFAULT 1 
COMMENT 'Settlement cycle this expense belongs to.';

-- Add settlement_cycle to settlements table (tracks which cycle a settlement belongs to)
ALTER TABLE settlements 
ADD COLUMN settlement_cycle INT DEFAULT 1 
COMMENT 'Settlement cycle this settlement belongs to.';

-- Update existing expenses to be in cycle 1
UPDATE expenses SET settlement_cycle = 1 WHERE settlement_cycle IS NULL;

-- Update existing settlements to be in cycle 1
UPDATE settlements SET settlement_cycle = 1 WHERE settlement_cycle IS NULL;

-- Add index for faster cycle-based queries
ALTER TABLE expenses ADD INDEX idx_settlement_cycle (group_id, settlement_cycle);
ALTER TABLE settlements ADD INDEX idx_settlement_cycle (group_id, settlement_cycle);
