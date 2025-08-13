import api from './api';
import { Ticket, PurchaseTicketRequest } from '../types/tickets';

export const ticketService = {
  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get('/entradas/entradas/mis-entradas');
    return response.data;
  },

  async getUserTicketHistory(userId: number): Promise<Ticket[]> {
    const response = await api.get(`/entradas/entradas/historial-usuario/${userId}`);
    return response.data;
  },

  async getAvailableTickets(eventoId: number): Promise<Ticket[]> {
    const response = await api.get(`/entradas/entradas/get-disponibles/${eventoId}`);
    return response.data;
  },

  async getUnavailableTickets(eventoId: number): Promise<Ticket[]> {
    const response = await api.get(`/entradas/entradas/get-nodisponibles/${eventoId}`);
    return response.data;
  },

  async getEventByTicket(ticketId: number): Promise<any> {
    const response = await api.get(`/entradas/entradas/evento-por-entrada/${ticketId}`);
    return response.data;
  },

  async purchaseTicket(purchaseData: PurchaseTicketRequest): Promise<void> {
    const response = await api.put(`/entradas/entradas/comprar-entrada-evento/${purchaseData.evento_id}`, {
      cantidad: purchaseData.cantidad
    });
    return response.data;
  },

  async getAllTickets(): Promise<Ticket[]> {
    const response = await api.get('/entradas/entradas/get-todas');
    return response.data;
  },

  async getTicketsByEvent(eventoId: number): Promise<Ticket[]> {
    const response = await api.get(`/entradas/entradas/get-por-evento/${eventoId}`);
    return response.data;
  },

  async getTicketSales(): Promise<any[]> {
    const response = await api.get('/entradas/entradas/estadisticas-ventas');
    return response.data;
  },

  async cancelTicket(ticketId: number): Promise<void> {
    const response = await api.put(`/entradas/entradas/cancelar/${ticketId}`);
    return response.data;
  },

  async purchaseTickets(eventoId: number, entradas: any[]): Promise<any> {
    const response = await api.post('/entradas/entradas/comprar', {
      evento_id: eventoId,
      entradas: entradas
    });
    return response.data;
  }
};
