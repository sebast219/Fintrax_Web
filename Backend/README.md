# Fintrax API

Backend API para Fintrax - Aplicación de gestión financiera personal.

## Tecnologías

- **Framework:** NestJS 11
- **Base de datos:** PostgreSQL 16
- **ORM:** Prisma 6
- **Autenticación:** JWT + Passport
- **Documentación:** Swagger/OpenAPI
- **Validación:** class-validator + class-transformer

## Requisitos

- Node.js 20+
- Docker & Docker Compose (para PostgreSQL)
- npm

## Estructura del Proyecto

```
fintrax-api/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── migrations/            # Migraciones de Prisma
│   └── seed.ts                # Datos iniciales
├── src/
│   ├── common/                # Código compartido
│   │   ├── decorators/        # Decoradores custom
│   │   ├── dto/               # DTOs base
│   │   ├── guards/            # Guards de autenticación
│   │   ├── interceptors/      # Interceptores
│   │   └── filters/           # Filtros de excepciones
│   ├── modules/               # Módulos de features
│   │   ├── auth/              # Autenticación
│   │   ├── users/             # Usuarios
│   │   ├── accounts/          # Cuentas
│   │   ├── cards/             # Tarjetas
│   │   ├── categories/        # Categorías
│   │   ├── transactions/      # Transacciones
│   │   ├── budgets/           # Presupuestos
│   │   ├── goals/             # Metas
│   │   ├── dashboard/         # Dashboard/KPIs
│   │   ├── reports/           # Reportes
│   │   └── recurring/         # Transacciones recurrentes
│   ├── prisma/                # Prisma service
│   ├── app.module.ts          # Módulo raíz
│   └── main.ts                # Bootstrap
└── docker-compose.yml         # PostgreSQL local
```

## Instalación y Configuración

### 1. Instalar dependencias

```bash
cd fintrax-api
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
DATABASE_URL="postgresql://fintrax_user:fintrax_password@localhost:5432/fintrax_db?schema=public"
JWT_SECRET="tu-super-secret-key"
FRONTEND_URL="http://localhost:4200"
```

### 3. Iniciar PostgreSQL

```bash
docker-compose up -d
```

### 4. Generar Prisma Client y ejecutar migraciones

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. (Opcional) Sembrar datos iniciales

```bash
npm run db:seed
```

### 6. Iniciar servidor de desarrollo

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

La documentación Swagger estará en `http://localhost:3000/api/docs`

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor de desarrollo con watch |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Iniciar en modo producción |
| `npm run db:migrate` | Crear/APLicar migraciones |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:seed` | Ejecutar seed |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run test` | Ejecutar tests |
| `npm run lint` | Ejecutar ESLint |

## Endpoints de la API

### Autenticación
- `POST /api/v1/auth/signup` - Registro
- `POST /api/v1/auth/signin` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Perfil del usuario autenticado

### Usuarios
- `GET /api/v1/users/profile` - Obtener perfil
- `PUT /api/v1/users/profile` - Actualizar perfil
- `GET /api/v1/users/stats` - Estadísticas del usuario

### Cuentas
- `GET /api/v1/accounts` - Listar cuentas
- `POST /api/v1/accounts` - Crear cuenta
- `GET /api/v1/accounts/:id` - Ver cuenta
- `PUT /api/v1/accounts/:id` - Actualizar cuenta
- `DELETE /api/v1/accounts/:id` - Eliminar cuenta
- `GET /api/v1/accounts/:id/balance` - Balance de cuenta

### Tarjetas
- `GET /api/v1/cards` - Listar tarjetas
- `POST /api/v1/cards` - Crear tarjeta
- `GET /api/v1/cards/:id` - Ver tarjeta
- `PUT /api/v1/cards/:id` - Actualizar tarjeta
- `DELETE /api/v1/cards/:id` - Eliminar tarjeta
- `GET /api/v1/cards/:id/stats` - Estadísticas de tarjeta

### Categorías
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría
- `GET /api/v1/categories/:id` - Ver categoría
- `PUT /api/v1/categories/:id` - Actualizar categoría
- `DELETE /api/v1/categories/:id` - Eliminar categoría

### Transacciones
- `GET /api/v1/transactions` - Listar/Buscar transacciones
- `POST /api/v1/transactions` - Crear transacción
- `GET /api/v1/transactions/:id` - Ver transacción
- `PUT /api/v1/transactions/:id` - Actualizar transacción
- `DELETE /api/v1/transactions/:id` - Eliminar transacción

### Dashboard
- `GET /api/v1/dashboard/summary` - Resumen del dashboard
- `GET /api/v1/dashboard/trends` - Tendencias mensuales

### Presupuestos
- `GET /api/v1/budgets` - Listar presupuestos
- `POST /api/v1/budgets` - Crear presupuesto
- `GET /api/v1/budgets/:id/progress` - Progreso del presupuesto
- `DELETE /api/v1/budgets/:id` - Eliminar presupuesto

### Metas
- `GET /api/v1/goals` - Listar metas
- `POST /api/v1/goals` - Crear meta
- `GET /api/v1/goals/:id` - Ver meta
- `PUT /api/v1/goals/:id` - Actualizar meta
- `POST /api/v1/goals/:id/contribute` - Contribuir a meta
- `DELETE /api/v1/goals/:id` - Eliminar meta

### Reportes
- `GET /api/v1/reports/monthly?year=2024&month=11` - Reporte mensual

## Autenticación

Todas las rutas (excepto login/register) requieren un header:

```
Authorization: Bearer <jwt_token>
```

## Características del Backend

### ✅ Autenticación JWT
- Login/Register con bcrypt
- Refresh tokens
- Guards de protección de rutas

### ✅ Transacciones Atómicas
- Creación de transacciones actualiza balances automáticamente
- Rollback automático en caso de error
- Soporte para transferencias entre cuentas

### ✅ CRUD Completo
- Todas las entidades tienen operaciones CRUD
- Soft delete para datos con historial
- Validación con class-validator

### ✅ Dashboard & Reportes
- KPIs calculados en tiempo real
- Tendencias mensuales
- Reportes por categoría

### ✅ Transacciones Recurrentes
- Cron job ejecutándose diariamente
- Soporte para múltiples frecuencias
- Integración con transacciones normales

### ✅ Seguridad
- Helmet para headers de seguridad
- CORS configurado
- Validación estricta de inputs
- Protección contra inyecciones SQL (Prisma)

## Modelo de Datos

Ver `prisma/schema.prisma` para el esquema completo. Entidades principales:

- **User**: Usuarios de la aplicación
- **Account**: Cuentas bancarias/efectivo
- **Card**: Tarjetas de crédito/débito
- **Category**: Categorías de ingresos/gastos
- **Transaction**: Transacciones financieras
- **Budget**: Presupuestos por categoría
- **Goal**: Metas de ahorro
- **RecurringTransaction**: Transacciones recurrentes

## Licencia

MIT
