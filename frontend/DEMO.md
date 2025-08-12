# 🎨 Encuentro - Demostración Visual

## 🏠 Página de Inicio (Login)

### Diseño Dividido
- **Panel Izquierdo**: Información de la plataforma con gradientes y animaciones
- **Panel Derecho**: Formulario de login con validación en tiempo real
- **Colores**: Azul primario (#0ea5e9) y púrpura secundario (#d946ef)
- **Tipografía**: Inter font para máxima legibilidad

```
┌─────────────────────┬─────────────────────┐
│   ENCUENTRO        │   🔐 Iniciar Sesión │
│   ═══════════      │                     │
│   🎉 Eventos       │   [Usuario______]   │
│   📱 Gestión       │   [Contraseña___]   │
│   🎫 Experiencias  │   [Iniciar Sesión]  │
└─────────────────────┴─────────────────────┘
```

## 📱 Dashboard Principal

### Layout Responsivo
- **Navbar**: Logo, notificaciones y perfil de usuario
- **Sidebar**: Navegación contextual por rol
- **Main Content**: Cards y estadísticas dinámicas

```
┌─────────────────────────────────────────────┐
│ Encuentro        🔔(3)  👤 Usuario  ⟳ Salir │
├────────────┬────────────────────────────────┤
│ 🏠 Dashboard│ ¡Hola Usuario! 👋             │
│ 📅 Eventos │ ┌─────┬─────┬─────┬─────┐     │
│ 🎫 Entradas│ │📅12│👥500│📈+15│⭐VIP│     │
│ 👤 Perfil  │ └─────┴─────┴─────┴─────┘     │
│            │ Próximos Eventos  Mis Entradas │
│ [ADMIN]    │ ┌─────────────┐ ┌───────────┐ │
│ 🛡️ Panel   │ │ Concierto   │ │ Entrada   │ │
│ 📊 Stats   │ │ Rock 2024   │ │ #A1B2C3   │ │
│ 👥 Users   │ └─────────────┘ └───────────┘ │
└────────────┴────────────────────────────────┘
```

## 🎪 Catálogo de Eventos

### Grid Responsivo con Filtros
- **Filtros**: Búsqueda, categoría, tipo (presencial/virtual)
- **Cards**: Imagen gradiente, información clave, botones de acción
- **Paginación**: Estados de carga y mensajes informativos

```
┌─────────────────────────────────────────────┐
│ 🔍[Buscar...] [Categoría▼] [Tipo▼] [Limpiar]│
├─────────────┬─────────────┬─────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌─────────────┐ │
│ │🎵GRADIENTE│ │🎭GRADIENTE│ │🍕GRADIENTE │ │
│ │Concierto  │ │Teatro     │ │Food Fest   │ │
│ │📅21/08/24 │ │📅23/08/24 │ │📅25/08/24 │ │
│ │👥500 pers.│ │👥200 pers.│ │👥1000 pers.│ │
│ │💲$50  [Ver]│ │💲$80  [Ver]│ │💲$30  [Ver]│ │
│ └───────────┘ └───────────┘ └─────────────┘ │
└─────────────────────────────────────────────┘
```

## 🎫 Mis Entradas

### Diseño de Tickets Digitales
- **Header Gradiente**: Información del evento
- **Código QR**: Para acceso al evento
- **Botones**: Descargar PDF, mostrar QR

```
┌─────────────────────────────────────────────┐
│              Mis Entradas (3)               │
├─────────────┬─────────────┬─────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌─────────────┐ │
│ │🎵GRADIENTE│ │🎭GRADIENTE│ │🍕GRADIENTE │ │
│ │Concierto  │ │Teatro     │ │Food Fest   │ │
│ │#A1B2C3D4E │ │#F5G6H7I8J │ │#K9L0M1N2O │ │
│ ├───────────┤ ├───────────┤ ├─────────────┤ │
│ │💲$50      │ │💲$80      │ │💲$30        │ │
│ │[📱QR][⬇PDF]│ │[📱QR][⬇PDF]│ │[📱QR][⬇PDF] │ │
│ └───────────┘ └───────────┘ └─────────────┘ │
└─────────────────────────────────────────────┘
```

## 🛡️ Panel de Administración

### Dashboard Administrativo
- **Métricas**: Cards con estadísticas clave
- **Acciones Rápidas**: Botones para funciones principales
- **Gráficos**: Visualización de datos (próximamente)

```
┌─────────────────────────────────────────────┐
│ 🛡️ Panel de Administración                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Gestiona eventos, usuarios y analytics  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────┬─────┬─────┬─────────────────────┐   │
│ │📅120│✅85 │👥450│💰$15,250            │   │
│ │Event│Publ.│User │Revenue              │   │
│ └─────┴─────┴─────┴─────────────────────┘   │
│ ┌─────────────────┐ ┌───────────────────┐   │
│ │ Acciones Rápidas│ │ Eventos Recientes │   │
│ │ ▶ Crear Evento  │ │ • Concierto Rock  │   │
│ │ ▶ Ver Stats     │ │ • Festival Food   │   │
│ │ ▶ Gestionar     │ │ • Teatro Musical  │   │
│ └─────────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🎨 Paleta de Colores

### Colores Principales
- **Primary**: Azul (`#0ea5e9`) - Botones principales, navegación
- **Secondary**: Púrpura (`#d946ef`) - Admin, destacados
- **Success**: Verde (`#10b981`) - Estados exitosos
- **Warning**: Amarillo (`#f59e0b`) - Alertas
- **Error**: Rojo (`#ef4444`) - Errores
- **Gray**: Grises (`#6b7280`) - Texto secundario

### Gradientes
- **Hero**: `from-primary-600 to-secondary-600`
- **Cards**: `from-primary-500 to-secondary-500`
- **Success**: `from-green-500 to-blue-500`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px - Sidebar colapsible, cards en 1 columna
- **Tablet**: 768px - 1024px - 2 columnas, navegación optimizada
- **Desktop**: > 1024px - Diseño completo, 3-4 columnas

### Animaciones
- **Page Transitions**: Fade in suave (0.5s)
- **Hover Effects**: Escalado sutil (1.02x)
- **Loading States**: Spinners y skeletons
- **Micro-interactions**: Botones con feedback visual

## 🔐 Estados de Autenticación

### Rutas Públicas
- Login/Register con diseño split-screen
- Landing page (futuro)

### Rutas Protegidas
- Dashboard contextual por rol
- Navegación dinámica según permisos
- Auto-logout en tokens expirados

## 📊 UX/UI Features

### Feedback Visual
- **Toast Notifications**: Mensajes no intrusivos
- **Loading States**: Spinners contextuales
- **Empty States**: Ilustraciones y llamadas a la acción
- **Error Boundaries**: Manejo elegante de errores

### Accesibilidad
- **Keyboard Navigation**: Navegación completa por teclado
- **ARIA Labels**: Etiquetas para screen readers
- **Color Contrast**: Cumple con WCAG 2.1 AA
- **Focus Management**: Indicadores visuales claros
