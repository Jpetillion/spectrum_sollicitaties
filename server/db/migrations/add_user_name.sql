-- Migration: Add name column to users table
-- Date: 2026-02-05
-- Description: Add name field to support user profile management

-- Add name column (nullable initially to support existing users)
ALTER TABLE users ADD COLUMN name TEXT;

-- Update existing users with default names based on their email
-- Admins will need to update these via the UI
UPDATE users SET name = 'Admin' WHERE role = 'admin' AND name IS NULL;
UPDATE users SET name = 'Directie' WHERE role = 'directie' AND name IS NULL;
UPDATE users SET name = 'Staf' WHERE role = 'staf' AND name IS NULL;
