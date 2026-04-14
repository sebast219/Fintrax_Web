import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    // Test tables exist
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('📋 Available tables:', (tables as any[]).map((t: any) => t.table_name));
    
    await prisma.$disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

testConnection();
