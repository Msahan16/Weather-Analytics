-- ========================================================
-- Weather-Analytics MySQL Database Schema (XAMPP Setup)
-- Database Name: Weather-AnalyticsDB
-- ========================================================

CREATE DATABASE IF NOT EXISTS `Weather-AnalyticsDB` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `Weather-AnalyticsDB`;

-- --------------------------------------------------------
-- Table structure for `cities`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `city_code` VARCHAR(50) NOT NULL UNIQUE,
  `city_name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(50) DEFAULT 'GLOBAL',
  `temp` DECIMAL(5,2) DEFAULT 20.0,
  `status` VARCHAR(50) DEFAULT 'Clear',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `weather_records`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weather_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `city_code` VARCHAR(50) NOT NULL,
  `city_name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(50) DEFAULT 'GLOBAL',
  `temp_c` DECIMAL(5,2) NOT NULL,
  `temp_f` DECIMAL(5,2) NOT NULL,
  `feels_like_c` DECIMAL(5,2),
  `feels_like_f` DECIMAL(5,2),
  `temp_min_c` DECIMAL(5,2),
  `temp_max_c` DECIMAL(5,2),
  `weather_main` VARCHAR(50),
  `weather_description` VARCHAR(100),
  `weather_icon` VARCHAR(50),
  `humidity` INT NOT NULL,
  `pressure` INT NOT NULL,
  `wind_speed` DECIMAL(5,2) NOT NULL,
  `wind_deg` INT DEFAULT 0,
  `cloudiness` INT NOT NULL,
  `visibility` INT DEFAULT 10000,
  `comfort_score` DECIMAL(5,2) NOT NULL,
  `comfort_category` VARCHAR(50) NOT NULL,
  `comfort_breakdown` LONGTEXT NULL,
  `source` VARCHAR(50) DEFAULT 'live',
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_city_code` (`city_code`),
  INDEX `idx_recorded_at` (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `cache_telemetry`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cache_telemetry` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cache_key` VARCHAR(100) NOT NULL,
  `action` VARCHAR(20) NOT NULL,
  `tier` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Seed Data for `cities` (Default Assignment 12 Cities)
-- --------------------------------------------------------
INSERT INTO `cities` (`city_code`, `city_name`, `temp`, `status`) VALUES
('1248991', 'Colombo', 33.0, 'Clouds'),
('1850147', 'Tokyo', 8.6, 'Clear'),
('2644210', 'Liverpool', 16.5, 'Rain'),
('2988507', 'Paris', 22.4, 'Clear'),
('2147714', 'Sydney', 27.3, 'Rain'),
('4930956', 'Boston', 4.2, 'Mist'),
('1796236', 'Shanghai', 10.1, 'Clouds'),
('3143244', 'Oslo', -3.9, 'Clear'),
('2643743', 'London', 15.2, 'Drizzle'),
('5128581', 'New York', 18.0, 'Clouds'),
('2172797', 'Cairns', 26.0, 'Clear'),
('1880252', 'Singapore', 30.5, 'Thunderstorm')
ON DUPLICATE KEY UPDATE `city_name` = VALUES(`city_name`), `temp` = VALUES(`temp`), `status` = VALUES(`status`);
