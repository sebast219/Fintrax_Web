import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // No creamos usuarios por defecto, cada usuario debe registrarse
  // Pero podemos crear categorías globales (sin userId) que todos los usuarios vean
  
  const globalCategories = [
    // Gastos globales
    { name: 'Alimentación', type: 'EXPENSE' as const, icon: 'utensils', color: '#EF4444', isDefault: true, sortOrder: 1 },
    { name: 'Transporte', type: 'EXPENSE' as const, icon: 'car', color: '#F59E0B', isDefault: true, sortOrder: 2 },
    { name: 'Vivienda', type: 'EXPENSE' as const, icon: 'home', color: '#8B5CF6', isDefault: true, sortOrder: 3 },
    { name: 'Entretenimiento', type: 'EXPENSE' as const, icon: 'gamepad', color: '#EC4899', isDefault: true, sortOrder: 4 },
    { name: 'Salud', type: 'EXPENSE' as const, icon: 'heart-pulse', color: '#14B8A6', isDefault: true, sortOrder: 5 },
    { name: 'Educación', type: 'EXPENSE' as const, icon: 'graduation-cap', color: '#6366F1', isDefault: true, sortOrder: 6 },
    { name: 'Servicios', type: 'EXPENSE' as const, icon: 'zap', color: '#0EA5E9', isDefault: true, sortOrder: 7 },
    { name: 'Otros gastos', type: 'EXPENSE' as const, icon: 'more-horizontal', color: '#6B7280', isDefault: true, sortOrder: 8 },
    // Ingresos globales
    { name: 'Salario', type: 'INCOME' as const, icon: 'briefcase', color: '#10B981', isDefault: true, sortOrder: 1 },
    { name: 'Freelance', type: 'INCOME' as const, icon: 'laptop', color: '#3B82F6', isDefault: true, sortOrder: 2 },
    { name: 'Inversiones', type: 'INCOME' as const, icon: 'trending-up', color: '#8B5CF6', isDefault: true, sortOrder: 3 },
    { name: 'Otros ingresos', type: 'INCOME' as const, icon: 'plus-circle', color: '#6B7280', isDefault: true, sortOrder: 4 },
  ];

  for (const cat of globalCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: null,
        name: cat.name,
        type: cat.type
      }
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...cat,
          userId: null,
        },
      });
    }
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
