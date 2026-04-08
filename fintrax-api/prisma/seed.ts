import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // No creamos usuarios por defecto, cada usuario debe registrarse
  // Pero podemos crear categorías globales (sin userId) que todos los usuarios vean
  
  const globalCategories = [
    // Gastos globales
    { name: 'Alimentación', type: 'EXPENSE', icon: 'utensils', color: '#EF4444', isDefault: true, sortOrder: 1 },
    { name: 'Transporte', type: 'EXPENSE', icon: 'car', color: '#F59E0B', isDefault: true, sortOrder: 2 },
    { name: 'Vivienda', type: 'EXPENSE', icon: 'home', color: '#8B5CF6', isDefault: true, sortOrder: 3 },
    { name: 'Entretenimiento', type: 'EXPENSE', icon: 'gamepad', color: '#EC4899', isDefault: true, sortOrder: 4 },
    { name: 'Salud', type: 'EXPENSE', icon: 'heart-pulse', color: '#14B8A6', isDefault: true, sortOrder: 5 },
    { name: 'Educación', type: 'EXPENSE', icon: 'graduation-cap', color: '#6366F1', isDefault: true, sortOrder: 6 },
    { name: 'Servicios', type: 'EXPENSE', icon: 'zap', color: '#0EA5E9', isDefault: true, sortOrder: 7 },
    { name: 'Otros gastos', type: 'EXPENSE', icon: 'more-horizontal', color: '#6B7280', isDefault: true, sortOrder: 8 },
    // Ingresos globales
    { name: 'Salario', type: 'INCOME', icon: 'briefcase', color: '#10B981', isDefault: true, sortOrder: 1 },
    { name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#3B82F6', isDefault: true, sortOrder: 2 },
    { name: 'Inversiones', type: 'INCOME', icon: 'trending-up', color: '#8B5CF6', isDefault: true, sortOrder: 3 },
    { name: 'Otros ingresos', type: 'INCOME', icon: 'plus-circle', color: '#6B7280', isDefault: true, sortOrder: 4 },
  ];

  for (const cat of globalCategories) {
    await prisma.category.upsert({
      where: { 
        userId_name_type: { 
          userId: null, 
          name: cat.name, 
          type: cat.type 
        } 
      },
      update: {},
      create: {
        ...cat,
        userId: null,
      },
    });
  }

  console.log('✅ Global categories created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
