-- Attendance scheduling enhancements (2025-11-09)
-- Adds shift tracking and night shift request workflow support.

ALTER TABLE `attendance`
  ADD COLUMN `shift_type` ENUM('day','night') NOT NULL DEFAULT 'day' AFTER `status`,
  ADD COLUMN `scheduled_check_out` DATETIME DEFAULT NULL AFTER `shift_type`,
  ADD COLUMN `auto_checkout` TINYINT(1) NOT NULL DEFAULT 0 AFTER `scheduled_check_out`,
  ADD COLUMN `auto_checkout_at` DATETIME DEFAULT NULL AFTER `auto_checkout`;

CREATE TABLE IF NOT EXISTS `night_shift_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_id` INT(11) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `approved_by` INT(11) DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_night_shift_employee` (`employee_id`),
  KEY `idx_night_shift_status` (`status`),
  CONSTRAINT `fk_night_shift_employee`
    FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
