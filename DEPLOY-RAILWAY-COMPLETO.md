# Deploy Completo en Railway - Solución Definitiva

## Problema Resuelto
Tu red/firewall local bloquea conexiones a bases de datos externas.

## Solución: Deploy Directo en Railway
Railway ejecutará tu backend en su infraestructura, donde SÍ puede conectar a la BD.

## Pasos para Deploy Exitoso

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login y Crear Proyecto
```bash
railway login
railway init fintrax-sebast219
```

### 3. Configurar Variables de Entorno
```bash
# En Railway UI o CLI
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=sebast219-super-secret-jwt-key-2024
railway variables set FRONTEND_URL=https://tu-frontend.netlify.app
```

### 4. Crear railway.json (Configuración)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health"
  }
}
```

### 5. Deploy del Backend
```bash
# Desde el directorio Backend
railway up
```

### 6. Migrar Base de Datos (en Railway)
```bash
# Railway ejecuta esto en su infraestructura
railway run npm run db:migrate
```

### 7. Obtener URLs
```bash
railway status
```

## URLs Finales
- **Backend**: https://fintrax-sebast219.railway.app
- **API**: https://fintrax-seast219.railway.app/api/
- **BD**: PostgreSQL interna de Railway

## Ventajas
- Sin problemas de red/firewall
- Todo en una plataforma
- Deploy automático
- Escalabilidad automática

## Costo
- **Gratis**: Con créditos nuevos usuarios
- **Después**: $5/mes
- **Incluye**: Hosting + BD + Ancho de banda
