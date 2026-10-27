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
  photo_url VARCHAR(255),
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
  certificate_url VARCHAR(255),
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

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Consumer Scans Table
CREATE TABLE IF NOT EXISTS consumer_scans (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(50) REFERENCES batches(batch_id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255)
);

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  row_data jsonb;
  rec_id text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    row_data := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'DELETE' THEN
    row_data := row_to_json(OLD)::jsonb;
  END IF;

  IF TG_TABLE_NAME = 'batches' THEN
    rec_id := row_data->>'batch_id';
  ELSE
    rec_id := row_data->>'id';
  END IF;

  INSERT INTO audit_logs (table_name, record_id, action, new_data)
  VALUES (TG_TABLE_NAME, rec_id, TG_OP, row_data);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for Audit Logs
DROP TRIGGER IF EXISTS audit_batches_trigger ON batches;
CREATE TRIGGER audit_batches_trigger
AFTER INSERT OR UPDATE OR DELETE ON batches
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_quality_tests_trigger ON quality_tests;
CREATE TRIGGER audit_quality_tests_trigger
AFTER INSERT OR UPDATE OR DELETE ON quality_tests
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_processing_steps_trigger ON processing_steps;
CREATE TRIGGER audit_processing_steps_trigger
AFTER INSERT OR UPDATE OR DELETE ON processing_steps
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
