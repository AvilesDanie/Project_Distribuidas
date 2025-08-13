import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Ticket, 
  QrCode, 
  Download, 
  Eye, 
  X, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { ticketService } from '../services/ticketService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';

const TicketsPage: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery(
    'my-tickets',
    ticketService.getMyTickets
  );

  const cancelTicketMutation = useMutation(
    (ticketId: number) => ticketService.cancelTicket(ticketId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-tickets');
        Swal.fire({
          title: 'Ticket Cancelado',
          text: 'Tu ticket ha sido cancelado exitosamente',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      },
      onError: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.detail || 'Error al cancelar el ticket',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  );

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activa':
      case 'válida':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Activa</span>
          </span>
        );
      case 'cancelada':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
      case 'usada':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Usada</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelTicket = (ticket: any) => {
    Swal.fire({
      title: '¿Cancelar ticket?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Evento:</strong> ${ticket.evento_nombre}</p>
          <p class="mb-2"><strong>Código:</strong> ${ticket.codigo}</p>
          <p class="text-sm text-gray-600 mt-4">Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelTicketMutation.mutate(ticket.id);
      }
    });
  };

  const generateQRCode = (ticketCode: string): string => {
    // En un escenario real, esto sería generado por el backend
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black" opacity="0.1"/>
        <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">QR: ${ticketCode}</text>
      </svg>
    `)}`;
  };

  const TicketCard: React.FC<{ ticket: any }> = ({ ticket }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-lg">{ticket.evento_nombre}</h3>
            <p className="text-blue-100">Código: {ticket.codigo}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Ticket className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Precio</span>
            <span className="font-semibold text-blue-600">{formatPrice(ticket.precio)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estado</span>
            {getStatusBadge(ticket.estado)}
          </div>

          {ticket.fecha_evento && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fecha del evento</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(ticket.fecha_evento)}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setSelectedTicket(ticket);
              setShowQRModal(true);
            }}
            className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={ticket.estado?.toLowerCase() === 'cancelada'}
          >
            <QrCode className="w-4 h-4" />
            <span>Ver QR</span>
          </button>
          
          {ticket.estado?.toLowerCase() === 'activa' || ticket.estado?.toLowerCase() === 'válida' ? (
            <button 
              onClick={() => handleCancelTicket(ticket)}
              disabled={cancelTicketMutation.isLoading}
              className="flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {cancelTicketMutation.isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Cancelar</span>
            </button>
          ) : (
            <button 
              className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tickets</h1>
        <p className="text-gray-600">Gestiona tus tickets de eventos aquí</p>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes tickets</h3>
          <p className="text-gray-600 mb-6">Compra tickets para eventos y aparecerán aquí</p>
          <button 
            onClick={() => window.location.href = '/events'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorar Eventos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Código QR</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4 inline-block">
                <img 
                  src={generateQRCode(selectedTicket.codigo)}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{selectedTicket.evento_nombre}</h3>
              <p className="text-sm text-gray-600 mb-4">Código: {selectedTicket.codigo}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
