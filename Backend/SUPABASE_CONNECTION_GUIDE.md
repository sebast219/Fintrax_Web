# 🔗 Guía de Conexión con Supabase - Fintrax Backend

## 📋 Requisitos Previos

1. **Cuenta de Supabase activa**
2. **Proyecto creado en Supabase**
3. **PostgreSQL configurado**

## 🔧 Pasos para Conectar

### 1. Obtener Credenciales

En tu dashboard de Supabase:
- Ve a **Settings > Database**
- Copia la **Connection string**
- Encuentra tu **password** en **Settings > Database > Reset database password**

### 2. Actualizar Variables de Entorno

Edita el archivo `.env`:

```bash
# Reemplaza REEMPLAZAR_CON_PASSWORD_REAL con tu contraseña real
DATABASE_URL="postgresql://postgres.nkltdpnyzvwfqgjnjeqw:REEMPLAZAR_CON_PASSWORD_REAL@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nkltdpnyzvwfqgjnjeqw:REEMPLAZAR_CON_PASSWORD_REAL@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

### 3. Probar Conexión

```bash
# Generar cliente Prisma
npm run db:generate

# Probar conexión
npm run db:test

# Si funciona, hacer migración
npm run db:migrate
```

### 4. Verificar Tablas

```bash
# Abrir Prisma Studio
npm run db:studio

# O ver tablas con SQL
npm run db:test
```

## 🚀 Iniciar Aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🔍 Verificación

La aplicación debería:
- ✅ Conectarse a Supabase PostgreSQL
- ✅ Crear las tablas del schema
- ✅ Permitir CRUD operations
- ✅ Manejar autenticación JWT

## 🛠️ Troubleshooting

### Error: "Can't reach database server"
- Verifica contraseña en `.env`
- Confirma URL del proyecto Supabase
- Revisa firewall/network

### Error: "P1001: Can't reach database"
- Usa `pooler.supabase.com` (no directo)
- Verifica puerto (6543 para pooler, 5432 para directo)

### Error: "No such table"
- Ejecuta `npm run db:migrate`
- Revisa `prisma/schema.prisma`

## 📚️ Referencias

- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Prisma PostgreSQL Setup](https://www.prisma.io/docs/getting-started/setup-postgresql)
- [NestJS Configuration](https://docs.nestjs.com/techniques/database)
