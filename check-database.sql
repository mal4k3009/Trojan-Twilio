-- Check what tables exist in your Supabase database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check the structure of ConversationalMemory table if it exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ConversationalMemory' 
AND table_schema = 'public';

-- Check if there's any data in ConversationalMemory
SELECT COUNT(*) as record_count FROM "ConversationalMemory";

-- Show first 5 records if they exist
SELECT * FROM "ConversationalMemory" LIMIT 5;
