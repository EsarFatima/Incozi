-- Migration: Make service_id nullable in documents table
-- Date: 2026-01-25

ALTER TABLE documents ALTER COLUMN service_id DROP NOT NULL;
