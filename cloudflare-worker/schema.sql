-- D365 Widget Analytics Database Schema for Cloudflare D1
-- Creates a simple, scalable structure for tracking widget usage

-- Main events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,           -- 'load', 'chat', 'call'
  domain TEXT NOT NULL,          -- Website domain where event occurred
  source TEXT,                   -- 'live.html', 'widget-core', etc.
  timestamp TEXT NOT NULL        -- ISO 8601 timestamp
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_domain ON events(domain);
CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_type_domain ON events(type, domain);

-- Insert sample data (optional - remove if you don't want test data)
-- INSERT INTO events (type, domain, source, timestamp) VALUES 
-- ('load', 'example.com', 'widget-core', '2025-12-19T12:00:00.000Z'),
-- ('chat', 'example.com', 'widget-core', '2025-12-19T12:01:00.000Z');
