-- Check what tables exist in your Supabase database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check the structure of ConversationMemory table if it exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ConversationMemory' 
AND table_schema = 'public';

-- Check if there's any data in ConversationMemory
SELECT COUNT(*) as record_count FROM "ConversationMemory";

-- Show first 5 records if they exist
SELECT * FROM "ConversationMemory" LIMIT 5;
