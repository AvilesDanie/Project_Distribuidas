# Encuentro - Frontend

Frontend de la plataforma Encuentro desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características

### Roles y Funcionalidades

#### **Usuario Regular**
- **Dashboard personalizado** - Vista general de eventos y entradas
- **Explorar eventos** - Catálogo completo con filtros y búsqueda
- **Gestión de entradas** - Ver entradas compradas y códigos QR
- **Perfil de usuario** - Actualizar información personal y contraseña

#### **Administrador**
- **Panel de administración** - Estadísticas y métricas del sistema
- **Gestión de eventos** - Crear, editar y publicar eventos
- **Gestión de usuarios** - Ver y administrar usuarios registrados
- **Reportes y ventas** - Análisis de ventas y estadísticas detalladas

## 🛠️ Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Data Fetching**: React Query
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📦 Instalación

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación**
   - URL: http://localhost:3000
   - El frontend se conecta automáticamente al backend en http://localhost

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary**: Azul (#0ea5e9) - Botones principales y navegación
- **Secondary**: Púrpura (#d946ef) - Elementos admin y destacados
- **Success**: Verde - Estados exitosos y confirmaciones
- **Warning**: Amarillo - Alertas y notificaciones
- **Error**: Rojo - Errores y estados críticos

### Componentes Reutilizables
- **LoadingSpinner** - Indicadores de carga
- **Modal** - Ventanas emergentes
- **Cards** - Contenedores de información
- **Buttons** - Botones con diferentes variantes
- **Forms** - Formularios con validación

### Animaciones
- **Fade in** - Aparición suave de elementos
- **Slide in** - Transiciones de navegación
- **Hover effects** - Interacciones táctiles
- **Loading states** - Estados de carga fluidos

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Layout y navegación
│   └── ui/            # Componentes de interfaz
├── contexts/           # Context providers
├── pages/             # Páginas de la aplicación
│   ├── admin/         # Páginas de administrador
│   └── user/          # Páginas de usuario
├── services/          # Servicios de API
├── types/            # Tipos TypeScript
├── utils/            # Utilidades
└── styles/           # Estilos globales
```

## 📱 Páginas y Rutas

### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de usuario

### Usuario Autenticado
- `/dashboard` - Panel principal
- `/events` - Catálogo de eventos
- `/events/:id` - Detalle de evento
- `/tickets` - Mis entradas
- `/profile` - Perfil personal

### Administrador
- `/admin` - Dashboard administrativo
- `/admin/events` - Gestión de eventos
- `/admin/users` - Gestión de usuarios
- `/admin/stats` - Estadísticas y reportes

## 🔐 Autenticación

El sistema utiliza JWT tokens para la autenticación:

1. **Login/Register** - Obtención del token
2. **Context Provider** - Manejo del estado global
3. **Protected Routes** - Rutas protegidas por rol
4. **API Interceptors** - Inyección automática del token
5. **Auto Logout** - Logout automático en errores 401

## 📊 Gestión de Estado

### AuthContext
```typescript
- user: User | null
- token: string | null
- isLoading: boolean
- isAuthenticated: boolean
```

### React Query
- Cache inteligente de datos
- Refetch automático
- Estados de loading optimizados
- Mutaciones con invalidación

## 🎯 Características UX

### Responsive Design
- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - sm, md, lg, xl
- **Navigation** - Sidebar colapsible en móvil
- **Cards** - Layout adaptativo

### Feedback Visual
- **Toast Notifications** - Mensajes de éxito/error
- **Loading States** - Spinners y skeletons
- **Hover Effects** - Interacciones visuales
- **Form Validation** - Validación en tiempo real

### Accesibilidad
- **Semantic HTML** - Estructura semántica
- **ARIA Labels** - Etiquetas de accesibilidad
- **Keyboard Navigation** - Navegación por teclado
- **Focus Management** - Manejo del foco

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_BASE_URL=http://localhost/api/v1
```

### Proxy de Desarrollo
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost',
      changeOrigin: true
    }
  }
}
```

## 📈 Performance

### Optimizaciones
- **Code Splitting** - Carga lazy de rutas
- **Bundle Optimization** - Vite optimizado
- **Image Optimization** - Lazy loading de imágenes
- **API Caching** - Cache con React Query

### Métricas
- **First Paint** < 1s
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 2s
- **Bundle Size** < 500kb gzipped

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch
```

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Preview de Build
```bash
npm run preview
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción  
- `npm run preview` - Preview del build
- `npm run lint` - Linting con ESLint
- `npm run type-check` - Verificación de tipos

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch de feature (`git checkout -b feature/amazing-feature`)
3. Commit de cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
