# Deploy en Railway - Todo en Uno

## Pasos para Deploy en Railway

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login en Railway
```bash
railway login
```

### 3. Inicializar Proyecto
```bash
cd Backend
railway init
```

### 4. Configurar Variables de Entorno
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=sebast219-super-secret-jwt-key-2024
railway variables set FRONTEND_URL=https://tu-app.railway.app
```

### 5. Deploy
```bash
railway up
```

### 6. Obtener URL de la BD
```bash
railway variables get DATABASE_URL
```

### 7. Migrar Base de Datos
```bash
# Railway ejecuta automáticamente las migraciones
# O manualmente:
railway run npm run db:migrate
```

## URLs Finales
- **Backend**: https://tu-app.railway.app
- **API**: https://tu-app.railway.app/api/
- **BD**: PostgreSQL incluida

## Costo
- **Gratis**: Con créditos nuevos usuarios
- **Después**: $5/mes
- **Incluye**: Hosting + BD + Ancho de banda

## Ventajas
- Sin problemas de red/firewall
- Todo en una plataforma
- Deploy automático desde GitHub
- PostgreSQL gestionado
- SSL incluido
