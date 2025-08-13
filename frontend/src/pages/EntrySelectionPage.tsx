import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Ticket, 
  Users,
  Plus,
  Minus,
  CreditCard,
  Shuffle,
  Check,
  Calendar,
  MapPin,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import { getImageUrl } from '../utils/imageUtils';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';

interface SelectedEntry {
  entryId: string;
  quantity: number;
}

const EntrySelectionPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedEntries, setSelectedEntries] = useState<SelectedEntry[]>([]);

  const { data: event, isLoading: eventLoading } = useQuery(
    ['event', eventId],
    () => eventService.getById(Number(eventId)),
    { enabled: !!eventId }
  );

  const { data: availableTickets, isLoading: ticketsLoading } = useQuery(
    ['available-tickets', eventId],
    () => ticketService.getAvailableTickets(Number(eventId)),
    { enabled: !!eventId }
  );

  const purchaseTicketMutation = useMutation(
    (data: { eventoId: number; entradas: SelectedEntry[] }) => 
      ticketService.purchaseTickets(data.eventoId, data.entradas),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tickets']);
        queryClient.invalidateQueries(['my-tickets']);
        queryClient.invalidateQueries(['available-tickets']);
        
        Swal.fire({
          title: '¡Compra Exitosa! 🎉',
          text: 'Tus entradas han sido compradas. Revisa tu email para los detalles.',
          icon: 'success',
          confirmButtonText: 'Ver mis entradas',
          confirmButtonColor: '#3B82F6',
          background: '#1F2937',
          color: '#F3F4F6'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/tickets');
          } else {
            navigate('/events');
          }
        });
      },
      onError: (error: any) => {
        Swal.fire({
          title: 'Error en la compra',
          text: error.response?.data?.detail || 'No se pudo completar la compra',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444',
          background: '#1F2937',
          color: '#F3F4F6'
        });
      }
    }
  );

  const handleQuantityChange = (entryId: string, quantity: number) => {
    setSelectedEntries(prev => {
      const existingIndex = prev.findIndex(item => item.entryId === entryId);
      
      if (quantity === 0) {
        return prev.filter(item => item.entryId !== entryId);
      }
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { entryId, quantity };
        return updated;
      } else {
        return [...prev, { entryId, quantity }];
      }
    });
  };

  const handleRandomSelection = () => {
    if (!availableTickets || availableTickets.length === 0) return;
    
    // Seleccionar aleatoriamente entre 1 y 3 entradas
    const randomCount = Math.floor(Math.random() * 3) + 1;
    const availableTicketsList = availableTickets.slice(0, Math.min(randomCount, availableTickets.length));
    
    const randomEntries = availableTicketsList.map(ticket => ({
      entryId: ticket.id.toString(),
      quantity: 1
    }));
    
    setSelectedEntries(randomEntries);
    
    Swal.fire({
      title: '¡Selección Aleatoria! 🎲',
      text: `Se han seleccionado ${randomEntries.length} entrada(s) al azar`,
      icon: 'info',
      confirmButtonColor: '#3B82F6',
      background: '#1F2937',
      color: '#F3F4F6',
      timer: 2000
    });
  };

  const getSelectedQuantity = (entryId: string): number => {
    const selected = selectedEntries.find(item => item.entryId === entryId);
    return selected ? selected.quantity : 0;
  };

  const getTotalQuantity = (): number => {
    return selectedEntries.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (): number => {
    if (!availableTickets) return 0;
    return selectedEntries.reduce((total, item) => {
      const ticket = availableTickets.find(t => t.id.toString() === item.entryId);
      return total + (item.quantity * (ticket?.precio || event?.precio || 0));
    }, 0);
  };

  const handlePurchase = () => {
    if (selectedEntries.length === 0) {
      Swal.fire({
        title: 'Selecciona entradas',
        text: 'Debes seleccionar al menos una entrada para continuar',
        icon: 'warning',
        confirmButtonColor: '#F59E0B',
        background: '#1F2937',
        color: '#F3F4F6'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar compra?',
      html: `
        <div class="text-left" style="color: #F3F4F6;">
          <p class="mb-2"><strong>Evento:</strong> ${event?.titulo}</p>
          <p class="mb-2"><strong>Cantidad:</strong> ${getTotalQuantity()} entradas</p>
          <p class="mb-2"><strong>Total:</strong> $${getTotalPrice().toLocaleString()}</p>
          <p class="text-sm text-gray-400 mt-4">Se procesará el pago y recibirás las entradas por email</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Proceder al pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      background: '#1F2937',
      color: '#F3F4F6'
    }).then((result) => {
      if (result.isConfirmed && event) {
        purchaseTicketMutation.mutate({
          eventoId: Number(event.id),
          entradas: selectedEntries
        });
      }
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (eventLoading || ticketsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#111827]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12 bg-[#111827] min-h-screen text-white">
        <h2 className="text-2xl font-bold text-white mb-4">Evento no encontrado</h2>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a Eventos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827]">
      {/* Header */}
      <div className="bg-[#1f2937] shadow-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/events')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Seleccionar Entradas</h1>
                <p className="text-gray-400">{event.titulo}</p>
              </div>
            </div>
            
            {/* Botón de selección aleatoria */}
            {availableTickets && availableTickets.length > 0 && (
              <button
                onClick={handleRandomSelection}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Selección Aleatoria</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Event Summary */}
        <div className="bg-[#1f2937] rounded-xl p-6 mb-8 shadow-sm border border-gray-700">
          <div className="flex items-start space-x-4">
            {event.imagen_url && (
              <img 
                src={getImageUrl(event.imagen_url) || event.imagen_url} 
                alt={event.titulo}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{event.titulo}</h2>
              <p className="text-gray-400 mb-3">{event.descripcion}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Ticket className="w-4 h-4" />
                  <span>{event.categoria}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Aforo: {event.aforo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.tipo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tickets */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white mb-0">Entradas Disponibles</h3>
            <button
              onClick={handleRandomSelection}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <Shuffle className="w-4 h-4" />
              <span>Selección Aleatoria</span>
            </button>
          </div>
          
          {!availableTickets || availableTickets.length === 0 ? (
            <div className="text-center py-12 bg-[#1f2937] rounded-xl border border-gray-700">
              <Ticket className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Sin entradas disponibles</h3>
              <p className="text-gray-500">No hay entradas disponibles para este evento en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTickets.map((ticket, index) => {
                const isSelected = selectedEntries.some(entry => entry.entryId === ticket.id.toString());
                
                return (
                  <div 
                    key={ticket.id} 
                    className={`relative bg-[#1f2937] rounded-xl p-6 shadow-lg border transition-all duration-200 cursor-pointer transform hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/30' 
                        : 'border-gray-700 hover:border-blue-400'
                    }`}
                    onClick={() => handleQuantityChange(ticket.id.toString(), isSelected ? 0 : 1)}
                  >
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-gray-400 font-medium">Entrada #{ticket.codigo?.slice(-6) || ticket.id.toString().slice(-6)}</span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Ticket Content */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Evento:</span>
                        <span className="text-white font-medium">{ticket.evento_nombre || event?.titulo}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Precio:</span>
                        <span className="text-green-400 font-bold text-lg">${ticket.precio?.toLocaleString() || event?.precio?.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Estado:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Disponible
                        </span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none"></div>
                    )}
                    
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-600/20 rounded-tr-xl"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase Summary */}
        {selectedEntries.length > 0 && (
          <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Resumen de Compra</h3>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total entradas: {getTotalQuantity()}</p>
                <p className="text-2xl font-bold text-green-400">{formatPrice(getTotalPrice())}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {selectedEntries.map((selected) => {
                const ticket = availableTickets?.find(t => t.id.toString() === selected.entryId);
                return (
                  <div key={selected.entryId} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                    <span className="text-gray-300">Entrada #{selected.entryId} x{selected.quantity}</span>
                    <span className="text-white font-semibold">
                      {formatPrice(selected.quantity * (ticket?.precio || event.precio))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedEntries([])}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpiar selección
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchaseTicketMutation.isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {purchaseTicketMutation.isLoading ? 'Procesando...' : 'Proceder al Pago'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="mt-8 bg-[#1f2937] rounded-xl p-6 border border-gray-700">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p className="mb-2">
                <strong className="text-gray-200">Información importante:</strong>
              </p>
              <ul className="space-y-1 text-gray-400">
                <li>• Las entradas se entregarán por correo electrónico</li>
                <li>• Cada entrada incluye un código QR único</li>
                <li>• Los pagos son procesados de forma segura</li>
                <li>• Puedes cancelar tu entrada hasta 24 horas antes del evento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrySelectionPage;
