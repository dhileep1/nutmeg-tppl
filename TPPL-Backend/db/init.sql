
-- Database Schema for NutMeg Time Pulse

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Create Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  hours_worked DECIMAL(5, 2) NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  description TEXT,
  status VARCHAR(20) DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Create Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(30) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Create Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_hours DECIMAL(8, 2) NOT NULL,
  gross_pay DECIMAL(10, 2) NOT NULL,
  taxes DECIMAL(10, 2) NOT NULL,
  net_pay DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert demo data for testing
-- Admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role, hourly_rate)
VALUES ('admin', 'admin@nutmeg.com', '$2b$10$vGHWxvVWz8aIH4C.pGbBc.qyQqZjYvcTXuR1TYgTBsaKvJ7y9yjU2', 'Admin User', 'admin', 50.00);

-- Employee user (password: employee123)
INSERT INTO users (username, email, password, full_name, role, hourly_rate)
VALUES ('employee', 'employee@nutmeg.com', '$2b$10$XOo9h9vWoJNWpYR6Y5y5tuJUHhh6sSbxB3X3yJTuH1orOEfDZEAnm', 'Employee User', 'employee', 25.00);

-- Sample projects
INSERT INTO projects (name, description, start_date, end_date, status)
VALUES ('Website Redesign', 'Complete overhaul of company website', '2023-01-01', '2023-12-31', 'active');

INSERT INTO projects (name, description, start_date, end_date, status)
VALUES ('Mobile App Development', 'Creating a new mobile app for customers', '2023-02-15', '2023-11-30', 'active');
