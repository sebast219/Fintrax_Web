export const environment = {
  production: true,
  apiUrl: 'https://fintrax-backend.railway.app/api/v1',
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
    analytics: true
  }
};
