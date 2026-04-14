# Configuración de Supabase para Fintrax Web

## Pasos para conectar con Supabase

### 1. Obtener credenciales de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Settings** > **Database**
3. Copia la **Connection string** con formato:
   ```
   postgresql://postgres.nkltdpnyzvwfqgjnjeqw:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 2. Configurar variables de entorno

Actualiza el archivo `.env` con tus credenciales reales:

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres.nkltdpnyzvwfqgjnjeqw:[TU-PASSWORD-AQUI]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nkltdpnyzvwfqgjnjeqw:[TU-PASSWORD-AQUI]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

### 3. Aplicar migraciones

Una vez configuradas las credenciales, ejecuta:

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar esquema a Supabase
npx prisma db push

# Opcional: Verificar conexión
npx prisma db pull
```

### 4. Iniciar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

## Endpoints disponibles

Una vez iniciada la aplicación, tendrás acceso a:

- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Checks**: http://localhost:3000/api/v1/health
- **Métricas**: http://localhost:3000/metrics

## Características implementadas

### Seguridad
- Rate limiting por IP/usuario
- JWT authentication
- Logging estructurado
- Validación de datos

### Monitoreo
- Health checks completos
- Métricas Prometheus
- Logging con Winston
- Endpoints de diagnóstico

### Arquitectura
- Arquitectura hexagonal
- Repositorios implementados
- Inyección de dependencias
- Separación de responsabilidades

### Performance
- Caché en memoria/Redis
- Optimización de consultas
- Logging de performance
- Rate limiting inteligente

## Configuración adicional

Para Redis (opcional):
```env
REDIS_URL=redis://localhost:6379
```

Para logging avanzado:
```env
LOG_LEVEL=info
LOG_FORMAT=json
```

Para rate limiting:
```env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## Troubleshooting

### Error de conexión a base de datos
- Verifica que las credenciales sean correctas
- Asegúrate que el proyecto Supabase esté activo
- Revisa que la conexión string tenga el formato correcto

### Error de compilación
- Ejecuta `npm install` para actualizar dependencias
- Verifica que Node.js sea versión 20 o superior
- Revisa el archivo `.env` esté configurado correctamente

### Error de módulos
- Asegúrate que todos los módulos estén importados correctamente
- Verifica las dependencias circulares
- Revisa la configuración de inyección de dependencias

## Soporte

Si encuentras algún problema, revisa los logs de la aplicación o contacta al equipo de desarrollo.
