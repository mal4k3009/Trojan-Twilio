// Database Connection Test
// Run this in the browser console to test database connectivity and permissions

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Read access
    console.log('📖 Testing read access...');
    const { data: readData, error: readError } = await supabase
      .from('ConversationalMemory')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read access working:', readData);
    }
    
    // Test 2: Insert access
    console.log('📝 Testing insert access...');
    const testMessage = {
      sender: '+15558675309',
      recipient: '+919313061975',
      'sender message': 'Test message from frontend - ' + new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('ConversationalMemory')
      .insert([testMessage])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
    } else {
      console.log('✅ Insert access working:', insertData);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Instructions for use:
// 1. Open browser console (F12)
// 2. Go to the application at localhost:5174
// 3. Copy and paste this entire function
// 4. Run: testDatabaseConnection()

console.log('📋 Database test function loaded. Run testDatabaseConnection() to test.');
