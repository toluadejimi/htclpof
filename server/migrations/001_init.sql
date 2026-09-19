-- Highlight Consulting Proof of Funds portal schema (MySQL/MariaDB)
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Atomic counter used to generate sequential application reference numbers.
CREATE TABLE IF NOT EXISTS counters (
  name VARCHAR(50) PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;
INSERT IGNORE INTO counters (name, value) VALUES ('application_ref', 0);

CREATE TABLE IF NOT EXISTS applications (
  id CHAR(36) PRIMARY KEY,
  reference VARCHAR(30) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  nationality VARCHAR(100),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  purpose VARCHAR(100) NOT NULL,
  destination VARCHAR(255),
  intended_use TEXT,
  status ENUM('submitted', 'under_review', 'needs_information', 'processing', 'approved', 'rejected', 'completed')
    NOT NULL DEFAULT 'submitted',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS application_events (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  application_id CHAR(36) NOT NULL,
  doc_type VARCHAR(50) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INT,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_application_events_application_id ON application_events(application_id);
