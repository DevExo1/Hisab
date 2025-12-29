-- Migration: Add updated_at columns and indexes for sync functionality
-- Date: 2024-12-24
-- Description: Adds updated_at columns to user_friends and settlements tables
--              and creates indexes on updated_at columns for efficient sync queries

USE emergent_splitwise_db;

-- Add updated_at column to user_friends table
ALTER TABLE user_friends 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add updated_at column to settlements table
ALTER TABLE settlements 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes on updated_at columns for efficient sync queries
CREATE INDEX idx_groups_updated_at ON groups(updated_at);
CREATE INDEX idx_expenses_updated_at ON expenses(updated_at);
CREATE INDEX idx_user_friends_updated_at ON user_friends(updated_at);
CREATE INDEX idx_settlements_updated_at ON settlements(updated_at);

-- Initialize updated_at values for existing records
UPDATE user_friends SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE settlements SET updated_at = created_at WHERE updated_at IS NULL;
