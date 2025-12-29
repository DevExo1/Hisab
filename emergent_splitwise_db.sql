-- admin/x4oway96pFgzVt        phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 29, 2025 at 06:34 AM
-- Server version: 10.7.3-MariaDB
-- PHP Version: 7.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hisab-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_by` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `description`, `amount`, `paid_by`, `group_id`, `category`, `expense_date`, `created_at`, `updated_at`, `notes`) VALUES
(1, 'Monthly Rent', '1500.00', 1, 1, 'Rent', '2025-12-17 05:57:26', '2025-12-17 05:57:26', '2025-12-17 05:57:26', NULL),
(2, 'Electricity Bill', '85.50', 2, 1, 'Utilities', '2025-12-17 05:57:26', '2025-12-17 05:57:26', '2025-12-17 05:57:26', NULL),
(3, 'Groceries', '120.75', 3, 1, 'Food', '2025-12-17 05:57:26', '2025-12-17 05:57:26', '2025-12-17 05:57:26', NULL),
(4, 'Flight Tickets', '850.00', 1, 2, 'Travel', '2025-12-17 05:57:26', '2025-12-17 05:57:26', '2025-12-17 05:57:26', NULL),
(5, 'test exp', '1000.00', 2, 1, NULL, '2025-12-17 03:19:37', '2025-12-17 09:04:36', '2025-12-17 09:04:36', NULL),
(6, 'test 2', '1000.00', 1, 1, NULL, '2025-12-17 03:42:32', '2025-12-17 09:27:31', '2025-12-17 09:27:31', NULL),
(7, 'Test 3', '1000.00', 1, 1, NULL, '2025-12-17 06:43:42', '2025-12-17 12:28:41', '2025-12-17 12:28:41', NULL),
(8, 'Test Equal Split', '100.00', 1, 1, NULL, '2025-12-17 07:05:18', '2025-12-17 12:50:17', '2025-12-17 12:50:17', NULL),
(9, 'Test Exact Split', '100.00', 1, 1, NULL, '2025-12-17 07:05:20', '2025-12-17 12:50:19', '2025-12-17 12:50:19', NULL),
(12, 'Test Equal Split', '100.00', 1, 1, NULL, '2025-12-17 07:08:55', '2025-12-17 12:53:54', '2025-12-17 12:53:54', NULL),
(13, 'Test Exact Split', '100.00', 1, 1, NULL, '2025-12-17 07:08:57', '2025-12-17 12:53:56', '2025-12-17 12:53:56', NULL),
(14, 'Test Percentage Split', '100.00', 1, 1, NULL, '2025-12-17 07:08:59', '2025-12-17 12:53:58', '2025-12-17 12:53:58', NULL),
(16, 'test 4', '1000.00', 1, 1, NULL, '2025-12-17 07:09:09', '2025-12-17 12:54:08', '2025-12-17 12:54:08', NULL),
(17, 'test 5', '500.00', 2, 1, NULL, '2025-12-17 07:10:11', '2025-12-17 12:55:10', '2025-12-17 12:55:10', NULL),
(18, 'Equal Test', '100.00', 1, 1, NULL, '2025-12-17 07:19:53', '2025-12-17 13:04:53', '2025-12-17 13:04:53', NULL),
(19, 'Exact Test', '100.00', 1, 1, NULL, '2025-12-17 07:19:55', '2025-12-17 13:04:55', '2025-12-17 13:04:55', NULL),
(20, 'Percentage Test', '100.00', 1, 1, NULL, '2025-12-17 07:19:58', '2025-12-17 13:04:57', '2025-12-17 13:04:57', NULL),
(21, 'test', '200.00', 1, 1, NULL, '2025-12-17 07:22:58', '2025-12-17 13:07:57', '2025-12-17 13:07:57', NULL),
(22, 'test7', '300.00', 1, 1, NULL, '2025-12-17 07:24:25', '2025-12-17 13:09:24', '2025-12-17 13:09:24', NULL),
(23, 'test8', '500.00', 1, 1, NULL, '2025-12-17 07:57:49', '2025-12-17 13:42:48', '2025-12-17 13:42:48', NULL),
(24, 'Ntest1', '500.00', 2, 4, NULL, '2025-12-17 12:07:30', '2025-12-17 17:52:29', '2025-12-17 17:52:29', NULL),
(25, 'Test Expense Item for gp 2.10', '999.00', 2, 4, NULL, '2025-12-17 12:56:37', '2025-12-17 18:41:36', '2025-12-17 18:41:36', NULL),
(26, 'nmnnnm jkjjkjj kjkjkjkjjk', '300.00', 1, 4, NULL, '2025-12-17 13:01:52', '2025-12-17 18:46:51', '2025-12-17 18:46:51', NULL),
(27, 'test3', '9000.00', 2, 4, NULL, '2025-12-22 05:12:53', '2025-12-22 10:57:52', '2025-12-22 10:57:52', NULL),
(28, 'test4', '9000.00', 5, 4, NULL, '2025-12-22 05:14:44', '2025-12-22 10:59:42', '2025-12-22 10:59:42', NULL),
(29, 'test5', '15000.00', 1, 4, NULL, '2025-12-22 05:27:58', '2025-12-22 11:12:56', '2025-12-22 11:12:56', NULL),
(30, 'Test b1', '7895.25', 5, 4, NULL, '2025-12-23 02:46:23', '2025-12-23 08:31:22', '2025-12-23 08:31:22', NULL),
(31, 'test expense b2', '854.23', 1, 2, NULL, '2025-12-23 04:44:27', '2025-12-23 10:29:26', '2025-12-23 10:29:26', NULL),
(32, 'Expense b3', '5879.00', 1, 2, NULL, '2025-12-23 05:56:00', '2025-12-23 11:40:58', '2025-12-23 11:40:58', NULL),
(33, 'test 6', '500.00', 2, 2, NULL, '2025-12-23 06:26:35', '2025-12-23 12:11:34', '2025-12-23 12:11:34', NULL),
(34, 'Dinner', '588.00', 1, 2, NULL, '2025-12-23 10:25:03', '2025-12-23 16:10:02', '2025-12-23 16:10:02', NULL),
(35, 'Fun land', '2588.00', 1, 2, NULL, '2025-12-23 10:41:49', '2025-12-23 16:26:48', '2025-12-23 16:26:48', NULL),
(36, 'movide', '5678.00', 5, 2, NULL, '2025-12-23 11:30:24', '2025-12-23 17:15:22', '2025-12-23 17:15:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expense_splits`
--

CREATE TABLE `expense_splits` (
  `id` int(11) NOT NULL,
  `expense_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_splits`
--

INSERT INTO `expense_splits` (`id`, `expense_id`, `user_id`, `amount`, `created_at`) VALUES
(1, 1, 1, '500.00', '2025-12-17 05:57:26'),
(2, 1, 2, '500.00', '2025-12-17 05:57:26'),
(3, 1, 3, '500.00', '2025-12-17 05:57:26'),
(4, 2, 1, '28.50', '2025-12-17 05:57:26'),
(5, 2, 2, '28.50', '2025-12-17 05:57:26'),
(6, 2, 3, '28.50', '2025-12-17 05:57:26'),
(7, 3, 1, '40.25', '2025-12-17 05:57:26'),
(8, 3, 2, '40.25', '2025-12-17 05:57:26'),
(9, 3, 3, '40.25', '2025-12-17 05:57:26'),
(10, 4, 1, '425.00', '2025-12-17 05:57:26'),
(11, 4, 2, '425.00', '2025-12-17 05:57:26'),
(12, 5, 1, '333.33', '2025-12-17 09:04:36'),
(13, 5, 2, '333.33', '2025-12-17 09:04:36'),
(14, 5, 3, '333.33', '2025-12-17 09:04:36'),
(15, 6, 1, '333.33', '2025-12-17 09:27:31'),
(16, 6, 2, '333.33', '2025-12-17 09:27:31'),
(17, 6, 3, '333.33', '2025-12-17 09:27:31'),
(18, 7, 1, '500.00', '2025-12-17 12:28:41'),
(19, 7, 2, '500.00', '2025-12-17 12:28:41'),
(20, 8, 1, '50.00', '2025-12-17 12:50:17'),
(21, 8, 2, '50.00', '2025-12-17 12:50:17'),
(22, 9, 1, '60.00', '2025-12-17 12:50:19'),
(23, 9, 2, '40.00', '2025-12-17 12:50:19'),
(24, 12, 1, '50.00', '2025-12-17 12:53:54'),
(25, 12, 2, '50.00', '2025-12-17 12:53:54'),
(26, 13, 1, '60.00', '2025-12-17 12:53:56'),
(27, 13, 2, '40.00', '2025-12-17 12:53:56'),
(28, 14, 1, '70.00', '2025-12-17 12:53:58'),
(29, 14, 2, '30.00', '2025-12-17 12:53:58'),
(30, 16, 1, '1000.00', '2025-12-17 12:54:08'),
(31, 17, 1, '250.00', '2025-12-17 12:55:10'),
(32, 17, 2, '250.00', '2025-12-17 12:55:10'),
(33, 18, 1, '50.00', '2025-12-17 13:04:53'),
(34, 18, 2, '50.00', '2025-12-17 13:04:53'),
(35, 19, 1, '60.00', '2025-12-17 13:04:55'),
(36, 19, 2, '40.00', '2025-12-17 13:04:55'),
(37, 20, 1, '70.00', '2025-12-17 13:04:57'),
(38, 20, 2, '30.00', '2025-12-17 13:04:57'),
(39, 21, 1, '100.00', '2025-12-17 13:07:57'),
(40, 21, 2, '100.00', '2025-12-17 13:07:57'),
(41, 22, 1, '150.00', '2025-12-17 13:09:24'),
(42, 22, 2, '150.00', '2025-12-17 13:09:24'),
(43, 23, 1, '375.00', '2025-12-17 13:42:48'),
(44, 23, 2, '125.00', '2025-12-17 13:42:48'),
(45, 24, 1, '250.00', '2025-12-17 17:52:29'),
(46, 24, 2, '250.00', '2025-12-17 17:52:29'),
(47, 25, 1, '499.50', '2025-12-17 18:41:36'),
(48, 25, 2, '499.50', '2025-12-17 18:41:36'),
(49, 26, 1, '125.00', '2025-12-17 18:46:51'),
(50, 26, 2, '175.00', '2025-12-17 18:46:51'),
(51, 27, 1, '3000.00', '2025-12-22 10:57:52'),
(52, 27, 2, '3000.00', '2025-12-22 10:57:52'),
(53, 27, 5, '3000.00', '2025-12-22 10:57:52'),
(54, 28, 1, '3000.00', '2025-12-22 10:59:42'),
(55, 28, 2, '3000.00', '2025-12-22 10:59:42'),
(56, 28, 5, '3000.00', '2025-12-22 10:59:42'),
(57, 29, 1, '5000.00', '2025-12-22 11:12:56'),
(58, 29, 2, '5000.00', '2025-12-22 11:12:56'),
(59, 29, 5, '5000.00', '2025-12-22 11:12:56'),
(60, 30, 1, '2631.75', '2025-12-23 08:31:22'),
(61, 30, 2, '2631.75', '2025-12-23 08:31:22'),
(62, 30, 5, '2631.75', '2025-12-23 08:31:22'),
(63, 31, 1, '213.56', '2025-12-23 10:29:26'),
(64, 31, 2, '213.56', '2025-12-23 10:29:26'),
(65, 31, 3, '213.56', '2025-12-23 10:29:26'),
(66, 31, 5, '213.56', '2025-12-23 10:29:26'),
(67, 32, 1, '1469.75', '2025-12-23 11:40:58'),
(68, 32, 2, '1469.75', '2025-12-23 11:40:58'),
(69, 32, 3, '1469.75', '2025-12-23 11:40:58'),
(70, 32, 5, '1469.75', '2025-12-23 11:40:58'),
(71, 33, 1, '100.00', '2025-12-23 12:11:34'),
(72, 33, 2, '100.00', '2025-12-23 12:11:34'),
(73, 33, 3, '100.00', '2025-12-23 12:11:34'),
(74, 33, 5, '100.00', '2025-12-23 12:11:34'),
(75, 33, 7, '100.00', '2025-12-23 12:11:34'),
(76, 34, 1, '117.60', '2025-12-23 16:10:02'),
(77, 34, 2, '117.60', '2025-12-23 16:10:02'),
(78, 34, 3, '117.60', '2025-12-23 16:10:02'),
(79, 34, 5, '117.60', '2025-12-23 16:10:02'),
(80, 34, 7, '117.60', '2025-12-23 16:10:02'),
(81, 35, 1, '517.60', '2025-12-23 16:26:48'),
(82, 35, 2, '517.60', '2025-12-23 16:26:48'),
(83, 35, 3, '517.60', '2025-12-23 16:26:48'),
(84, 35, 5, '517.60', '2025-12-23 16:26:48'),
(85, 35, 7, '517.60', '2025-12-23 16:26:48'),
(86, 36, 1, '1892.67', '2025-12-23 17:15:22'),
(87, 36, 2, '1892.67', '2025-12-23 17:15:22'),
(88, 36, 5, '1892.67', '2025-12-23 17:15:22');

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `name`, `description`, `created_by`, `currency`, `created_at`, `updated_at`) VALUES
(1, 'Test Group 11', 'Roommates sharing rent and utilities', 1, 'PHP', '2025-12-17 05:57:26', '2025-12-18 07:11:48'),
(2, 'Italy Trip 2024', 'Summer vacation expenses', 1, 'GBP', '2025-12-17 05:57:26', '2025-12-23 17:25:22'),
(3, 'Test Grp1', NULL, 1, 'USD', '2025-12-17 08:58:50', '2025-12-17 08:58:50'),
(4, 'Test Group 2.10', NULL, 1, 'NPR', '2025-12-17 17:08:08', '2025-12-17 18:40:28'),
(5, 'Group 3', NULL, 5, 'NPR', '2025-12-23 09:24:09', '2025-12-23 09:24:09'),
(6, 'Rovo Smoke Group', NULL, 7, 'USD', '2025-12-23 11:21:09', '2025-12-23 11:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `joined_at`, `is_active`) VALUES
(1, 1, 1, '2025-12-17 05:57:26', 1),
(2, 1, 2, '2025-12-17 05:57:26', 0),
(3, 1, 3, '2025-12-17 05:57:26', 0),
(4, 2, 1, '2025-12-17 05:57:26', 1),
(5, 2, 2, '2025-12-17 05:57:26', 1),
(6, 3, 1, '2025-12-17 08:58:50', 1),
(7, 4, 1, '2025-12-17 17:08:08', 1),
(8, 4, 2, '2025-12-17 17:08:08', 1),
(9, 4, 5, '2025-12-22 10:18:33', 1),
(10, 5, 1, '2025-12-23 09:24:09', 1),
(11, 5, 2, '2025-12-23 09:24:09', 1),
(12, 5, 6, '2025-12-23 09:24:09', 1),
(13, 5, 5, '2025-12-23 09:24:09', 1),
(14, 2, 5, '2025-12-23 10:28:39', 1),
(15, 2, 3, '2025-12-23 10:28:39', 1),
(16, 6, 7, '2025-12-23 11:21:09', 1),
(17, 6, 1, '2025-12-23 11:24:35', 1),
(18, 2, 7, '2025-12-23 11:40:36', 1);

-- --------------------------------------------------------

--
-- Table structure for table `settlements`
--

CREATE TABLE `settlements` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `payer_id` int(11) NOT NULL,
  `payee_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `settlement_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settlements`
--

INSERT INTO `settlements` (`id`, `group_id`, `payer_id`, `payee_id`, `amount`, `settlement_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, '100.00', '2025-12-17 05:57:26', 'Partial rent payment', '2025-12-17 05:57:26', '2025-12-24 18:58:42'),
(2, 4, 1, 2, '200.00', '2025-12-22 03:40:08', 'test settlement', '2025-12-22 09:25:06', '2025-12-24 18:58:42'),
(3, 4, 1, 2, '187.25', '2025-12-22 03:54:04', 'test 2', '2025-12-22 09:39:03', '2025-12-24 18:58:42'),
(4, 4, 1, 2, '362.25', '2025-12-22 04:31:46', 'sdsd', '2025-12-22 10:16:45', '2025-12-24 18:58:42'),
(5, 4, 2, 1, '175.00', '2025-12-22 04:32:03', 'sdsdsds', '2025-12-22 10:17:02', '2025-12-24 18:58:42'),
(6, 2, 2, 1, '2008.31', '2025-12-23 06:28:13', 'cash', '2025-12-23 12:13:12', '2025-12-24 18:58:42'),
(7, 2, 5, 2, '50.00', '2025-12-23 06:53:18', 'cash', '2025-12-23 12:38:16', '2025-12-24 18:58:42'),
(8, 2, 5, 1, '1583.30', '2025-12-23 06:55:05', 'cash', '2025-12-23 12:40:04', '2025-12-24 18:58:42'),
(9, 2, 5, 2, '150.01', '2025-12-23 06:55:19', 'casg', '2025-12-23 12:40:18', '2025-12-24 18:58:42'),
(10, 2, 1, 5, '578.73', '2025-12-23 11:31:38', 'Venmo', '2025-12-23 17:16:37', '2025-12-24 18:58:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `hashed_password`, `full_name`, `created_at`, `updated_at`) VALUES
(1, 'alice@example.com', '$2b$12$nA5ArW7610Nz/SksOpIXWe.ajn8UyZwIbch5dRQrp3UsT4uwOKao.', 'Alice Johnson', '2025-12-17 05:57:26', '2025-12-17 06:22:36'),
(2, 'bob@example.com', '$2b$12$nA5ArW7610Nz/SksOpIXWe.ajn8UyZwIbch5dRQrp3UsT4uwOKao.', 'Bob Smit', '2025-12-17 05:57:26', '2025-12-22 13:02:59'),
(3, 'charlie@example.com', '$2b$12$nA5ArW7610Nz/SksOpIXWe.ajn8UyZwIbch5dRQrp3UsT4uwOKao.', 'Charlie Brown', '2025-12-17 05:57:26', '2025-12-17 06:22:36'),
(4, 'testuser@example.com', '$2b$12$vSLm92dnKIYlQO8NSYHVSeqj47.K/g84/2O.1xfm8Jal3ebM18SwG', 'Test User', '2025-12-17 06:28:56', '2025-12-17 06:28:56'),
(5, 'aj@gmail.com', '$2b$12$fWGCov2rhcgE0IeELPhCy.HSliknl8PH4OAdjy8V21yXkRL8oWskS', 'Ad Gad', '2025-12-18 08:32:00', '2025-12-23 08:26:40'),
(6, 'jj@gmail.com', '$2b$12$.tuGyzmNQLpja8coYtiWYeue1vDxNIP7kTTfkcs5cumsslLyI25ee', 'JJ Dude', '2025-12-22 07:52:50', '2025-12-22 07:57:17'),
(7, 'rovo.smoke+1@example.com', '$2b$12$4kNZN/odST13b4EuVEGC8eopJunKNZYngmOUEdCE.Y/zgS2SnS0Vm', 'Rovo Smoke', '2025-12-23 11:15:28', '2025-12-23 11:15:28');

-- --------------------------------------------------------

--
-- Table structure for table `user_friends`
--

CREATE TABLE `user_friends` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_friends`
--

INSERT INTO `user_friends` (`id`, `user_id`, `friend_id`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2025-12-18 07:17:21', '2025-12-24 18:58:41'),
(2, 2, 1, '2025-12-18 07:17:21', '2025-12-24 18:58:41'),
(3, 1, 3, '2025-12-18 07:17:21', '2025-12-24 18:58:41'),
(4, 3, 1, '2025-12-18 07:17:21', '2025-12-24 18:58:41'),
(5, 2, 3, '2025-12-18 07:19:04', '2025-12-24 18:58:41'),
(6, 3, 2, '2025-12-18 07:19:04', '2025-12-24 18:58:41'),
(7, 2, 4, '2025-12-18 07:20:50', '2025-12-24 18:58:41'),
(8, 4, 2, '2025-12-18 07:20:50', '2025-12-24 18:58:41'),
(9, 5, 1, '2025-12-18 08:32:25', '2025-12-24 18:58:41'),
(10, 1, 5, '2025-12-18 08:32:25', '2025-12-24 18:58:41'),
(11, 5, 2, '2025-12-18 08:32:38', '2025-12-24 18:58:41'),
(12, 2, 5, '2025-12-18 08:32:38', '2025-12-24 18:58:41'),
(13, 5, 6, '2025-12-22 07:54:28', '2025-12-24 18:58:41'),
(14, 6, 5, '2025-12-22 07:54:28', '2025-12-24 18:58:41'),
(15, 7, 1, '2025-12-23 11:19:46', '2025-12-24 18:58:41'),
(16, 1, 7, '2025-12-23 11:19:46', '2025-12-24 18:58:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_paid_by` (`paid_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_expense_date` (`expense_date`),
  ADD KEY `idx_expenses_updated_at` (`updated_at`);

--
-- Indexes for table `expense_splits`
--
ALTER TABLE `expense_splits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expense_id` (`expense_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_groups_updated_at` (`updated_at`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `settlements`
--
ALTER TABLE `settlements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_payer_id` (`payer_id`),
  ADD KEY `idx_payee_id` (`payee_id`),
  ADD KEY `idx_settlement_date` (`settlement_date`),
  ADD KEY `idx_settlements_updated_at` (`updated_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_friends`
--
ALTER TABLE `user_friends`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_friendship` (`user_id`,`friend_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_friend_id` (`friend_id`),
  ADD KEY `idx_user_friends_updated_at` (`updated_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `expense_splits`
--
ALTER TABLE `expense_splits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `settlements`
--
ALTER TABLE `settlements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_friends`
--
ALTER TABLE `user_friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`paid_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_splits`
--
ALTER TABLE `expense_splits`
  ADD CONSTRAINT `expense_splits_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_splits_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `settlements`
--
ALTER TABLE `settlements`
  ADD CONSTRAINT `settlements_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `settlements_ibfk_2` FOREIGN KEY (`payer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `settlements_ibfk_3` FOREIGN KEY (`payee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_friends`
--
ALTER TABLE `user_friends`
  ADD CONSTRAINT `user_friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
