-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 08, 2025 at 12:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `workzen`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `check_in_latitude` decimal(10,8) DEFAULT NULL,
  `check_in_longitude` decimal(11,8) DEFAULT NULL,
  `check_in_location` varchar(500) DEFAULT NULL,
  `check_out_latitude` decimal(10,8) DEFAULT NULL,
  `check_out_longitude` decimal(11,8) DEFAULT NULL,
  `check_out_location` varchar(500) DEFAULT NULL,
  `status` enum('Present','Absent','Half Day','Late') DEFAULT 'Present',
  `working_hours` decimal(4,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `check_in_latitude`, `check_in_longitude`, `check_in_location`, `check_out_latitude`, `check_out_longitude`, `check_out_location`, `status`, `working_hours`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-08', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(2, 2, '2025-11-08', '09:15:00', '18:15:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(3, 3, '2025-11-08', '09:05:00', '18:05:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 1', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 1', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(4, 4, '2025-11-08', '09:30:00', '18:30:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Late', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(5, 5, '2025-11-08', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(6, 6, '2025-11-08', '09:10:00', '18:10:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(7, 7, '2025-11-08', '08:55:00', '17:55:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(8, 8, '2025-11-08', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(9, 9, '2025-11-08', '09:20:00', '18:20:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Late', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(10, 10, '2025-11-08', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(11, 1, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(12, 2, '2025-11-07', '09:10:00', '18:10:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(13, 3, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 1', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 1', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(14, 4, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(15, 5, '2025-11-07', '09:05:00', '18:05:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(16, 6, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(17, 7, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(18, 8, '2025-11-07', '09:30:00', '18:30:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Late', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(19, 9, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(20, 10, '2025-11-07', '09:00:00', '18:00:00', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 19.07609000, 72.87742600, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'LOGIN', 'user', 1, '{\"timestamp\": \"2024-01-08 09:00:00\"}', '192.168.1.100', '2025-11-08 09:27:15'),
(2, 2, 'APPROVE_LEAVE', 'leave_request', 4, '{\"employee_id\": 5, \"days\": 6}', '192.168.1.101', '2025-11-08 09:27:15'),
(3, 3, 'PROCESS_PAYROLL', 'payroll', 1, '{\"month\": \"January\", \"employees\": 15}', '192.168.1.102', '2025-11-08 09:27:15'),
(4, 1, 'CREATE_EMPLOYEE', 'employee', 15, '{\"name\": \"Daniel Martinez\"}', '192.168.1.100', '2025-11-08 09:27:15'),
(5, 2, 'UPDATE_EMPLOYEE', 'employee', 5, '{\"field\": \"designation\", \"value\": \"Senior Developer\"}', '192.168.1.101', '2025-11-08 09:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `manager_id`, `budget`, `created_at`, `updated_at`) VALUES
(1, 'IT', 'Information Technology Department', NULL, NULL, '2025-11-08 09:20:27', '2025-11-08 09:20:27'),
(2, 'HR', 'Human Resources Department', NULL, NULL, '2025-11-08 09:20:27', '2025-11-08 09:20:27'),
(3, 'Finance', 'Finance and Accounting Department', NULL, NULL, '2025-11-08 09:20:27', '2025-11-08 09:20:27'),
(4, 'Sales', 'Sales and Marketing Department', NULL, NULL, '2025-11-08 09:20:27', '2025-11-08 09:20:27'),
(5, 'Operations', 'Operations Management Department', NULL, NULL, '2025-11-08 09:20:27', '2025-11-08 09:20:27');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_code` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `join_date` date NOT NULL,
  `basic_salary` decimal(10,2) DEFAULT 0.00,
  `allowances` decimal(10,2) DEFAULT 0.00,
  `profile_picture` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','terminated') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `emergency_contact` varchar(255) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `pan_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `employee_code`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `address`, `department`, `department_id`, `designation`, `join_date`, `basic_salary`, `allowances`, `profile_picture`, `status`, `created_at`, `updated_at`, `emergency_contact`, `emergency_phone`, `bank_name`, `account_number`, `ifsc_code`, `pan_number`) VALUES
(1, 1, 'EMP001', 'Admin', 'WorkZen', 'adminworkzen@gmail.com', '+91 9999999999', '1985-01-15', 'Male', NULL, 'IT', NULL, 'System Administrator', '2020-01-01', 100000.00, 25000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, 'EMP002', 'HR', 'Manager', 'hrworkzen@gmail.com', '+91 9999999998', '1988-03-20', 'Female', NULL, 'HR', NULL, 'HR Manager', '2020-06-15', 75000.00, 18000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 'EMP003', 'Payroll', 'Officer', 'payrollworkzen@gmail.com', '+91 9999999997', '1990-07-10', 'Male', NULL, 'Finance', NULL, 'Payroll Officer', '2021-01-10', 70000.00, 15000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 4, 'EMP004', 'John', 'Employee', 'employeeworkzen@gmail.com', '+91 9999999996', '1995-11-25', 'Male', NULL, 'IT', NULL, 'Junior Developer', '2023-01-15', 50000.00, 10000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 5, 'EMP005', 'John', 'Doe', 'john.doe@workzen.com', '+91 9876543210', '1990-05-15', 'Male', NULL, 'IT', NULL, 'Senior Developer', '2021-03-10', 80000.00, 20000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 6, 'EMP006', 'Jane', 'Smith', 'jane.smith@workzen.com', '+91 9876543211', '1992-08-20', 'Female', NULL, 'IT', NULL, 'Full Stack Developer', '2021-06-15', 75000.00, 18000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 7, 'EMP007', 'Mike', 'Johnson', 'mike.johnson@workzen.com', '+91 9876543212', '1988-12-05', 'Male', NULL, 'IT', NULL, 'DevOps Engineer', '2020-09-01', 85000.00, 21000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 8, 'EMP008', 'Sarah', 'Williams', 'sarah.williams@workzen.com', '+91 9876543213', '1991-04-18', 'Female', NULL, 'Finance', NULL, 'Accountant', '2021-02-20', 60000.00, 12000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 9, 'EMP009', 'Robert', 'Brown', 'robert.brown@workzen.com', '+91 9876543214', '1987-09-30', 'Male', NULL, 'Finance', NULL, 'Financial Analyst', '2020-11-05', 70000.00, 15000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 10, 'EMP010', 'Emily', 'Davis', 'emily.davis@workzen.com', '+91 9876543215', '1993-06-12', 'Female', NULL, 'Sales', NULL, 'Sales Manager', '2021-04-01', 65000.00, 15000.00, NULL, 'active', '2025-11-08 09:27:14', '2025-11-08 09:27:14', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `document_type` enum('resume','id_proof','address_proof','certificate','other') NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`id`, `employee_id`, `document_type`, `document_name`, `file_path`, `file_size`, `uploaded_by`, `is_verified`, `verified_by`, `verified_at`, `created_at`) VALUES
(1, 5, 'resume', 'John_Doe_Resume.pdf', '/documents/employees/5/resume.pdf', 245678, 2, 1, 2, NULL, '2025-11-08 09:27:15'),
(2, 5, 'id_proof', 'Aadhar_Card.pdf', '/documents/employees/5/aadhar.pdf', 156789, 2, 1, 2, NULL, '2025-11-08 09:27:15'),
(3, 6, 'resume', 'Jane_Smith_Resume.pdf', '/documents/employees/6/resume.pdf', 234567, 2, 1, 2, NULL, '2025-11-08 09:27:15'),
(4, 8, 'certificate', 'CA_Certificate.pdf', '/documents/employees/8/ca_cert.pdf', 345678, 2, 1, 2, NULL, '2025-11-08 09:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holidays`
--

INSERT INTO `holidays` (`id`, `name`, `date`, `description`, `is_mandatory`, `created_at`) VALUES
(1, 'New Year', '2024-01-01', 'New Year Day', 1, '2025-11-08 09:20:27'),
(2, 'Republic Day', '2024-01-26', 'Republic Day of India', 1, '2025-11-08 09:20:27'),
(3, 'Independence Day', '2024-08-15', 'Independence Day of India', 1, '2025-11-08 09:20:27'),
(4, 'Gandhi Jayanti', '2024-10-02', 'Birthday of Mahatma Gandhi', 1, '2025-11-08 09:20:27'),
(5, 'Diwali', '2024-11-01', 'Festival of Lights', 1, '2025-11-08 09:20:27'),
(6, 'Christmas', '2024-12-25', 'Christmas Day', 1, '2025-11-08 09:20:27');

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `requires_admin_approval` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `reason`, `attachment_path`, `attachment_name`, `status`, `requires_admin_approval`, `approved_by`, `approved_at`, `rejection_reason`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 4, 1, '2025-11-13', '2025-11-15', 3, 'Medical checkup appointment', '/uploads/leave-attachments/doctor_note_emp4.pdf', 'Doctor_Note_Medical_Checkup.pdf', 'Pending', 1, NULL, NULL, NULL, NULL, '2025-11-08 09:27:14', '2025-11-08 11:20:36'),
(2, 6, 2, '2025-11-18', '2025-11-19', 2, 'Family function', NULL, NULL, 'Pending', 0, NULL, NULL, NULL, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(3, 5, 3, '2025-10-29', '2025-11-03', 6, 'Annual vacation', NULL, NULL, 'Approved', 0, 2, NULL, NULL, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(4, 8, 2, '2025-10-24', '2025-10-25', 2, 'Personal work', NULL, NULL, 'Approved', 0, 2, NULL, NULL, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(5, 7, 2, '2025-11-03', '2025-11-05', 3, 'Personal reasons', NULL, NULL, 'Rejected', 0, 2, NULL, NULL, NULL, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(8, 5, 3, '2025-11-16', '2025-11-18', 3, 'actually i am in merraige that\'s why i willnot able to come so please manage ', NULL, NULL, 'Approved', 0, 3, '2025-11-08 09:45:33', NULL, NULL, '2025-11-08 09:43:52', '2025-11-08 09:45:33');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `days_allowed` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`, `days_allowed`, `description`, `created_at`) VALUES
(1, 'Sick Leave', 12, 'Medical leave for illness', '2025-11-08 09:20:27'),
(2, 'Casual Leave', 15, 'Personal or casual leave', '2025-11-08 09:20:27'),
(3, 'Annual Leave', 20, 'Annual paid vacation', '2025-11-08 09:20:27'),
(4, 'Maternity Leave', 90, 'Maternity leave for female employees', '2025-11-08 09:20:27'),
(5, 'Paternity Leave', 7, 'Paternity leave for male employees', '2025-11-08 09:20:27');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `email_sent` tinyint(1) DEFAULT 0,
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `email_sent`, `email_sent_at`, `action_url`, `created_at`) VALUES
(1, 1, 'System Update', 'New features have been added to the HRMS system', 'info', 0, 0, NULL, NULL, '2025-11-08 09:27:15'),
(2, 2, 'Leave Approval Pending', 'You have 3 leave requests waiting for approval', 'warning', 0, 0, NULL, NULL, '2025-11-08 09:27:15'),
(3, 3, 'Payroll Processing', 'Monthly payroll has been processed successfully', 'success', 1, 0, NULL, NULL, '2025-11-08 09:27:15'),
(4, 4, 'Welcome to WorkZen', 'Your account has been created successfully', 'success', 1, 0, NULL, NULL, '2025-11-08 09:27:15'),
(5, 2, 'New Employee Joined', 'Daniel Martinez has joined the HR department', 'info', 0, 0, NULL, NULL, '2025-11-08 09:27:15'),
(6, 1, 'New Leave Request', 'John Doe has applied for Annual Leave from 2025-11-16 to 2025-11-18 (3 days)', 'info', 0, 0, NULL, '/leave', '2025-11-08 09:43:52'),
(7, 2, 'New Leave Request', 'John Doe has applied for Annual Leave from 2025-11-16 to 2025-11-18 (3 days)', 'info', 0, 0, NULL, '/leave', '2025-11-08 09:43:52'),
(8, 3, 'New Leave Request', 'John Doe has applied for Annual Leave from 2025-11-16 to 2025-11-18 (3 days)', 'info', 0, 0, NULL, '/leave', '2025-11-08 09:43:52'),
(9, 5, 'Leave Request Approved', 'Your Annual Leave request from Sun Nov 16 2025 00:00:00 GMT+0530 (India Standard Time) to Tue Nov 18 2025 00:00:00 GMT+0530 (India Standard Time) has been approved.', 'success', 0, 0, NULL, '/leave', '2025-11-08 09:45:33');

-- --------------------------------------------------------

--
-- Table structure for table `password_change_requests`
--

CREATE TABLE `password_change_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_change_requests`
--

INSERT INTO `password_change_requests` (`id`, `employee_id`, `reason`, `status`, `approved_by`, `approved_at`, `created_at`) VALUES
(1, 4, 'Forgot password, need to reset', 'pending', NULL, NULL, '2025-11-08 09:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(10) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `payrun_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT 0.00,
  `bonus` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `penalty` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `gross_salary` decimal(10,2) NOT NULL,
  `net_salary` decimal(10,2) NOT NULL,
  `working_days` int(11) DEFAULT 0,
  `present_days` int(11) DEFAULT 0,
  `absent_days` int(11) DEFAULT 0,
  `leave_days` int(11) DEFAULT 0,
  `status` enum('Draft','Processed','Paid') DEFAULT 'Draft',
  `is_locked` tinyint(1) DEFAULT 0,
  `payslip_generated` tinyint(1) DEFAULT 0,
  `payslip_path` varchar(500) DEFAULT NULL,
  `payslip_sent_at` timestamp NULL DEFAULT NULL,
  `locked_at` timestamp NULL DEFAULT NULL,
  `locked_by` int(11) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `generated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `payrun_id`, `employee_id`, `month`, `year`, `basic_salary`, `allowances`, `bonus`, `deductions`, `penalty`, `notes`, `gross_salary`, `net_salary`, `working_days`, `present_days`, `absent_days`, `leave_days`, `status`, `is_locked`, `payslip_generated`, `payslip_path`, `payslip_sent_at`, `locked_at`, `locked_by`, `payment_date`, `generated_by`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 11, 2025, 100000.00, 25000.00, 0.00, 12500.00, 0.00, NULL, 125000.00, 112500.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(2, NULL, 2, 11, 2025, 75000.00, 18000.00, 0.00, 9300.00, 0.00, NULL, 93000.00, 83700.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(3, NULL, 3, 11, 2025, 70000.00, 15000.00, 0.00, 8500.00, 0.00, NULL, 85000.00, 76500.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(4, NULL, 4, 11, 2025, 50000.00, 10000.00, 0.00, 6000.00, 0.00, NULL, 60000.00, 54000.00, 22, 21, 1, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(5, NULL, 5, 11, 2025, 80000.00, 20000.00, 0.00, 10000.00, 0.00, NULL, 100000.00, 90000.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(6, NULL, 6, 11, 2025, 75000.00, 18000.00, 0.00, 9300.00, 0.00, NULL, 93000.00, 83700.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(7, NULL, 7, 11, 2025, 85000.00, 21000.00, 0.00, 10600.00, 0.00, NULL, 106000.00, 95400.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(8, NULL, 8, 11, 2025, 60000.00, 12000.00, 0.00, 7200.00, 0.00, NULL, 72000.00, 64800.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(9, NULL, 9, 11, 2025, 70000.00, 15000.00, 0.00, 8500.00, 0.00, NULL, 85000.00, 76500.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(10, NULL, 10, 11, 2025, 65000.00, 15000.00, 0.00, 8000.00, 0.00, NULL, 80000.00, 72000.00, 22, 22, 0, 0, 'Processed', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(11, 1, 4, 10, 2025, 52000.00, 12000.00, 0.00, 8600.00, 0.00, NULL, 64000.00, 55400.00, 22, 21, 1, 1, 'Draft', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-01 09:00:00', '2025-11-01 09:00:00'),
(12, 1, 5, 10, 2025, 85000.00, 25000.00, 0.00, 14750.00, 0.00, NULL, 110000.00, 95250.00, 22, 22, 0, 0, 'Draft', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-01 09:00:00', '2025-11-01 09:00:00'),
(13, 1, 6, 10, 2025, 78000.00, 18000.00, 0.00, 12840.00, 0.00, NULL, 96000.00, 83160.00, 22, 21, 1, 0, 'Draft', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-01 09:00:00', '2025-11-01 09:00:00'),
(14, 1, 7, 10, 2025, 88000.00, 22000.00, 0.00, 15400.00, 0.00, NULL, 110000.00, 94600.00, 22, 22, 0, 0, 'Draft', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-01 09:00:00', '2025-11-01 09:00:00'),
(15, 1, 8, 10, 2025, 61000.00, 13000.00, 0.00, 9620.00, 0.00, NULL, 74000.00, 64380.00, 22, 21, 1, 0, 'Draft', 0, 0, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-01 09:00:00', '2025-11-01 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `payruns`
--

CREATE TABLE `payruns` (
  `id` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `status` enum('Draft','Pending Approval','Approved','Locked','Rejected') DEFAULT 'Draft',
  `total_employees` int(11) DEFAULT 0,
  `total_gross_salary` decimal(12,2) DEFAULT 0.00,
  `total_deductions` decimal(12,2) DEFAULT 0.00,
  `total_net_salary` decimal(12,2) DEFAULT 0.00,
  `generated_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `review_period_start` date NOT NULL,
  `review_period_end` date NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `weaknesses` text DEFAULT NULL,
  `goals` text DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `status` enum('draft','submitted','acknowledged') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`id`, `employee_id`, `reviewer_id`, `review_period_start`, `review_period_end`, `rating`, `strengths`, `weaknesses`, `goals`, `comments`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 1, '2025-05-08', '2025-11-07', 4.50, 'Excellent technical skills, great team player', 'Needs improvement in time management', 'Lead a major project in Q2', NULL, 'submitted', '2025-11-08 09:27:15', '2025-11-08 09:27:15'),
(2, 6, 1, '2025-05-08', '2025-11-07', 4.20, 'Very creative and innovative', 'Communication with clients needs work', 'Improve client presentation skills', NULL, 'submitted', '2025-11-08 09:27:15', '2025-11-08 09:27:15'),
(3, 8, 3, '2025-05-08', '2025-11-07', 4.00, 'Detail-oriented and thorough', 'Can be slow in decision making', 'Speed up monthly closing process', NULL, 'submitted', '2025-11-08 09:27:15', '2025-11-08 09:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `profile_update_requests`
--

CREATE TABLE `profile_update_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `field_updates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`field_updates`)),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'company_name', 'WorkZen HRMS', 'Company name displayed in system', NULL, '2025-11-08 09:20:27'),
(2, 'working_hours_per_day', '8', 'Standard working hours per day', NULL, '2025-11-08 09:20:27'),
(3, 'working_days_per_month', '22', 'Standard working days per month', NULL, '2025-11-08 09:20:27'),
(4, 'late_arrival_threshold', '15', 'Minutes after which arrival is considered late', NULL, '2025-11-08 09:20:27'),
(5, 'max_leave_days_per_request', '30', 'Maximum consecutive leave days allowed', NULL, '2025-11-08 09:20:27'),
(6, 'probation_period_months', '3', 'Probation period in months for new employees', NULL, '2025-11-08 09:20:27'),
(7, 'notice_period_days', '30', 'Notice period in days for resignation', NULL, '2025-11-08 09:20:27'),
(8, 'overtime_multiplier', '1.5', 'Overtime pay multiplier', NULL, '2025-11-08 09:20:27'),
(9, 'tax_rate', '10', 'Default tax rate percentage', NULL, '2025-11-08 09:20:27'),
(10, 'allow_self_attendance', 'true', 'Allow employees to mark their own attendance', NULL, '2025-11-08 09:20:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','hr','employee','payroll_officer') DEFAULT 'employee',
  `is_active` tinyint(1) DEFAULT 1,
  `email_notifications_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `is_active`, `email_notifications_enabled`, `created_at`, `updated_at`) VALUES
(1, 'admin@workzen.com', '$2a$10$rOZxJZ5lE3xKZj3xKZjOu.K4xKZj3xKZj3xKZj3xKZj3xKZj3xKZi', 'admin', 1, 1, '2025-11-08 09:20:27', '2025-11-08 09:20:27'),
(2, 'adminworkzen@gmail.com', '$2a$10$9ETJJgnjSiostHgMQjAPheBi9ast.RTqkUe21tAx7folkvcs7RD1i', 'admin', 1, 1, '2025-11-08 09:27:13', '2025-11-08 09:27:13'),
(3, 'hrworkzen@gmail.com', '$2a$10$tnNOyvjsjtdDATDURRHwcODrAd/SsSb3y0iHPq9VpdD0xKYqr99Hu', 'hr', 1, 1, '2025-11-08 09:27:13', '2025-11-08 09:27:13'),
(4, 'payrollworkzen@gmail.com', '$2a$10$Lsucj50VqTPwk0eeKuL7TObLGC5Lp3Uwr8sFvFFudDve3/U5hl9Ly', 'payroll_officer', 1, 1, '2025-11-08 09:27:13', '2025-11-08 09:27:13'),
(5, 'employeeworkzen@gmail.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:13', '2025-11-08 09:27:13'),
(6, 'john.doe@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(7, 'jane.smith@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(8, 'mike.johnson@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(9, 'sarah.williams@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:14', '2025-11-08 09:27:14'),
(10, 'robert.brown@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', 1, 1, '2025-11-08 09:27:14', '2025-11-08 09:27:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  ADD KEY `idx_attendance_date` (`date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `fk_employee_department` (`department_id`),
  ADD KEY `idx_employee_status` (`status`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_leave_status` (`status`),
  ADD KEY `idx_leave_requires_admin` (`requires_admin_approval`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_notifications_email_sent` (`email_sent`);

--
-- Indexes for table `password_change_requests`
--
ALTER TABLE `password_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user` (`user_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_month_year` (`employee_id`,`month`,`year`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `idx_payroll_month_year` (`month`,`year`),
  ADD KEY `idx_payroll_payrun_id` (`payrun_id`),
  ADD KEY `idx_payroll_month_year_status` (`month`,`year`,`status`);

--
-- Indexes for table `payruns`
--
ALTER TABLE `payruns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_payrun_month_year` (`month`,`year`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_payrun_month_year` (`month`,`year`),
  ADD KEY `idx_payrun_status` (`status`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `profile_update_requests`
--
ALTER TABLE `profile_update_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `password_change_requests`
--
ALTER TABLE `password_change_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `payruns`
--
ALTER TABLE `payruns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `profile_update_requests`
--
ALTER TABLE `profile_update_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_employee_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `employee_documents_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  ADD CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_change_requests`
--
ALTER TABLE `password_change_requests`
  ADD CONSTRAINT `password_change_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `password_change_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `payruns`
--
ALTER TABLE `payruns`
  ADD CONSTRAINT `payruns_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `payruns_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `profile_update_requests`
--
ALTER TABLE `profile_update_requests`
  ADD CONSTRAINT `profile_update_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `profile_update_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
