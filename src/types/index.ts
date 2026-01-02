// Type definitions for Cloudflare D1 Database

export type Bindings = {
  DB: D1Database;
}

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  picture: string | null;
  user_color: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  item_name: string;
  expiry_date: string | null;
  storage_location: 'main_fridge' | 'main_freezer' | 'sub_freezer';
  quantity: number;
  initial_quantity: number;
  consumed_quantity: number;
  memo: string | null;
  registered_by: number;
  status: 'active' | 'consumed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface ItemWithUser extends Item {
  user_name: string;
  user_color: string;
  days_until_expiry: number | null;
}

export interface UserSettings {
  id: number;
  user_id: number;
  email_notifications_enabled: boolean;
  notification_time: string;
  notification_days_threshold: number;
}

export interface EmailNotification {
  id: number;
  user_id: number;
  notification_type: 'daily_summary' | 'expiry_alert';
  sent_at: string;
  items_count: number;
  status: 'sent' | 'failed';
}

export interface SessionData {
  user_id: number;
  email: string;
  name: string;
  picture: string | null;
}
