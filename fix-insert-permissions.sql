-- Additional RLS policies for INSERT operations
-- Run this in your Supabase SQL Editor if you're getting permission errors

-- Enable INSERT access for ConversationalMemory table (note the exact case)
CREATE POLICY "Enable insert access for all users" ON "ConversationalMemory"
FOR INSERT WITH CHECK (true);

-- Alternative: Enable all operations for testing
CREATE POLICY "Enable all access for all users" ON "ConversationalMemory"
FOR ALL USING (true) WITH CHECK (true);

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'ConversationalMemory';

-- Verify table structure and exact name
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name ILIKE '%conversation%'
ORDER BY table_name, ordinal_position;
