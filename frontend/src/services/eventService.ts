import api from './api';
import { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventSearchParams, 
  EventStats, 
  EventSales 
} from '../types/events';

export const eventService = {
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    console.log('🔍 Frontend createEvent called with:', eventData);
    const response = await api.post('/eventos/eventos/post-evento', eventData);
    console.log('✅ Create response:', response.data);
    return response.data;
  },

  async getPublishedEvents(): Promise<Event[]> {
    console.log('🔍 Frontend: Solicitando eventos publicados...');
    const response = await api.get('/eventos/eventos/get-eventospublicados');
    console.log('✅ Frontend: Eventos publicados recibidos:', response.data);
    return response.data;
  },

  async getAllEvents(): Promise<Event[]> {
    // Agregar timestamp para evitar caché del navegador
    const timestamp = Date.now();
    const response = await api.get(`/eventos/eventos/get-eventos?_t=${timestamp}`);
    console.log('API Response getAllEvents:', response.data);
    return response.data;
  },

  async getPublishedEventById(id: number | string): Promise<Event> {
    const response = await api.get(`/eventos/eventos/get-eventopublicado/${id}`);
    return response.data;
  },

  async getEventById(id: number | string): Promise<Event> {
    const response = await api.get(`/eventos/eventos/get-evento/${id}`);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/eventos/eventos/get-categorias');
    return response.data;
  },

  async searchEvents(params: EventSearchParams): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params.categoria) queryParams.append('categoria', params.categoria);
    if (params.palabra) queryParams.append('palabra', params.palabra);
    
    const response = await api.get(`/eventos/eventos/buscar-eventos?${queryParams}`);
    return response.data;
  },

  async getStatistics(): Promise<EventStats> {
    const response = await api.get('/eventos/eventos/estadisticas');
    return response.data;
  },

  async getSales(eventoId?: number | string): Promise<EventSales[]> {
    const params = eventoId ? `?evento_id=${eventoId}` : '';
    const response = await api.get(`/eventos/eventos/ventas${params}`);
    return response.data;
  },

  async updateEvent(id: number | string, eventData: UpdateEventRequest): Promise<Event> {
    console.log('🔍 Frontend updateEvent called with:', { id, eventData });
    console.log('🔍 ID type:', typeof id, 'ID value:', id);
    const response = await api.put(`/eventos/eventos/update-evento/${id}`, eventData);
    console.log('✅ Update response:', response.data);
    return response.data;
  },

  async deleteEvent(id: number | string): Promise<void> {
    try {
      await api.delete(`/eventos/eventos/delete-evento/${id}`);
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message;
        
        if (status === 404) {
          throw new Error('Evento no encontrado');
        } else if (status === 400) {
          throw new Error(message || 'No se puede eliminar: el evento está publicado');
        } else {
          throw new Error(message || 'Error al eliminar el evento');
        }
      }
      
      throw new Error('Error de conexión al eliminar el evento');
    }
  },

  async publishEvent(id: number | string): Promise<Event> {
    try {
      const response = await api.put(`/eventos/eventos/publicar-evento/${id}`);
      
      // Si la respuesta es exitosa pero sin datos, significa que el evento no existe o ya está publicado
      if (!response.data) {
        throw new Error('No se puede publicar: el evento ya está publicado o no existe.');
      }
      
      return response.data;
    } catch (error: any) {
      // Si es un error de respuesta del servidor
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message;
        
        if (status === 404) {
          throw new Error('Evento no encontrado');
        } else if (status === 400) {
          throw new Error(message || 'El evento ya está publicado o no puede ser publicado');
        } else {
          throw new Error(message || 'Error al publicar el evento');
        }
      }
      
      throw new Error('Error de conexión al publicar el evento');
    }
  },

  async cancelEvent(id: number | string): Promise<Event> {
    try {
      const response = await api.put(`/eventos/eventos/cancelar-evento/${id}`);
      
      if (!response.data) {
        throw new Error('No se puede cancelar: el evento no existe.');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.response.data?.message;
        
        if (status === 404) {
          throw new Error('Evento no encontrado');
        } else if (status === 400) {
          throw new Error(message || 'El evento no puede ser cancelado');
        } else {
          throw new Error(message || 'Error al cancelar el evento');
        }
      }
      
      throw new Error('Error de conexión al cancelar el evento');
    }
  },

  // Alias para compatibilidad
  async getById(id: number | string): Promise<Event> {
    return this.getEventById(id);
  }
};
