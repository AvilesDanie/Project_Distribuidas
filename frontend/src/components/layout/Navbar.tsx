import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { notificationService } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Obtener notificaciones del usuario
  const { data: notifications = [] } = useQuery(
    ['user-notifications'],
    () => notificationService.getMyNotifications(),
    {
      enabled: !!state.user,
      refetchInterval: 3000, // Refrescar cada 3 segundos para ser imperceptible
      refetchIntervalInBackground: true, // Continuar refrescando en background
    }
  );

  const unreadCount = notifications.filter(n => !n.leida).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatNotificationTime = (dateString: string): string => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 fixed w-full top-0 z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Encuentro
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-gray-300">
              <span className="text-sm">Plataforma de Eventos</span>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar eventos, usuarios..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Botón de búsqueda móvil */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => notificationService.markAllAsRead()}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification: any) => (
                          <div key={notification.id} className={`p-3 rounded-lg ${
                            notification.leida ? 'bg-gray-700' : 'bg-blue-900/30 border border-blue-700'
                          }`}>
                            <p className="text-white text-sm">{notification.mensaje}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {formatNotificationTime(notification.fecha_creacion)}
                            </p>
                            {!notification.leida && (
                              <button
                                onClick={() => notificationService.markAsRead(notification.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                              >
                                Marcar como leída
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-400">
                          <p className="text-sm">No tienes notificaciones</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Ver todas las notificaciones ({notifications.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Perfil del usuario */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{state.user?.usuario}</p>
                  <p className="text-xs text-gray-400 capitalize">{state.user?.rol}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Dropdown del perfil */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{state.user?.usuario}</p>
                        <p className="text-gray-400 text-sm">{state.user?.email}</p>
                        <span className="inline-block px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full mt-1 capitalize">
                          {state.user?.rol}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </button>
                      <button 
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </button>
                      <hr className="border-gray-700 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
