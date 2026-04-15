# 🏦 Fintrax Web

**Aplicación web de gestión financiera personal** construida con tecnologías modernas.

> 💡 **Fintrax** es una solución completa para manejar tus finanzas personales con transparencia, seguridad y una experiencia de usuario excepcional.

## 🎯 ¿Qué es Fintrax?

Fintrax es un **monorepo** que contiene dos aplicaciones principales:

- 🖥️ **Frontend**: Interfaz de usuario moderna con Angular 21
- 🚀 **Backend**: API RESTful robusta con NestJS 11 y PostgreSQL

### 🌟 Características Principales

- 💰 **Gestión completa**: Cuentas, tarjetas, transacciones, categorías
- 📊 **Dashboard en vivo**: Resúmenes financieros y tendencias
- 🎯 **Metas de ahorro**: Define y sigue tus objetivos financieros
- 📈 **Reportes detallados**: Análisis por categorías y períodos
- 🔐 **Seguridad enterprise**: JWT, encriptación, validaciones
- 📱 **Responsive**: Funciona perfectamente en cualquier dispositivo

## 🏗️ Arquitectura del Proyecto

### 📋 Estructura General

```
Fintrax_Web/                    # 🏠 Raíz del monorepo
├── Backend/                     # 🚀 API NestJS
│   ├── src/
│   │   ├── application/         # 🎯 Casos de uso
│   │   ├── common/              # 🔧 Utilidades compartidas
│   │   ├── domain/              # 💼 Lógica de negocio pura
│   │   ├── infrastructure/      # 🌐 Configuración externa
│   │   └── modules/             # 📦 Módulos funcionales
│   │       ├── auth/           # 🔐 Autenticación
│   │       ├── users/          # 👥 Gestión de usuarios
│   │       ├── accounts/       # 💳 Cuentas bancarias
│   │       ├── transactions/    # 💸 Transacciones
│   │       └── ...             # 📂 Otros módulos
│   ├── prisma/                 # 🗄️ Base de datos
│   │   ├── schema.prisma       # 📋 Esquema completo
│   │   ├── migrations/         # 🔄 Historial de cambios
│   │   └── seed.ts             # 🌱 Datos iniciales
│   └── package.json            # 📦 Dependencias backend
│
├── Frontend/                    # 🎨 Aplicación Angular
│   └── src/
│       ├── app/
│       │   ├── core/           # 🏛️ Servicios centrales
│       │   │   ├── services/   # 🔌 API services
│       │   │   ├── guards/     # 🛡️ Guards de ruta
│       │   │   └── interceptors/ # 🔄 HTTP interceptors
│       │   ├── features/       # 📱 Funcionalidades
│       │   │   ├── auth/       # 🔐 Login/Registro
│       │   │   ├── dashboard/  # 📊 Panel principal
│       │   │   ├── accounts/   # 💳 Gestión cuentas
│       │   │   └── ...         # 📂 Otras features
│       │   ├── layout/         # 🎨 Componentes layout
│       │   └── shared/         # 🔄 Componentes reutilizables
│       └── environments/       # ⚙️ Configuración entorno
│
├── .github/                     # 🤖 CI/CD workflows
└── README.md                    # 📖 Documentación
```

### 🔄 Flujo de Datos

```mermaid
graph LR
    A[Usuario] --> B[Angular Frontend]
    B --> C[AuthService]
    C --> D[HTTP Interceptor]
    D --> E[NestJS API]
    E --> F[JWT Middleware]
    F --> G[Business Logic]
    G --> H[Prisma ORM]
    H --> I[PostgreSQL]
    I --> H
    H --> G
    G --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

## 🚀 Guía de Inicio Rápido

### 📋 Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** 20+ - [Descargar aquí](https://nodejs.org)
- **Docker** & **Docker Compose** - [Instalar Docker](https://docs.docker.com/get-docker/)
- **Git** - [Descargar Git](https://git-scm.com)
- **npm** (viene con Node.js)

### 🎯 Instalación Paso a Paso

#### 1️⃣ Clonar el Proyecto
```bash
# Clonar el repositorio
git clone <repository-url>

# Entrar a la carpeta
cd Fintrax_Web
```

#### 2️⃣ Instalar Dependencias
```bash
# Instalar dependencias del Backend
cd Backend
npm install

# Instalar dependencias del Frontend
cd ../Frontend
npm install

# Volver a la raíz
cd ..
```

#### 3️⃣ Configurar Base de Datos
```bash
# Entrar a la carpeta del Backend
cd Backend

# Copiar archivo de entorno
cp .env.example .env

# ⚠️ IMPORTANTE: Editar .env con tus datos
# Abre el archivo .env y configura:
# - DATABASE_URL: Tu conexión a PostgreSQL
# - JWT_SECRET: Una clave secreta segura
# - FRONTEND_URL: http://localhost:4200

# Iniciar PostgreSQL con Docker
docker-compose up -d

# Generar Prisma Client
npx prisma generate

# Aplicar migraciones a la base de datos
npx prisma migrate dev

# Cargar datos iniciales (usuarios de prueba)
npm run db:seed
```

#### 4️⃣ Iniciar la Aplicación

**Opción A: Dos Terminales (Recomendado para desarrollo)**

```bash
# Terminal 1: Backend
cd Backend
npm run start:dev
# ✅ API corriendo en http://localhost:3000
# ✅ Documentación en http://localhost:3000/api/docs

# Terminal 2: Frontend
cd Frontend
npm start
# ✅ Frontend corriendo en http://localhost:4200
```

**Opción B: Verificar que todo funciona**

1. **Backend**: Abre http://localhost:3000/api/health
   ```json
   {"ok": true, "mensaje": "API funcionando"}
   ```

2. **Documentación API**: Abre http://localhost:3000/api/docs

3. **Frontend**: Abre http://localhost:4200

### 🔑 Usuarios de Prueba

Después de ejecutar `npm run db:seed`, tendrás estos usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@fintrax.com | admin123 | Administrador |
| user@fintrax.com | user123 | Usuario normal |
| test@fintrax.com | test123 | Usuario de prueba |

### 🚨 Problemas Comunes

- **Port 3000/4200 en uso**: `npx kill-port 3000` o `npx kill-port 4200`
- **Error de PostgreSQL**: Verifica que Docker esté corriendo y el .env sea correcto
- **Error de permisos**: Ejecuta con permisos de administrador si es necesario

## 📁 Estructura del Proyecto

```
Fintrax_Web/
Backend/                    # API NestJS
  src/
    application/        # Lógica de aplicación
    common/            # Código compartido
    domain/            # Lógica de negocio
    app.module.ts      # Módulo raíz
    main.ts            # Bootstrap
  prisma/
    schema.prisma      # Esquema de base de datos
    migrations/        # Migraciones
    seed.ts            # Datos iniciales
  scripts/               # Scripts utilitarios
  netlify/               # Funciones serverless para Netlify
  test/                  # Tests
Frontend/                  # Aplicación Angular
  src/
    app/               # Componentes principales
    assets/            # Recursos estáticos
    environments/      # Configuraciones
    index.html         # HTML principal
    main.ts            # Bootstrap
  public/                # Archivos públicos
  netlify.toml           # Configuración de Netlify
.github/                   # Workflows de CI/CD
```

## 🛠️ Tecnologías

### Backend
- **Framework**: NestJS 11
- **Base de datos**: PostgreSQL 16
- **ORM**: Prisma 6
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator + class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: Angular 21
- **Estilos**: TailwindCSS
- **Gráficos**: Chart.js
- **HTTP Client**: Angular HttpClient
- **Testing**: Vitest
- **Formateo**: Prettier

## 📋 Scripts Disponibles

### Backend
| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor de desarrollo con watch |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Iniciar en modo producción |
| `npm run db:migrate` | Crear/Aplicar migraciones |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:seed` | Ejecutar seed |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:test` | Probar conexión a base de datos |
| `npm run db:status` | Verificar estado de Supabase |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests e2e |
| `npm run test:cov` | Tests con cobertura |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear código con Prettier |

### Frontend
| Script | Descripción |
|--------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests e2e |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear código con Prettier |

## ⚙️ Configuración Detallada

### 🔑 Variables de Entorno

#### Backend (.env)

Crea el archivo `Backend/.env`:

```env
# 🗄️ Base de Datos
DATABASE_URL="postgresql://fintrax_user:fintrax_password@localhost:5432/fintrax_db?schema=public"
DIRECT_URL="postgresql://fintrax_user:fintrax_password@localhost:5432/fintrax_db"

# 🔐 Seguridad
JWT_SECRET="tu-super-secret-key-de-32-caracteres-minimo"
JWT_REFRESH_SECRET="tu-refresh-token-secret-diferente"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# 🌐 CORS y URLs
FRONTEND_URL="http://localhost:4200"
PORT=3000
NODE_ENV="development"

# 📊 Opcional: Redis Cache
REDIS_URL="redis://localhost:6379"

# 📧 Opcional: Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# ☁️ Opcional: Cloud Storage
AWS_ACCESS_KEY_ID="tu-access-key"
AWS_SECRET_ACCESS_KEY="tu-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="fintrax-uploads"
```

#### Frontend (src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  // 📊 Configuración de la app
  app: {
    name: 'Fintrax',
    version: '1.0.0',
    currency: 'USD',
    locale: 'es'
  },
  // 🔧 Feature flags
  features: {
    darkMode: true,
    notifications: true,
    analytics: false
  }
};
```

### 🐳 Configuración Docker

#### docker-compose.yml (Backend)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: fintrax-postgres
    environment:
      POSTGRES_DB: fintrax_db
      POSTGRES_USER: fintrax_user
      POSTGRES_PASSWORD: fintrax_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: fintrax-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 🔧 Configuración de Desarrollo

#### VS Code Settings (.vscode/settings.json)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

#### Git Hooks (Opcional)

```bash
# Instalar husky
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run lint && npm run format"

# Configurar pre-push
npx husky add .husky/pre-push "npm run test"
```

## 📚 Documentación Completa del API

### 🌐 Acceso a la Documentación

La API está completamente documentada con **Swagger/OpenAPI**:

- 📖 **Documentación interactiva**: http://localhost:3000/api/docs
- 🔍 **Explorador de endpoints**: Prueba directamente desde el navegador
- 📋 **Esquemas detallados**: Modelos de datos y validaciones

### 🔐 Autenticación

Todos los endpoints (excepto signup/signin) requieren un **token JWT**:

```http
Authorization: Bearer <tu-jwt-token>
```

### 📡 Endpoints Disponibles

#### 🔑 **Autenticación**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/signup` | Registrar nuevo usuario | ❌ |
| POST | `/api/v1/auth/signin` | Iniciar sesión | ❌ |
| GET | `/api/v1/auth/me` | Obtener perfil del usuario | ✅ |
| POST | `/api/v1/auth/refresh` | Refrescar token | ✅ |

**Ejemplo Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@fintrax.com","password":"user123"}'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@fintrax.com",
    "fullName": "Usuario Test"
  }
}
```

#### 💳 **Cuentas (Accounts)**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| GET | `/api/v1/accounts` | Listar todas las cuentas | ✅ |
| POST | `/api/v1/accounts` | Crear nueva cuenta | ✅ |
| GET | `/api/v1/accounts/:id` | Obtener cuenta por ID | ✅ |
| PUT | `/api/v1/accounts/:id` | Actualizar cuenta | ✅ |
| DELETE | `/api/v1/accounts/:id` | Eliminar cuenta | ✅ |

**Ejemplo Crear Cuenta:**
```bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cuenta Principal",
    "type": "CHECKING",
    "initialBalance": 1000.00,
    "currency": "USD"
  }'
```

#### 💸 **Transacciones**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| GET | `/api/v1/transactions` | Listar transacciones | ✅ |
| POST | `/api/v1/transactions` | Crear transacción | ✅ |
| GET | `/api/v1/transactions/:id` | Obtener transacción | ✅ |
| PUT | `/api/v1/transactions/:id` | Actualizar transacción | ✅ |
| DELETE | `/api/v1/transactions/:id` | Eliminar transacción | ✅ |

**Ejemplo Crear Transacción:**
```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "uuid-cuenta",
    "categoryId": "uuid-categoria",
    "type": "EXPENSE",
    "amount": 50.00,
    "description": "Comida en restaurante",
    "transactionDate": "2024-01-15"
  }'
```

#### 📊 **Dashboard**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| GET | `/api/v1/dashboard/summary` | Resumen financiero | ✅ |
| GET | `/api/v1/dashboard/trends` | Tendencias mensuales | ✅ |
| GET | `/api/v1/dashboard/recent-transactions` | Transacciones recientes | ✅ |

#### 📂 **Categorías**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| GET | `/api/v1/categories` | Listar categorías | ✅ |
| POST | `/api/v1/categories` | Crear categoría | ✅ |
| PUT | `/api/v1/categories/:id` | Actualizar categoría | ✅ |

#### 🎯 **Metas de Ahorro**

| Método | Endpoint | Descripción | ¿Auth? |
|--------|----------|-------------|--------|
| GET | `/api/v1/goals` | Listar metas | ✅ |
| POST | `/api/v1/goals` | Crear meta | ✅ |
| PUT | `/api/v1/goals/:id` | Actualizar meta | ✅ |
| POST | `/api/v1/goals/:id/contribute` | Contribuir a meta | ✅ |

### 📋 Códigos de Respuesta

| Código | Significado | Cuándo aparece |
|--------|-------------|----------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Sin token o token inválido |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email duplicado, etc. |
| 500 | Internal Error | Error del servidor |

## 🏛️ Modelo de Datos Completo

### 📊 Diagrama de Entidades

```mermaid
erDiagram
    User ||--o{ Account : owns
    User ||--o{ Card : owns
    User ||--o{ Category : creates
    User ||--o{ Transaction : makes
    User ||--o{ Goal : sets
    
    Account ||--o{ Transaction : contains
    Account ||--o{ Card : links
    
    Category ||--o{ Transaction : categorizes
    Category ||--o{ Budget : limits
    
    Transaction ||--o{ GoalContribution : funds
    Goal ||--o{ GoalContribution : receives
    
    User {
        string id PK
        string email UK
        string passwordHash
        string fullName
        string avatarUrl
        string currency
        string locale
        string timezone
        json preferences
        boolean isActive
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }
    
    Account {
        string id PK
        string userId FK
        string name
        enum type
        decimal balance
        decimal initialBalance
        string currency
        string color
        string icon
        boolean isActive
        boolean isArchived
        int sortOrder
        datetime createdAt
        datetime updatedAt
    }
    
    Transaction {
        string id PK
        string userId FK
        string accountId FK
        string categoryId FK
        string cardId FK
        enum type
        decimal amount
        string description
        string notes
        date transactionDate
        string transferAccountId FK
        boolean isRecurring
        string tags[]
        json metadata
        boolean isConfirmed
        datetime createdAt
        datetime updatedAt
    }
```

### 📋 Entidades Principales

#### 👤 **User** - Usuarios
- **Propósito**: Gestión de usuarios y autenticación
- **Campos clave**: email, fullName, preferences, currency
- **Relaciones**: 1:N con Accounts, Transactions, Goals

#### 💳 **Account** - Cuentas
- **Propósito**: Cuentas bancarias, efectivo, tarjetas
- **Tipos**: CASH, CHECKING, SAVINGS, CREDIT_CARD, DEBIT_CARD, INVESTMENT
- **Campos clave**: balance, type, currency, sortOrder

#### 💸 **Transaction** - Transacciones
- **Propósito**: Movimientos financieros
- **Tipos**: INCOME, EXPENSE, TRANSFER
- **Características**: Recurrentes, etiquetas, metadatos

#### 📂 **Category** - Categorías
- **Propósito**: Clasificación de transacciones
- **Tipos**: INCOME, EXPENSE
- **Jerarquía**: Soporta categorías padre/hijo

#### 🎯 **Goal** - Metas de Ahorro
- **Propósito**: Objetivos financieros
- **Estados**: ACTIVE, COMPLETED, PAUSED, CANCELLED
- **Características**: Auto-ahorro, contribuciones

#### 💳 **Card** - Tarjetas
- **Propósito**: Tarjetas de crédito/débito
- **Redes**: VISA, MASTERCARD, AMEX, OTHER
- **Campos**: creditLimit, billingDay, interestRate

#### 📊 **Budget** - Presupuestos
- **Propósito**: Límites de gastos por categoría
- **Periodicidad**: Mensual
- **Alertas**: Umbral de notificación

### 🔗 Relaciones Importantes

- **User → Account**: Un usuario puede tener múltiples cuentas
- **Account → Transaction**: Las transacciones pertenecen a una cuenta
- **Transaction → Category**: Cada transacción tiene una categoría
- **Goal → GoalContribution**: Las metas reciben contribuciones
- **Category → Budget**: Las categorías pueden tener presupuestos mensuales

## 🧪 Testing y Calidad del Código

### 🎯 Estrategia de Testing

Fintrax utiliza una estrategia de testing multi-nivel:

```mermaid
graph TD
    A[Testing Pyramid] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    
    B --> B1[Jest - Backend]
    B --> B2[Vitest - Frontend]
    
    C --> C1[API Integration]
    C --> C2[Database Tests]
    
    D --> D1[Cypress - E2E]
    D --> D2[Manual Testing]
```

### 🧪 Backend Testing

#### Tests Unitarios
```bash
cd Backend

# Ejecutar todos los tests
npm run test

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests con cobertura de código
npm run test:cov

# Tests específicos
npm run test -- auth.service.test.ts
npm run test -- --testNamePattern="should create user"
```

#### Tests de Integración
```bash
# Tests de integración con base de datos
npm run test:e2e

# Tests de API endpoints
npm run test:api

# Tests con base de datos real
npm run test:db
```

#### Ejemplo de Test Unitario
```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should register a new user', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    };

    const result = await service.signUp(dto);
    
    expect(result).toHaveProperty('id');
    expect(result.email).toBe(dto.email);
  });
});
```

### 🎨 Frontend Testing

#### Tests Unitarios con Vitest
```bash
cd Frontend

# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests de componentes específicos
npm run test -- auth.component.spec.ts
```

#### Tests End-to-End
```bash
# Tests E2E con Cypress
npm run test:e2e

# Abrir Cypress GUI
npm run test:e2e:open
```

#### Ejemplo de Test de Componente
```typescript
// login.component.spec.ts
import { mount } from '@cypress/vue';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('should render login form', () => {
    mount(LoginComponent);
    
    cy.get('[data-cy=email-input]').should('be.visible');
    cy.get('[data-cy=password-input]').should('be.visible');
    cy.get('[data-cy=login-button]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    mount(LoginComponent);
    
    cy.get('[data-cy=email-input]').type('invalid@email.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    cy.get('[data-cy=error-message]').should('be.visible');
  });
});
```

### 📊 Cobertura de Código

#### Métricas Objetivo
- **Backend**: >80% cobertura
- **Frontend**: >75% cobertura
- **Integración**: >90% endpoints cubiertos

#### Reportes de Cobertura
```bash
# Backend - Generar reporte HTML
cd Backend
npm run test:cov
open coverage/lcov-report/index.html

# Frontend - Generar reporte
cd Frontend
npm run test:cov
open coverage/index.html
```

### 🔍 Calidad del Código

#### Linting y Formato
```bash
# Backend - ESLint + Prettier
cd Backend
npm run lint        # Verificar código
npm run lint:fix     # Corregir automáticamente
npm run format       # Formatear código

# Frontend - ESLint + Prettier
cd Frontend
npm run lint
npm run format
```

#### Análisis Estático
```bash
# TypeScript strict mode check
npm run type-check

# Security audit
npm audit
npm audit fix

# Dependencies check
npm outdated
```

## 🚀 Despliegue

### Backend (Tradicional)
```bash
cd Backend
npm run build
npm run start:prod
```

### Frontend (Tradicional)
```bash
cd Frontend
npm run build
# Los archivos compilados estarán en dist/
```

### Despliegue en Netlify (Serverless)

El proyecto está configurado para despliegue en Netlify con funciones serverless:

**Frontend:**
- Configuración en `Frontend/netlify.toml`
- Build automático desde la carpeta `Frontend/`
- Redirecciones de API a funciones serverless

**Backend como Serverless:**
- Funciones en `Backend/netlify/functions/api.ts`
- Adaptación de NestJS para serverless con `serverless-http`
- Cache de aplicación para optimizar cold starts

**Variables de Entorno en Netlify:**
```bash
DATABASE_URL=postgresql://[tu-config]
JWT_SECRET=[tu-secret]
FRONTEND_URL=[tu-dominio-netlify]
```

**Pasos para despliegue:**
1. Conectar repositorio a Netlify
2. Configurar variables de entorno
3. Deploy automático en cada push a main

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Encriptación de contraseñas con bcrypt
- Headers de seguridad con Helmet
- CORS configurado
- Validación estricta de inputs
- Protección contra inyecciones SQL (Prisma)

## 🌟 Características Detalladas

### 💰 Gestión Financiera Completa

#### 🏦 **Múltiples Cuentas y Tarjetas**
- **Cuentas bancarias**: Corrientes, ahorros, inversiones
- **Tarjetas**: Crédito, débito, prepago
- **Efectivo**: Control de dinero físico
- **Criptomonedas**: Soporte para wallets digitales

#### 📊 **Categorización Inteligente**
- **Categorías predefinidas**: Comida, transporte, vivienda, etc.
- **Categorías personalizadas**: Crea tus propias categorías
- **Subcategorías**: Organización jerárquica
- **Etiquetas**: Clasificación flexible con tags

#### 🎯 **Presupuestos y Metas**
- **Presupuestos mensuales**: Límites por categoría
- **Alertas de presupuesto**: Notificaciones al alcanzar límites
- **Metas de ahorro**: Define objetivos financieros
- **Seguimiento automático**: Progreso en tiempo real

#### 🔄 **Transacciones Recurrentes**
- **Automatización**: Gatos e ingresos periódicos
- **Frecuencias flexibles**: Diario, semanal, mensual, anual
- **Recordatorios**: Notificaciones antes de vencimientos
- **Historial**: Seguimiento de patrones

### 📈 Dashboard y Análisis

#### 📊 **Dashboard Principal**
- **Resumen financiero**: Balance total, ingresos, gastos
- **Gráficos interactivos**: Evolución temporal, distribución
- **KPIs personalizados**: Métricas importantes para ti
- **Quick actions**: Accesos rápidos a funciones frecuentes

#### 📉 **Análisis y Tendencias**
- **Tendencias mensuales**: Comparación período a período
- **Análisis por categoría**: Dónde va tu dinero
- **Proyecciones**: Estimaciones basadas en historial
- **Reportes personalizados**: Filtros y exportación

#### 📋 **Reportes Detallados**
- **Reporte mensual**: Resumen completo del período
- **Reporte por categoría**: Análisis detallado
- **Reporte de ahorros**: Seguimiento de metas
- **Exportación**: PDF, Excel, CSV

### 🎨 Experiencia de Usuario

#### 📱 **Diseño Responsivo**
- **Mobile-first**: Optimizado para móviles
- **Tablet friendly**: Experiencia completa en tablets
- **Desktop**: Aprovechamiento de pantalla grande
- **PWA**: Instalable como aplicación nativa

#### 🌙 **Personalización**
- **Temas**: Claro, oscuro, automático
- **Idioma**: Español, inglés (extensible)
- **Moneda**: USD, EUR, MXN, etc.
- **Preferencias**: Configuración personal de la app

#### ⚡ **Rendimiento**
- **Carga rápida**: Optimización de bundles
- **Offline mode**: Funcionalidad básica sin conexión
- **Sincronización**: Actualizaciones en tiempo real
- **Cache inteligente**: Reducción de llamadas a API

#### 🔔 **Notificaciones**
- **Push notifications**: Alertas en tiempo real
- **Email alerts**: Resúmenes periódicos
- **In-app notifications**: Mensajes dentro de la app
- **Personalizables**: Elige qué notificaciones recibir

### 🔧 Características Técnicas

#### 🛡️ **Seguridad Enterprise**
- **JWT tokens**: Autenticación segura
- **Encriptación**: Contraseñas con bcrypt
- **HTTPS**: Comunicación cifrada
- **CORS**: Protección contra peticiones cruzadas
- **Rate limiting**: Protección contra ataques

#### 🔄 **Sincronización**
- **Real-time updates**: WebSocket para actualizaciones
- **Offline support**: PWA con service worker
- **Conflict resolution**: Manejo de cambios simultáneos
- **Backup automático**: Copias de seguridad regulares

#### 📊 **Escalabilidad**
- **Microservicios**: Arquitectura modular
- **Cache Redis**: Optimización de rendimiento
- **Database sharding**: Escalado horizontal
- **Load balancing**: Distribución de carga

## 🤝 Guía de Contribución

### 🎯 ¿Cómo Contribuir?

¡Nos encantaría que contribuyas a Fintrax! Sigue estos pasos:

#### 🍴 1. Fork y Clone
```bash
# Fork el repositorio en GitHub
# Clona tu fork
git clone https://github.com/TU-USUARIO/Fintrax_Web.git
cd Fintrax_Web

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/Fintrax_Web.git
```

#### 🌿 2. Crea una Rama
```bash
# Sincroniza con el upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crea tu rama de feature
git checkout -b feature/tu-nueva-funcionalidad
```

#### 💻 3. Desarrollo
- **Sigue las convenciones de código**: ESLint + Prettier
- **Escribe tests**: Unit tests e integration tests
- **Documenta cambios**: Actualiza README y comentarios
- **Commits atómicos**: Un cambio por commit

#### 📝 4. Convención de Commits
Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat(auth): add JWT refresh token support"

# Fixes
git commit -m "fix(transactions): resolve decimal precision issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactoring
git commit -m "refactor(components): simplify dashboard layout"

# Tests
git commit -m "test(accounts): add integration tests for CRUD operations"
```

#### 🧪 5. Testing
```bash
# Ejecuta todos los tests
npm run test:all

# Verifica linting
npm run lint

# Formatea código
npm run format

# Asegura que todo compila
npm run build
```

#### 🚀 6. Push y Pull Request
```bash
# Push a tu fork
git push origin feature/tu-nueva-funcionalidad

# Crea Pull Request en GitHub
# Usa template detallado para PR
```

### 📋 Template de Pull Request

```markdown
## 📝 Descripción
Breve descricripción de los cambios implementados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests pasan
- [ ] Integration tests pasan
- [ ] Manual testing realizado

## 📸 Capturas de Pantalla
(Agrega screenshots si aplica)

## 🔗 Issues Relacionados
Closes #123
```

### 🏷️ Etiquetas y Áreas de Contribución

#### 🐛 **Bug Reports**
- Usa issue template para bugs
- Incluye pasos para reproducir
- Agrega screenshots y logs

#### 💡 **Feature Requests**
- Describe el problema a resolver
- Propone solución
- Considera impacto en UX

#### 📚 **Documentación**
- Mejora explicaciones
- Agrega ejemplos de código
- Traducciones y correcciones

#### 🎨 **UI/UX**
- Mejoras de diseño
- Optimización de flujo
- Accesibilidad

### 🏆 Reconocimientos

Los contribuidores serán reconocidos en:
- **README.md**: Sección de contribuidores
- **Changelog**: Mención de cambios
- **Release notes**: Agradecimientos

### 📞 Contacto para Contribuidores

- **Discord**: [Servidor de la comunidad]
- **Email**: dev@fintrax.com
- **Issues**: GitHub Issues

## ❓ Troubleshooting y Preguntas Frecuentes

### 🚨 Problemas Comunes

#### 🔧 **Errores de Instalación**

**Error**: `npm ERR! peer dep missing`
```bash
# Solución: Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error**: `EACCES: permission denied`
```bash
# Solución (macOS/Linux)
sudo chown -R $(whoami) node_modules

# Solución (Windows)
# Ejecutar terminal como administrador
```

#### 🗄️ **Problemas de Base de Datos**

**Error**: `Connection refused`
```bash
# Verificar Docker
docker ps

# Reiniciar PostgreSQL
docker-compose down
docker-compose up -d

# Verificar .env
echo $DATABASE_URL
```

**Error**: `Migration failed`
```bash
# Resetear base de datos
npx prisma migrate reset

# O regenerar desde cero
npx prisma db push --force-reset
```

#### 🚀 **Errores de Servidor**

**Error**: `Port 3000 already in use`
```bash
# Matar proceso en puerto
npx kill-port 3000

# O cambiar puerto en .env
PORT=3001 npm run start:dev
```

**Error**: `CORS policy error`
```bash
# Verificar FRONTEND_URL en .env
echo $FRONTEND_URL

# Debe ser: http://localhost:4200
```

#### 🎨 **Problemas del Frontend**

**Error**: `Cannot find module`
```bash
# Reinstalar dependencias
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

**Error**: `NGCC failed`
```bash
# Limpiar y rebuild
ng cache clean
npm run build
```

### 🔍 **Debugging Tips**

#### Backend Debugging
```bash
# Logs detallados
DEBUG=* npm run start:dev

# Modo inspect
npm run start:debug

# Verificar conexión a DB
npm run db:test
```

#### Frontend Debugging
```bash
# Verificar compilación
ng build --verbose

# Analizar bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### 📋 **Guía de Configuración por Sistema Operativo**

#### 🪟 **Windows**
```bash
# Instalar Chocolatey (si no tienes)
# Luego instalar Node.js y Docker
choco install nodejs docker-desktop

# Configurar variables de entorno
# Panel de control > Sistema > Variables de entorno
```

#### 🍎 **macOS**
```bash
# Instalar Homebrew (si no tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install node docker docker-compose
```

#### 🐧 **Linux (Ubuntu/Debian)**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Docker
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### 🆘 **Obtener Ayuda**

#### 📚 **Recursos de Autoayuda**
1. **Documentación API**: http://localhost:3000/api/docs
2. **Logs del servidor**: Revisa consola al ejecutar `npm run start:dev`
3. **Database status**: `npm run db:status`

#### 💬 **Comunidad**
- **GitHub Issues**: Reporta bugs y preguntas
- **Discord**: Chat en tiempo real con desarrolladores
- **Stack Overflow**: Usa etiqueta `fintrax`

#### 📧 **Soporte Directo**
- **Email**: support@fintrax.com
- **Response time**: 24-48 horas
- **Priority issues**: Críticos de seguridad

### 📖 **Glosario de Términos**

| Término | Definición |
|---------|------------|
| **Monorepo** | Repositorio con múltiples proyectos relacionados |
| **NestJS** | Framework Node.js basado en TypeScript |
| **Prisma** | ORM moderno para bases de datos |
| **JWT** | JSON Web Token para autenticación |
| **Swagger** | Herramienta para documentación de APIs |
| **PWA** | Progressive Web App - aplicación web instalable |
| **Docker** | Plataforma de contenerización |
| **TypeScript** | JavaScript con tipos estáticos |

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.

> 📋 **Resumen**: Eres libre de usar, modificar y distribuir este código, siempre y cuando incluyas el aviso de copyright original.

### 📜 **Texto Completo de la Licencia**

```
MIT License

Copyright (c) 2024 Fintrax

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Soporte y Contacto

### 🆘 **Cómo Obtener Ayuda**

#### 🐛 **Reportar Issues**
- **GitHub Issues**: [Reportar bug](https://github.com/USUARIO/Fintrax_Web/issues)
- **Incluir**: Versión, SO, pasos para reproducir, screenshots

#### 💬 **Comunidad**
- **Discord**: [Servidor de Discord](https://discord.gg/fintrax)
- **Stack Overflow**: Usa etiqueta `fintrax-web`
- **Reddit**: r/Fintrax

#### 📧 **Contacto Directo**
- **Email**: dev@fintrax.com
- **Response time**: 24-48 horas laborales
- **Emergency**: security@fintrax.com (para issues de seguridad)

### 🌟 **Contribuciones Bienvenidas**

¿Quieres contribuir? Revisa la sección **🤝 Guía de Contribución** arriba.

### 📊 **Estado del Proyecto**

- ✅ **Versión actual**: 1.0.0
- 🔄 **Última actualización**: Enero 2024
- 🚀 **Próximo release**: v1.1.0 (Q2 2024)
- 📈 **Estabilidad**: Producción-ready

---

<div align="center">

## 🎉 ¡Gracias por usar Fintrax!

**Made with ❤️ by the Fintrax Team**

[⭐ Star on GitHub](https://github.com/USUARIO/Fintrax_Web) •
[🐛 Report Issues](https://github.com/USUARIO/Fintrax_Web/issues) •
[💬 Discord Community](https://discord.gg/fintrax)

</div>
