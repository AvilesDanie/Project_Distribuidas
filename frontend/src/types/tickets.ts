export interface Ticket {
  id: number;
  codigo: string;
  evento_id: number;
  usuario_id?: number;
  precio: number;
  evento_nombre?: string;
}

export interface PurchaseTicketRequest {
  evento_id: number;
  cantidad: number;
}
