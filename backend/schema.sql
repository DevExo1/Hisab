-- Database Schema for Emergent Splitwise
-- MariaDB/MySQL Compatible

-- Use the database
USE emergent_splitwise_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_friends;
DROP TABLE IF EXISTS expense_splits;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Groups table
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User friends table (bidirectional friendships)
CREATE TABLE user_friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_friend (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Group members table (many-to-many relationship)
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_by INT NOT NULL,
    group_id INT NOT NULL,
    category VARCHAR(100),
    expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    INDEX idx_paid_by (paid_by),
    INDEX idx_group_id (group_id),
    INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expense splits table (tracks who owes what for each expense)
CREATE TABLE expense_splits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_expense_id (expense_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settlements table (tracks payments between users)
CREATE TABLE settlements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    payer_id INT NOT NULL,
    payee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    settlement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    settlement_type VARCHAR(20) DEFAULT 'simplified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_group_id (group_id),
    INDEX idx_payer_id (payer_id),
    INDEX idx_payee_id (payee_id),
    INDEX idx_settlement_date (settlement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data for testing (optional)
-- You can comment this out if you don't want sample data

-- Sample users
INSERT INTO users (email, hashed_password, full_name) VALUES
('alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7L/tLnk5g2', 'Alice Johnson'),
('bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7L/tLnk5g2', 'Bob Smith'),
('charlie@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7L/tLnk5g2', 'Charlie Brown');

-- Sample groups
INSERT INTO groups (name, description, created_by, currency) VALUES
('Apartment 305', 'Roommates sharing rent and utilities', 1, 'USD'),
('Italy Trip 2025', 'Summer vacation expenses', 1, 'USD');

-- Sample group members
INSERT INTO group_members (group_id, user_id) VALUES
(1, 1), (1, 2), (1, 3),  -- All three in Apartment 305
(2, 1), (2, 2);           -- Alice and Bob in Italy Trip

-- Sample expenses
INSERT INTO expenses (description, amount, paid_by, group_id, category) VALUES
('Monthly Rent', 1500.00, 1, 1, 'Rent'),
('Electricity Bill', 85.50, 2, 1, 'Utilities'),
('Groceries', 120.75, 3, 1, 'Food'),
('Flight Tickets', 850.00, 1, 2, 'Travel');

-- Sample expense splits
-- Rent split equally among 3 people (1500/3 = 500 each)
INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(1, 1, 500.00), (1, 2, 500.00), (1, 3, 500.00);

-- Electricity split equally among 3 people (85.50/3 = 28.50 each)
INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(2, 1, 28.50), (2, 2, 28.50), (2, 3, 28.50);

-- Groceries split equally among 3 people (120.75/3 = 40.25 each)
INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(3, 1, 40.25), (3, 2, 40.25), (3, 3, 40.25);

-- Flight tickets split equally between 2 people (850/2 = 425 each)
INSERT INTO expense_splits (expense_id, user_id, amount) VALUES
(4, 1, 425.00), (4, 2, 425.00);

-- Sample settlement (Bob paid Alice $100)
INSERT INTO settlements (group_id, payer_id, payee_id, amount, notes) VALUES
(1, 2, 1, 100.00, 'Partial rent payment');
