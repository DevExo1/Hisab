-- Migration: Add settlement_method column to groups table
-- This enables locking a group to one settlement method (simplified or detailed)
-- Once a group makes their first settlement, they're locked to that method
-- The lock resets when all balances are cleared (everyone is settled up)

-- Add settlement_method column to groups table
ALTER TABLE groups 
ADD COLUMN settlement_method ENUM('simplified', 'detailed') DEFAULT NULL 
COMMENT 'Locked settlement method for this group. NULL means not yet chosen.';

-- Index for quick lookup when checking settlement method
ALTER TABLE groups 
ADD INDEX idx_settlement_method (settlement_method);
