-- Test users for development
INSERT OR IGNORE INTO users (google_id, email, name, picture, user_color) VALUES 
  ('test-google-id-1', 'dave@example.com', 'Dave', 'https://via.placeholder.com/150', '#3B82F6'),
  ('test-google-id-2', 'minako@example.com', 'Minako', 'https://via.placeholder.com/150', '#EC4899');

-- User settings for test users
INSERT OR IGNORE INTO user_settings (user_id, email_notifications_enabled, notification_time, notification_days_threshold) VALUES 
  (1, 1, '07:00', 3),
  (2, 1, '07:00', 3);

-- Sample items for testing
INSERT OR IGNORE INTO items (item_name, expiry_date, storage_location, quantity, initial_quantity, memo, registered_by, status) VALUES 
  ('牛乳', date('now', '+2 days'), 'main_fridge', 1, 1, '開封済み', 1, 'active'),
  ('卵', date('now', '+5 days'), 'main_fridge', 10, 10, '', 1, 'active'),
  ('鶏肉', date('now', '+1 day'), 'main_fridge', 2, 2, '今日の夕食用', 2, 'active'),
  ('冷凍餃子', date('now', '+60 days'), 'main_freezer', 1, 1, '', 2, 'active'),
  ('アイスクリーム', NULL, 'sub_freezer', 3, 3, '期限なし', 1, 'active'),
  ('ヨーグルト', date('now', '-1 day'), 'main_fridge', 1, 1, '期限切れ', 1, 'active'),
  ('納豆', date('now'), 'main_fridge', 3, 4, '1パック消費済み', 2, 'active');
