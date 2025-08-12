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

  // Esta función será implementada cuando se agregue la funcionalidad de compra
  async purchaseTicket(purchaseData: PurchaseTicketRequest): Promise<void> {
    // TODO: Implementar cuando esté disponible en el backend
    console.log('Función de compra pendiente de implementación', purchaseData);
    throw new Error('Funcionalidad de compra no implementada aún');
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
  }
};
