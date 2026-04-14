# # DEPLOY GRATIS - Netlify + Neon

## # Pasos para Deploy 100% Gratis

### # 1. Configurar Neon (Base de Datos)
1. **Crear cuenta**: https://neon.tech
2. **Nuevo proyecto**: PostgreSQL
3. **Copiar connection string**
4. **Actualizar .env**:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require"
   ```

### # 2. Migrar Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Migrar schema a Neon
npm run db:migrate

# (Opcional) Exportar datos actuales
npm run db:export-neon
```

### # 3. Configurar Netlify (Frontend)
1. **Crear cuenta**: https://netlify.com
2. **Conectar GitHub repo**
3. **Build settings**:
   - **Base directory**: `Frontend/`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/fintrax-frontend`

### # 4. Configurar Netlify Functions (Backend)
1. **Crear folder**: `Backend/netlify/functions/`
2. **Copiar archivo**: `api.ts` (ya creado)
3. **Actualizar package.json**:
   ```json
   {
     "scripts": {
       "build:functions": "tsc netlify/functions/api.ts --outDir netlify/functions"
     }
   }
   ```

### # 5. Variables de Entorno en Netlify
```
DATABASE_URL=tu-neon-connection-string
DIRECT_URL=tu-neon-connection-string
JWT_SECRET=sebast219-secret-key
FRONTEND_URL=https://tu-site.netlify.app
```

### # 6. Deploy Automático
- **Push a GitHub** -> **Deploy automático**
- **Frontend**: https://tu-site.netlify.app
- **Backend API**: https://tu-site.netlify.app/api/

## # Costo Total: $0/mes

### # Límites Gratuitos:
- **Netlify**: 100GB bandwidth, 300min build
- **Neon**: 3GB storage, 1GB RAM
- **Functions**: 125k invocaciones/mes

### # Para Proyecto Universitario:
- **Perfecto para demos y presentaciones**
- **Escalable si crece el proyecto**
- **Sin costo durante desarrollo**
