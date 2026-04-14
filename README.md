# Fintrax Web

Aplicación web de gestión financiera personal construida con Angular y NestJS.

## 🏗️ Arquitectura

Este proyecto sigue una arquitectura monorepo con dos aplicaciones principales:

- **Frontend**: Aplicación Angular 21 para la interfaz de usuario
- **Backend**: API REST con NestJS 11 y PostgreSQL

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- Docker & Docker Compose
- npm

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd Fintrax_Web
```

2. Instalar dependencias del backend:
```bash
cd Backend
npm install
```

3. Instalar dependencias del frontend:
```bash
cd ../Frontend
npm install
```

4. Configurar base de datos:
```bash
cd ../Backend
cp .env.example .env
# Editar .env con tus configuraciones
docker-compose up -d
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### Ejecutar la Aplicación

1. Iniciar el backend:
```bash
cd Backend
npm run start:dev
```
El API estará disponible en `http://localhost:3000`
La documentación Swagger en `http://localhost:3000/api/docs`

2. Iniciar el frontend (en otra terminal):
```bash
cd Frontend
npm start
```
La aplicación estará disponible en `http://localhost:4200`

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

## 🔧 Configuración

### Variables de Entorno del Backend

Crear un archivo `.env` en la carpeta `Backend/`:

```env
DATABASE_URL="postgresql://fintrax_user:fintrax_password@localhost:5432/fintrax_db?schema=public"
JWT_SECRET="tu-super-secret-key"
FRONTEND_URL="http://localhost:4200"
```

### Variables de Entorno del Frontend

Crear un archivo `.env` en la carpeta `Frontend/`:

```env
API_URL=http://localhost:3000
```

## 📚 Documentación del API

La API está documentada con Swagger/OpenAPI y disponible en:
`http://localhost:3000/api/docs`

### Endpoints Principales

#### Autenticación
- `POST /api/v1/auth/signup` - Registro
- `POST /api/v1/auth/signin` - Login
- `GET /api/v1/auth/me` - Perfil del usuario

#### Cuentas
- `GET /api/v1/accounts` - Listar cuentas
- `POST /api/v1/accounts` - Crear cuenta
- `PUT /api/v1/accounts/:id` - Actualizar cuenta

#### Transacciones
- `GET /api/v1/transactions` - Listar transacciones
- `POST /api/v1/transactions` - Crear transacción
- `PUT /api/v1/transactions/:id` - Actualizar transacción

#### Dashboard
- `GET /api/v1/dashboard/summary` - Resumen financiero
- `GET /api/v1/dashboard/trends` - Tendencias mensuales

## 🏛️ Modelo de Datos

Las entidades principales incluyen:
- **User**: Usuarios de la aplicación
- **Account**: Cuentas bancarias/efectivo
- **Card**: Tarjetas de crédito/débito
- **Category**: Categorías de ingresos/gastos
- **Transaction**: Transacciones financieras
- **Budget**: Presupuestos por categoría
- **Goal**: Metas de ahorro

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm run test              # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Tests con cobertura
```

### Frontend Tests
```bash
cd Frontend
npm run test              # Tests unitarios
npm run test:e2e          # Tests end-to-end
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

## 📈 Características

### ✅ Gestión Financiera Completa
- Múltiples cuentas y tarjetas
- Categorización de transacciones
- Presupuestos y metas de ahorro
- Transacciones recurrentes automáticas

### ✅ Dashboard y Reportes
- Resumen financiero en tiempo real
- Tendencias y análisis mensuales
- Reportes por categoría
- KPIs personalizados

### ✅ Experiencia de Usuario
- Interfaz moderna y responsiva
- Navegación intuitiva
- Gráficos interactivos
- Actualizaciones en tiempo real

## 🤝 Contribución

1. Fork del proyecto
2. Crear una feature branch (`git checkout -b feature/amazing-feature`)
3. Commit de los cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 📞 Soporte

Para soporte o preguntas, contacta al equipo de desarrollo o abre un issue en el repositorio.
