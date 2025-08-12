import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Ticket, 
  User, 
  Settings, 
  Shield, 
  BarChart3,
  Users,
  Plus,
  Eye,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { state } = useAuth();
  const isAdmin = state.user?.rol === 'administrador';

  const userMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Eventos', path: '/events' },
    { icon: Ticket, label: 'Mis Entradas', path: '/tickets' },
    { icon: User, label: 'Perfil', path: '/profile' },
    { icon: Bell, label: 'Notificaciones', path: '/notifications' },
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Panel Admin', path: '/admin' },
    { icon: Calendar, label: 'Gestión Eventos', path: '/admin/events' },
    { icon: Users, label: 'Usuarios', path: '/admin/users' },
    { icon: BarChart3, label: 'Estadísticas', path: '/admin/stats' },
    { icon: Settings, label: 'Configuración', path: '/admin/settings' },
  ];

  const adminActions = [
    { icon: Plus, label: 'Crear Evento', path: '/admin/events/create', color: 'text-green-400 hover:text-green-300' },
    { icon: Plus, label: 'Crear Usuario', path: '/admin/users/create', color: 'text-blue-400 hover:text-blue-300' },
    { icon: Eye, label: 'Ver Reportes', path: '/admin/reports', color: 'text-purple-400 hover:text-purple-300' },
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-gray-800 shadow-lg border-r border-gray-700 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {/* Menú de usuario */}
          {userMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Menú de administración */}
          {isAdmin && (
            <>
              <div className="pt-6 pb-3">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administración
                </h3>
              </div>
              {adminMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}

              {/* Acciones rápidas de administrador */}
              <div className="pt-6 pb-3">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Acciones Rápidas
                </h3>
              </div>
              {adminActions.map((action) => (
                <NavLink
                  key={action.path}
                  to={action.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${action.color} hover:bg-gray-700`}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Información del usuario */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="px-4 py-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{state.user?.usuario}</p>
                  <p className="text-gray-400 text-xs capitalize">{state.user?.rol}</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};
