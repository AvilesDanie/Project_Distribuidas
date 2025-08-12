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
    const response = await api.post('/eventos/eventos/post-evento', eventData);
    return response.data;
  },

  async getPublishedEvents(): Promise<Event[]> {
    const response = await api.get('/eventos/eventos/get-eventospublicados');
    return response.data;
  },

  async getAllEvents(): Promise<Event[]> {
    // Agregar timestamp para evitar caché del navegador
    const timestamp = Date.now();
    const response = await api.get(`/eventos/eventos/get-eventos?_t=${timestamp}`);
    console.log('API Response getAllEvents:', response.data);
    return response.data;
  },

  async getPublishedEventById(id: number): Promise<Event> {
    const response = await api.get(`/eventos/eventos/get-eventopublicado/${id}`);
    return response.data;
  },

  async getEventById(id: number): Promise<Event> {
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

  async getSales(eventoId?: number): Promise<EventSales[]> {
    const params = eventoId ? `?evento_id=${eventoId}` : '';
    const response = await api.get(`/eventos/eventos/ventas${params}`);
    return response.data;
  },

  async updateEvent(id: number, eventData: UpdateEventRequest): Promise<Event> {
    const response = await api.put(`/eventos/eventos/update-evento/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/eventos/eventos/delete-evento/${id}`);
  },

  async publishEvent(id: number): Promise<Event> {
    console.log('Publishing event with ID:', id);
    try {
      const response = await api.put(`/eventos/eventos/publicar-evento/${id}`);
      console.log('Publish response:', response.data);
      if (response.data === null) {
        throw new Error('No se puede publicar: el evento ya está publicado o no existe.');
      }
      return response.data;
    } catch (error: any) {
      console.error('Publish event error details:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  async cancelEvent(id: number): Promise<Event> {
    const response = await api.put(`/eventos/eventos/cancelar-evento/${id}`);
    return response.data;
  }
};
