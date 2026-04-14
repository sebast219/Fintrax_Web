import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToNeon() {
  console.log('=== MIGRACIÓN A NEON POSTGRESQL ===');
  
  try {
    // 1. Exportar datos actuales de Supabase
    console.log('1. Exportando datos de Supabase...');
    await prisma.$connect();
    
    // Obtener todos los datos
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const transactions = await prisma.transaction.findMany();
    const categories = await prisma.category.findMany();
    
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Cuentas: ${accounts.length}`);
    console.log(`- Transacciones: ${transactions.length}`);
    console.log(`- Categorías: ${categories.length}`);
    
    // 2. Guardar datos en archivo JSON
    const exportData = {
      users,
      accounts,
      transactions,
      categories,
      exportDate: new Date().toISOString()
    };
    
    console.log('2. Datos para exportar:', JSON.stringify(exportData, null, 2));
    console.log('2. Copia estos datos para importarlos manualmente');
    
    // 3. Instrucciones para Neon
    console.log('\n=== INSTRUCCIONES PARA NEON ===');
    console.log('1. Crea cuenta en https://neon.tech');
    console.log('2. Crea nuevo proyecto PostgreSQL');
    console.log('3. Copia la connection string');
    console.log('4. Actualiza tu .env con la nueva URL');
    console.log('5. Ejecuta: npm run db:migrate');
    console.log('6. Importa los datos con: npm run db:import-neon');
    
    await prisma.$disconnect();
    console.log('\n¡Listo para migrar a Neon!');
    
  } catch (error) {
    console.error('Error en migración:', error);
  }
}

migrateToNeon();
