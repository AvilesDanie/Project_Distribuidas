import api from './api';

export interface Notification {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
}

export interface CreateNotificationRequest {
  usuario_id?: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
}

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const response = await api.get('/notificaciones/notificaciones/mis-notificaciones');
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notificaciones/notificaciones/contador-no-leidas');
    return response.data.count;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notificaciones/notificaciones/marcar-leida/${id}`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notificaciones/notificaciones/marcar-todas-leidas');
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notificaciones/notificaciones/delete/${id}`);
  },

  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    const response = await api.post('/notificaciones/notificaciones/crear', notificationData);
    return response.data;
  },

  async sendBroadcast(notificationData: Omit<CreateNotificationRequest, 'usuario_id'>): Promise<void> {
    await api.post('/notificaciones/notificaciones/broadcast', notificationData);
  },

  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get('/notificaciones/todas');
    return response.data;
  }
};
