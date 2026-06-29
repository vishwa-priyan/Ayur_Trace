-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

-- Create Batches Table (Collection Event)
CREATE TABLE IF NOT EXISTS batches (
  batch_id VARCHAR(50) PRIMARY KEY,
  herb_name VARCHAR(255) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  harvest_date DATE NOT NULL,
  visual_quality VARCHAR(100) NOT NULL,
  pest_disease BOOLEAN DEFAULT FALSE,
  moisture_level DECIMAL(5, 2),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  address TEXT,
  collector_notes TEXT,
  farmer_id VARCHAR(50) REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'Collected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Quality Tests Table
CREATE TABLE IF NOT EXISTS quality_tests (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(50) REFERENCES batches(batch_id) ON DELETE CASCADE,
  test_type VARCHAR(100) NOT NULL,
  lab_name VARCHAR(255) NOT NULL DEFAULT 'AyurLab Certified Testing',
  test_date DATE NOT NULL,
  technician VARCHAR(100) NOT NULL,
  moisture_content VARCHAR(50),
  pesticide_result VARCHAR(50) DEFAULT 'not-detected',
  pesticide_level VARCHAR(50),
  dna_result VARCHAR(255),
  overall_compliance VARCHAR(50) DEFAULT 'Passed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Processing Steps Table
CREATE TABLE IF NOT EXISTS processing_steps (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(50) REFERENCES batches(batch_id) ON DELETE CASCADE,
  step_type VARCHAR(100) NOT NULL,
  facility_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  processed_by VARCHAR(100) NOT NULL,
  method VARCHAR(255),
  temperature VARCHAR(50),
  duration VARCHAR(50),
  output_weight DECIMAL(10, 2),
  output_unit VARCHAR(20) DEFAULT 'kg',
  storage_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(50) REFERENCES batches(batch_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
