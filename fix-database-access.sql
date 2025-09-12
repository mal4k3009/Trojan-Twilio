-- Fix RLS for both tables in your Supabase database
-- Run this in your Supabase SQL Editor

-- Disable RLS for ConversationalMemory table
ALTER TABLE "ConversationalMemory" DISABLE ROW LEVEL SECURITY;

-- Disable RLS for n8n_chat_histories table (if it exists)
ALTER TABLE "n8n_chat_histories" DISABLE ROW LEVEL SECURITY;

-- Verify the fix by checking data access
SELECT 'ConversationalMemory records:' as info, COUNT(*) as count FROM "ConversationalMemory"
UNION ALL
SELECT 'n8n_chat_histories records:' as info, COUNT(*) as count FROM "n8n_chat_histories";

-- Show sample data to confirm access
SELECT 'Sample ConversationalMemory data:' as info;
SELECT id, sender, recipient, message, created_at FROM "ConversationalMemory" LIMIT 3;

SELECT 'Sample n8n_chat_histories data:' as info;
SELECT id, session_id FROM "n8n_chat_histories" LIMIT 3;
