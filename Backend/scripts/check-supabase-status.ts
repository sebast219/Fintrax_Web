import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSupabaseStatus() {
  console.log('🔍 Verificando estado de conexión con Supabase...');
  
  try {
    // Intentar conexión básica
    await prisma.$connect();
    console.log('✅ Conexión establecida con Supabase');
    
    // Verificar si podemos hacer una consulta simple
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Versión de PostgreSQL:', result);
    
    // Contar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 Tablas disponibles:', (tables as any[]).map((t: any) => t.table_name));
    
    await prisma.$disconnect();
    console.log('✅ Verificación completada exitosamente');
    
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    
    // Sugerencias basadas en el error
    if (error.message.includes('P1001')) {
      console.log('\n🔧 Sugerencias para P1001:');
      console.log('1. Verifica que el proyecto esté activo en Supabase');
      console.log('2. Revisa la contraseña del proyecto');
      console.log('3. Intenta con VPN o diferente red');
      console.log('4. Verifica firewall/antivirus');
    }
    
    if (error.message.includes('P1000')) {
      console.log('\n🔧 Sugerencias para P1000:');
      console.log('1. La contraseña es incorrecta');
      console.log('2. El usuario no es "postgres"');
      console.log('3. La base de datos no existe');
    }
  }
}

checkSupabaseStatus();
