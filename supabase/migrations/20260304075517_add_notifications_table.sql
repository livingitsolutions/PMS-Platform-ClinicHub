/*
  # Add notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key to clinics)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - notification type (appointment_created, payment_received, visit_completed)
      - `message` (text) - notification message
      - `read` (boolean) - whether notification has been read
      - `metadata` (jsonb) - additional context data (appointment_id, payment_id, etc.)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications (mark as read)
    - Add policy for service role to create notifications

  3. Indexes
    - Index on user_id for fast user notification lookups
    - Index on clinic_id for clinic-wide queries
    - Index on read status for filtering unread notifications
    - Index on created_at for sorting by date

  4. Notes
    - Notifications are user-specific and can be triggered by system events
    - The metadata field stores additional context like related entity IDs
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id ON notifications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
