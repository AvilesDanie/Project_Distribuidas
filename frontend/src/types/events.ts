export interface Event {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  tipo: 'presencial' | 'virtual';
  aforo: number;
  estado: string;
  precio: number;
}

export interface EventFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  tipo: 'presencial' | 'virtual';
  aforo: number;
  precio: number;
}

export interface CreateEventRequest {
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  tipo: 'presencial' | 'virtual';
  aforo: number;
  precio: number;
}

export interface UpdateEventRequest {
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  categoria?: string;
  tipo?: 'presencial' | 'virtual';
  aforo?: number;
  precio?: number;
}

export interface EventSearchParams {
  categoria?: string;
  palabra?: string;
}

export interface EventStats {
  total_eventos: number;
  eventos_publicados: number;
  eventos_borradores: number;
  eventos_finalizados: number;
}

export interface EventSales {
  evento_id: number;
  evento_nombre: string;
  total_ventas: number;
  ingresos_totales: number;
}
