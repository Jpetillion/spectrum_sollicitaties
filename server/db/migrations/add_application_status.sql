-- Migration: Add status column to applications table
-- Date: 2026-01-22
-- Purpose: Add application status tracking (in_behandeling, aanvaard, geweigerd)

-- Add status column with default value
ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'in_behandeling' CHECK(status IN ('in_behandeling', 'aanvaard', 'geweigerd'));

-- Set existing applications to 'in_behandeling' status
UPDATE applications SET status = 'in_behandeling' WHERE status IS NULL;
