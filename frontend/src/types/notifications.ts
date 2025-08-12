export interface Notification {
  id: number;
  tipo: 'admin' | 'evento' | 'evento_finalizado' | 'compra';
  mensaje: string;
  receptor: string;
  fecha: string;
  leida: boolean;
}

export interface CreateNotificationRequest {
  tipo: 'admin' | 'evento' | 'evento_finalizado' | 'compra';
  mensaje: string;
  receptor: string;
}
