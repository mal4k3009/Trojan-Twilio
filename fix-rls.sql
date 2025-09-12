-- Fix Row Level Security (RLS) for ConversationMemory table
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS completely (simplest solution)
ALTER TABLE "ConversationMemory" DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create a policy for read access
-- (Uncomment the lines below if you prefer to keep RLS enabled)

-- CREATE POLICY "Enable read access for all users" ON "ConversationMemory"
-- FOR SELECT USING (true);

-- Option 3: Enable read access for authenticated and anonymous users
-- (Uncomment if you want more granular control)

-- CREATE POLICY "Enable read for anon users" ON "ConversationMemory"
-- FOR SELECT TO anon USING (true);

-- CREATE POLICY "Enable read for authenticated users" ON "ConversationMemory"
-- FOR SELECT TO authenticated USING (true);

-- Check if the fix worked by selecting data
SELECT COUNT(*) as total_records FROM "ConversationMemory";
SELECT * FROM "ConversationMemory" LIMIT 5;
