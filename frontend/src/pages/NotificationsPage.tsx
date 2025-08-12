import React from 'react';
import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  // Simulamos datos de notificaciones ya que el endpoint real no está implementado
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Nuevo evento disponible',
      message: 'Se ha publicado un nuevo evento: "Concierto de Jazz en el Teatro Principal"',
      type: 'info',
      read: false,
      created_at: '2025-08-11T10:30:00Z'
    },
    {
      id: 2,
      title: 'Entrada confirmada',
      message: 'Tu entrada para "Teatro Musical" ha sido confirmada exitosamente',
      type: 'success',
      read: false,
      created_at: '2025-08-10T15:45:00Z'
    },
    {
      id: 3,
      title: 'Recordatorio de evento',
      message: 'Tu evento "Festival Gastronómico" comenzará mañana a las 19:00',
      type: 'warning',
      read: true,
      created_at: '2025-08-09T09:00:00Z'
    },
    {
      id: 4,
      title: 'Actualización de perfil',
      message: 'Tu información de perfil ha sido actualizada correctamente',
      type: 'success',
      read: true,
      created_at: '2025-08-08T14:20:00Z'
    },
    {
      id: 5,
      title: 'Evento cancelado',
      message: 'El evento "Concierto al aire libre" ha sido cancelado debido al clima',
      type: 'error',
      read: true,
      created_at: '2025-08-07T11:15:00Z'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Bell className="w-8 h-8 mr-3" />
              Notificaciones
            </h1>
            <p className="text-gray-300 mt-1">
              Mantente al día con todas las actualizaciones
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Sin leer</p>
            <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-full text-lg font-bold">
              {unreadCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Todas
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            Sin leer
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            Importantes
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            Eventos
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-gray-700 ${getNotificationBorder(notification.type)} ${
              !notification.read ? 'bg-gray-750' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                    {notification.title}
                    {!notification.read && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className={`mt-2 ${!notification.read ? 'text-gray-300' : 'text-gray-400'}`}>
                  {notification.message}
                </p>
                {!notification.read && (
                  <div className="mt-4 flex space-x-3">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Marcar como leída
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones masivas */}
      <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Marcar todas como leídas
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Eliminar seleccionadas
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            Configurar notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
