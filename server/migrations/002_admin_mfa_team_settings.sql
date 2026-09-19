-- Adds admin 2FA (TOTP), team member management, and configurable payment/fee settings.

ALTER TABLE users
  ADD COLUMN mfa_secret VARCHAR(64) NULL,
  ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1,
  MODIFY COLUMN role ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer';

CREATE TABLE IF NOT EXISTS settings (
  `key_name` VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
