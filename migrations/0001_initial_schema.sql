-- Users table for Google OAuth authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  user_color TEXT NOT NULL DEFAULT '#3B82F6', -- Identifier color for UI
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Items table for refrigerator/freezer inventory
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  expiry_date DATE, -- NULL means no expiry date
  storage_location TEXT NOT NULL CHECK(storage_location IN ('main_fridge', 'main_freezer', 'sub_freezer')),
  quantity INTEGER NOT NULL DEFAULT 1,
  initial_quantity INTEGER NOT NULL DEFAULT 1, -- Track original quantity
  consumed_quantity INTEGER NOT NULL DEFAULT 0, -- Track consumed amount
  memo TEXT,
  registered_by INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'consumed', 'expired')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id)
);

-- Email notifications log table
CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL, -- 'daily_summary', 'expiry_alert'
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  items_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent', 'failed')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT 1,
  notification_time TEXT NOT NULL DEFAULT '07:00', -- Format: HH:MM
  notification_days_threshold INTEGER NOT NULL DEFAULT 3, -- Alert when X days before expiry
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_storage ON items(storage_location);
CREATE INDEX IF NOT EXISTS idx_items_registered_by ON items(registered_by);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
