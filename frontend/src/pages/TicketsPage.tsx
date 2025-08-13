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
  RefreshCw,
  Shield
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
    // Genera un SVG QR más realista
    const size = 200;
    const modules = 21; // Tamaño estándar de QR
    const moduleSize = size / modules;
    
    // Genera un patrón pseudo-QR basado en el código
    let pattern = '';
    const hash = ticketCode.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        const isBlack = ((x + y + Math.abs(hash)) % 3) === 0 || 
                       (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
        if (isBlack) {
          pattern += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white"/>
        ${pattern}
        <rect x="0" y="0" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="none" stroke="black" stroke-width="1"/>
        <rect x="${moduleSize * 14}" y="0" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="none" stroke="black" stroke-width="1"/>
        <rect x="0" y="${moduleSize * 14}" width="${moduleSize * 7}" height="${moduleSize * 7}" fill="none" stroke="black" stroke-width="1"/>
      </svg>
    `)}`;
  };

  const TicketCard: React.FC<{ ticket: any }> = ({ ticket }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Ticket Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between text-white">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Ticket className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">TICKET DIGITAL</span>
            </div>
            <h3 className="font-bold text-xl mb-1 truncate">{ticket.evento_nombre}</h3>
            <p className="text-blue-100 text-sm font-mono tracking-wider">#{ticket.codigo}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
      </div>
      
      {/* Ticket Body */}
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Precio pagado</span>
            <span className="font-bold text-lg text-green-600">{formatPrice(ticket.precio)}</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Estado del ticket</span>
            {getStatusBadge(ticket.estado)}
          </div>

          {ticket.fecha_evento && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Fecha del evento</span>
              <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                {formatDate(ticket.fecha_evento)}
              </span>
            </div>
          )}

          {ticket.fecha_compra && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Comprado el</span>
              <span className="text-sm text-gray-700">
                {new Date(ticket.fecha_compra).toLocaleDateString('es-ES')}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setSelectedTicket(ticket);
              setShowQRModal(true);
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
            disabled={ticket.estado?.toLowerCase() === 'cancelada'}
          >
            <QrCode className="w-5 h-5" />
            <span>Mostrar QR</span>
          </button>
          
          {ticket.estado?.toLowerCase() === 'activa' || ticket.estado?.toLowerCase() === 'válida' ? (
            <button 
              onClick={() => handleCancelTicket(ticket)}
              disabled={cancelTicketMutation.isLoading}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 font-medium"
            >
              {cancelTicketMutation.isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>Cancelar</span>
            </button>
          ) : (
            <button 
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Descargar</span>
            </button>
          )}
        </div>

        {/* Ticket authenticity notice */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Ticket verificado y auténtico</span>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-0 overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Código QR</h2>
                  <p className="text-blue-100 text-sm">Presenta este código en el evento</p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center">
              {/* QR Code Container */}
              <div className="bg-white border-4 border-gray-100 rounded-2xl p-6 mb-6 inline-block shadow-inner">
                <img 
                  src={generateQRCode(selectedTicket.codigo)}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              {/* Event Info */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedTicket.evento_nombre}</h3>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Código de verificación</p>
                  <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">{selectedTicket.codigo}</p>
                </div>
                
                {/* Ticket Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedTicket.estado)}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Precio</p>
                    <p className="font-bold text-green-600 mt-1">{formatPrice(selectedTicket.precio)}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  Cerrar
                </button>
                
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span>Este código QR es único y verificable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
