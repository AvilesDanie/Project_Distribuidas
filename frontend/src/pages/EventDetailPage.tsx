import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  DollarSign,
  Tag,
  Star,
  Share2,
  Heart,
  Ticket,
  X,
  Plus,
  Minus,
  CreditCard,
  CheckCircle,
  Eye
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import { getImageUrl } from '../utils/imageUtils';
import { Event } from '../types/events';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';

interface EntryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  total: number;
}

interface SelectedEntry {
  entryId: string;
  quantity: number;
  price: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<SelectedEntry[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Simulamos las opciones de entrada para el demo
  const entryOptions: EntryOption[] = [
    {
      id: 'general',
      name: 'Entrada General',
      description: 'Acceso general al evento con todas las comodidades básicas',
      price: 25000,
      available: 150,
      total: 200
    },
    {
      id: 'vip',
      name: 'Entrada VIP',
      description: 'Acceso VIP con zona preferencial, bebida de bienvenida y parking',
      price: 45000,
      available: 25,
      total: 50
    },
    {
      id: 'estudiante',
      name: 'Entrada Estudiante',
      description: 'Tarifa especial para estudiantes (requiere carnet estudiantil)',
      price: 15000,
      available: 75,
      total: 100
    }
  ];

  const { data: event, isLoading, error } = useQuery<Event>(
    ['event', id],
    () => eventService.getById(Number(id)),
    {
      enabled: !!id,
    }
  );

  const purchaseTicketMutation = useMutation(
    (data: { eventoId: number; entradas: SelectedEntry[] }) => 
      ticketService.purchaseTickets(data.eventoId, data.entradas),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tickets']);
        queryClient.invalidateQueries(['event', id]);
        
        Swal.fire({
          title: '¡Compra Exitosa!',
          text: 'Tus entradas han sido compradas correctamente',
          icon: 'success',
          confirmButtonText: 'Ver mis tickets',
          confirmButtonColor: '#10B981'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/tickets');
          } else {
            setShowEntryModal(false);
            setSelectedEntries([]);
          }
        });
      },
      onError: (error: any) => {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.detail || 'Error al comprar las entradas',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  );

  const handleRandomSelection = () => {
    const availableTypes = entryOptions.filter(entry => entry.available > 0);
    if (availableTypes.length === 0) return;

    // Selecciona un tipo al azar
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Selecciona una cantidad aleatoria entre 1 y 3
    const randomQuantity = Math.min(
      Math.floor(Math.random() * 3) + 1,
      randomType.available
    );

    setSelectedEntries([{
      entryId: randomType.id,
      quantity: randomQuantity,
      price: randomType.price
    }]);

    Swal.fire({
      title: '¡Sorpresa! 🎲',
      html: `
        <div class="text-center">
          <p class="mb-4">Te hemos seleccionado:</p>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="font-bold text-lg text-blue-700">${randomQuantity}x ${randomType.name}</p>
            <p class="text-sm text-gray-600">${randomType.description}</p>
            <p class="font-bold text-xl mt-2 text-green-600">$${(randomQuantity * randomType.price).toLocaleString()}</p>
          </div>
        </div>
      `,
      icon: 'success',
      confirmButtonText: '¡Me gusta!',
      showCancelButton: true,
      cancelButtonText: 'Elegir otra',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (!result.isConfirmed) {
        setSelectedEntries([]);
      }
    });
  };

  const handleEntryQuantityChange = (entryId: string, quantity: number, price: number) => {
    setSelectedEntries(prev => {
      const existingIndex = prev.findIndex(item => item.entryId === entryId);
      
      if (quantity === 0) {
        return prev.filter(item => item.entryId !== entryId);
      }
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { entryId, quantity, price };
        return updated;
      } else {
        return [...prev, { entryId, quantity, price }];
      }
    });
  };

  const getSelectedQuantity = (entryId: string): number => {
    const selected = selectedEntries.find(item => item.entryId === entryId);
    return selected ? selected.quantity : 0;
  };

  const getTotalPrice = (): number => {
    return selectedEntries.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const getTotalQuantity = (): number => {
    return selectedEntries.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePurchase = () => {
    if (selectedEntries.length === 0) {
      Swal.fire({
        title: 'Selecciona entradas',
        text: 'Debes seleccionar al menos una entrada para continuar',
        icon: 'warning',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar compra?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Evento:</strong> ${event?.titulo}</p>
          <p class="mb-2"><strong>Cantidad:</strong> ${getTotalQuantity()} entradas</p>
          <p class="mb-2"><strong>Total:</strong> $${getTotalPrice().toLocaleString()}</p>
          <p class="text-sm text-gray-600 mt-4">Se procesará el pago y recibirás las entradas por email</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Comprar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280'
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar el evento</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Image */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
          {event.imagen_url ? (
            <img
              src={getImageUrl(event.imagen_url) || event.imagen_url}
              alt={event.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-white">
              <Calendar className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold opacity-75">Imagen del evento</p>
            </div>
          )}
        </div>
        
        {/* Event Status Badge */}
        <div className="absolute top-6 right-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            event.estado === 'PUBLICADO' 
              ? 'bg-green-100 text-green-800' 
              : event.estado === 'FINALIZADO'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {event.estado}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <Tag className="w-4 h-4" />
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {event.categoria}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  {event.tipo}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.titulo}</h1>
              
              <div className="flex items-center space-x-4 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">4.8</span>
                  <span className="text-sm">(124 reseñas)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{event.aforo} personas</span>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Descripción del evento</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {event.descripcion}
                </p>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Fecha y hora</h3>
                </div>
                <p className="text-gray-700">{formatDate(event.fecha)}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
                </div>
                <p className="text-gray-700">
                  {event.tipo === 'presencial' ? 'Ubicación por confirmar' : 'Evento virtual'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Capacidad</h3>
                </div>
                <p className="text-gray-700">{event.aforo} personas</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Precio base</h3>
                </div>
                <p className="text-gray-700">{formatPrice(event.precio)}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg border sticky top-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  Desde {formatPrice(event.precio)}
                </p>
                <p className="text-gray-600">por persona</p>
              </div>

              {event.estado === 'PUBLICADO' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEntryModal(true)}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>Comprar Entradas</span>
                  </button>
                  
                  <button
                    onClick={handleRandomSelection}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>🎲 Sorpréndeme</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/events/${event.id}/entries`)}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-3 px-6 rounded-lg font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Entradas Detalladas</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 font-medium">
                    {event.estado === 'FINALIZADO' ? 'Evento finalizado' : 'Evento no disponible'}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Disponibilidad:</span>
                  <span className="font-medium">Alta</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Confirmación:</span>
                  <span className="font-medium">Inmediata</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Cancelación:</span>
                  <span className="font-medium">Hasta 24h antes</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información adicional</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Entrada digital</p>
                    <p className="text-sm text-gray-600">Recibe tu ticket por email</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Soporte 24/7</p>
                    <p className="text-sm text-gray-600">Ayuda cuando la necesites</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Política de devolución</p>
                    <p className="text-sm text-gray-600">Hasta 48 horas antes del evento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Selection Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seleccionar Entradas</h2>
                <p className="text-gray-600 mt-1">{event.titulo}</p>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Entry Options */}
            <div className="p-6 space-y-6">
              {entryOptions.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{entry.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{entry.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Disponibles: {entry.available - getSelectedQuantity(entry.id)}/{entry.total}</span>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(entry.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          const current = getSelectedQuantity(entry.id);
                          if (current > 0) {
                            handleEntryQuantityChange(entry.id, current - 1, entry.price);
                          }
                        }}
                        disabled={getSelectedQuantity(entry.id) === 0}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center font-semibold text-lg">
                        {getSelectedQuantity(entry.id)}
                      </span>
                      
                      <button
                        onClick={() => {
                          const current = getSelectedQuantity(entry.id);
                          if (current < entry.available) {
                            handleEntryQuantityChange(entry.id, current + 1, entry.price);
                          }
                        }}
                        disabled={getSelectedQuantity(entry.id) >= entry.available}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {getSelectedQuantity(entry.id) > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal:</p>
                        <p className="font-semibold text-lg text-blue-600">
                          {formatPrice(getSelectedQuantity(entry.id) * entry.price)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total de entradas: {getTotalQuantity()}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(getTotalPrice())}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowEntryModal(false);
                      setSelectedEntries([]);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={selectedEntries.length === 0 || purchaseTicketMutation.isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {purchaseTicketMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Comprar Ahora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
