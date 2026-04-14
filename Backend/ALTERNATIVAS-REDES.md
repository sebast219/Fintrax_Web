# Soluciones para Problemas de Red/Firewall

## Problema Actual
No puedes conectar a bases de datos en la nube (Supabase/Neon) desde tu red local.

## Soluciones Inmediatas

### Opción 1: Railway con PostgreSQL Local
```bash
# 1. Instalar PostgreSQL local
brew install postgresql  # Mac
sudo apt-get install postgresql  # Linux

# 2. Crear BD local
createdb fintrax_local

# 3. Actualizar .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrax_local"
```

### Opción 2: Usar Railway (Incluye BD)
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
railway init

# 4. Deploy
railway up
```

### Opción 3: VPS Gratuito
- **Oracle Cloud Free Tier**: 2 VPS por 1 año
- **AWS Free Tier**: 1 VPS por 12 meses
- **Google Cloud**: $300 crédito gratis

### Opción 4: Docker Local
```bash
# 1. Crear docker-compose.yml
# 2. Iniciar PostgreSQL en Docker
docker-compose up -d

# 3. Conectar a localhost
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrax"
```

## Recomendación para Proyecto Universitario
**Usa Railway** - Es la opción más simple:
- Incluye hosting + BD
- $5/mes (o gratis con creditos)
- Deploy con un comando
- Sin problemas de red/firewall
