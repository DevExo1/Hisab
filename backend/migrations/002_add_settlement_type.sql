-- Migration: Add settlement_type column to settlements table
-- This tracks whether a settlement was made from 'simplified' or 'detailed' view
-- Simplified settlements affect NET balances, detailed settlements affect PAIRWISE balances

ALTER TABLE settlements 
ADD COLUMN settlement_type VARCHAR(20) DEFAULT 'simplified' 
AFTER notes;

-- Update existing settlements to default type
UPDATE settlements SET settlement_type = 'simplified' WHERE settlement_type IS NULL;
