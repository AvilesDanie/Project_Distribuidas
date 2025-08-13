import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>(
    ['user-notifications'],
    () => notificationService.getMyNotifications(),
    {
      refetchInterval: 3000, // Actualizar cada 3 segundos para ser imperceptible
      refetchIntervalInBackground: true, // Continuar refrescando en background
    }
  );

  const markAsReadMutation = useMutation(
    (id: number) => notificationService.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-notifications']);
      }
    }
  );

  const markAllAsReadMutation = useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-notifications']);
      }
    }
  );

  const deleteNotificationMutation = useMutation(
    (id: number) => notificationService.deleteNotification(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-notifications']);
      }
    }
  );

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.leida;
    return true;
  });

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

  const unreadCount = notifications.filter(n => !n.leida).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Sin leer
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-gray-700 ${getNotificationBorder(notification.tipo)} ${
              !notification.leida ? 'bg-gray-750' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${!notification.leida ? 'text-white' : 'text-gray-300'}`}>
                    {notification.titulo}
                    {!notification.leida && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {formatDate(notification.fecha_creacion)}
                  </span>
                </div>
                <p className={`mt-2 ${!notification.leida ? 'text-gray-300' : 'text-gray-400'}`}>
                  {notification.mensaje}
                </p>
                {!notification.leida && (
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Marcar como leída
                    </button>
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
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
