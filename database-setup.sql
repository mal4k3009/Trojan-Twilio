-- WhatsApp Business Portal - Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create ConversationMemory table
CREATE TABLE IF NOT EXISTS ConversationMemory (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL
);

-- 2. Create n8n_chat_histories table (optional, for advanced features)
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  message JSONB NOT NULL
);

-- 3. Enable Row Level Security (recommended for production)
ALTER TABLE ConversationMemory ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for read access
-- Note: Adjust these policies based on your security requirements
CREATE POLICY "Enable read access for all users" ON ConversationMemory
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON n8n_chat_histories
FOR SELECT USING (true);

-- 5. Insert sample data for testing
INSERT INTO ConversationMemory (message, recipient, sender) VALUES
('Hello, I need help with my order', 'business_number', '+91 98765 43210'),
('Hi! I''d be happy to help you with your order. Can you please provide your order number?', '+91 98765 43210', 'business_number'),
('My order number is #12345', 'business_number', '+91 98765 43210'),
('Thank you! I can see your order. It''s currently being processed and will be shipped within 2-3 business days.', '+91 98765 43210', 'business_number'),
('Great! When will I receive the tracking number?', 'business_number', '+91 98765 43210'),
('You''ll receive the tracking number via email and SMS within 24 hours of shipment.', '+91 98765 43210', 'business_number'),

('Hi, I want to return my recent purchase', 'business_number', '+91 87654 32109'),
('I''m sorry to hear you want to return your purchase. Can you please tell me what''s wrong with the product?', '+91 87654 32109', 'business_number'),
('The size doesn''t fit properly', 'business_number', '+91 87654 32109'),
('I understand. Our return policy allows returns within 30 days. I''ll send you a return label shortly.', '+91 87654 32109', 'business_number'),

('What are your store hours?', 'business_number', '+91 76543 21098'),
('Our store is open Monday to Saturday from 9 AM to 8 PM, and Sunday from 11 AM to 6 PM.', '+91 76543 21098', 'business_number'),
('Are you open on holidays?', 'business_number', '+91 76543 21098'),
('We''re closed on major holidays. You can check our holiday schedule on our website or call us.', '+91 76543 21098', 'business_number'),

('I forgot my password for the online account', 'business_number', '+91 65432 10987'),
('No problem! I can help you reset your password. Please visit our website and click on "Forgot Password" or I can send you a reset link.', '+91 65432 10987', 'business_number'),
('Please send me the reset link', 'business_number', '+91 65432 10987'),
('I''ve sent a password reset link to your registered email address. Please check your inbox and spam folder.', '+91 65432 10987', 'business_number'),

('Do you have this product in blue color?', 'business_number', '+91 54321 09876'),
('Let me check our inventory for you. Which product are you looking for?', '+91 54321 09876', 'business_number'),
('The wireless headphones model WH-1000XM4', 'business_number', '+91 54321 09876'),
('Yes, we have the WH-1000XM4 in blue color in stock. Would you like me to reserve one for you?', '+91 54321 09876', 'business_number'),
('Yes, please reserve it. I''ll come to pick it up tomorrow', 'business_number', '+91 54321 09876'),
('Perfect! I''ve reserved the blue WH-1000XM4 for you. Please bring a valid ID when you come to collect it.', '+91 54321 09876', 'business_number');

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_memory_sender ON ConversationMemory(sender);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_recipient ON ConversationMemory(recipient);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_created_at ON ConversationMemory(created_at);

-- 7. Verify the setup
SELECT COUNT(*) as total_messages FROM ConversationMemory;
SELECT DISTINCT sender as unique_senders FROM ConversationMemory WHERE sender != 'business_number';
SELECT COUNT(DISTINCT sender) as unique_customers FROM ConversationMemory WHERE sender != 'business_number';

-- Success message
SELECT 'Database setup completed successfully! 🎉' as status;
