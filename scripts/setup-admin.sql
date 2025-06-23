-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR
);

-- Add marc@cyrator.com as admin
INSERT INTO admin_users (user_email, created_by) 
VALUES ('marc@cyrator.com', 'initial_setup')
ON CONFLICT (user_email) DO NOTHING;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_email = $1
  );
END;
$$ LANGUAGE plpgsql;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(user_email);