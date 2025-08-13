import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Ticket, 
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { eventService } from '../../services/eventService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const AdminEntriesPage: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'activa' | 'cancelada'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: events } = useQuery(
    'admin-events',
    eventService.getAllEvents
  );

  const { data: allTickets, isLoading: allTicketsLoading } = useQuery(
    'all-tickets',
    ticketService.getAllTickets
  );

  const { data: eventTickets, isLoading: eventTicketsLoading } = useQuery(
    ['event-tickets', selectedEventId],
    () => ticketService.getTicketsByEvent(selectedEventId!),
    { enabled: !!selectedEventId }
  );

  const cancelTicketMutation = useMutation(
    (ticketId: number) => ticketService.cancelTicket(ticketId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-tickets');
        if (selectedEventId) {
          queryClient.invalidateQueries(['event-tickets', selectedEventId]);
        }
      }
    }
  );

  const handleCancelTicket = async (ticketId: number) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta entrada?')) {
      try {
        await cancelTicketMutation.mutateAsync(ticketId);
      } catch (error) {
        alert('Error al cancelar la entrada');
      }
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (ticket: any) => {
    // Si tiene usuario asignado, está pagado
    if (ticket.usuario_id) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Pagado
        </span>
      );
    }

    const statusLower = ticket.estado?.toLowerCase();
    switch (statusLower) {
      case 'cancelada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Disponible
          </span>
        );
    }
  };

  const ticketsToShow = selectedEventId ? eventTickets : allTickets;
  const filteredTickets = ticketsToShow?.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.estado?.toLowerCase() === filterStatus;
    const matchesSearch = !searchTerm || 
      ticket.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.evento_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const stats = {
    totalTickets: allTickets?.length || 0,
    activeTickets: allTickets?.filter(t => t.estado?.toLowerCase() === 'activa').length || 0,
    cancelledTickets: allTickets?.filter(t => t.estado?.toLowerCase() === 'cancelada').length || 0,
    revenue: allTickets?.reduce((sum, t) => t.estado?.toLowerCase() === 'activa' ? sum + (t.precio || 0) : sum, 0) || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Entradas</h1>
              <p className="text-gray-600 mt-1">Administra y monitorea todas las entradas del sistema</p>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entradas</p>
              <p className="text-2xl font-bold text-gray-900">
                {allTicketsLoading ? <LoadingSpinner size="sm" /> : stats.totalTickets}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entradas Activas</p>
              <p className="text-2xl font-bold text-green-600">
                {allTicketsLoading ? <LoadingSpinner size="sm" /> : stats.activeTickets}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">
                {allTicketsLoading ? <LoadingSpinner size="sm" /> : stats.cancelledTickets}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-purple-600">
                {allTicketsLoading ? <LoadingSpinner size="sm" /> : formatPrice(stats.revenue)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Event Selector */}
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por evento</label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los eventos</option>
                {events && events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="activa">Activas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código o evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedEventId ? `Entradas del evento seleccionado` : 'Todas las entradas'} 
            ({filteredTickets.length})
          </h3>
        </div>

        {(allTicketsLoading || eventTicketsLoading) ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay entradas</h3>
            <p className="text-gray-600">No se encontraron entradas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Ticket className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {ticket.codigo}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.evento_nombre || 'Sin evento'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {ticket.evento_id}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.usuario_id ? `Usuario #${ticket.usuario_id}` : 'Sin asignar'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatPrice(ticket.precio)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {ticket.usuario_id && ticket.estado?.toLowerCase() !== 'cancelada' ? (
                        <button 
                          onClick={() => handleCancelTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center space-x-1"
                          disabled={cancelTicketMutation.isLoading}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Analytics Section */}
      {selectedEventId && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Análisis de Ventas del Evento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {eventTickets?.length || 0}
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Entradas</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {eventTickets?.filter(t => t.estado?.toLowerCase() === 'activa').length || 0}
              </div>
              <p className="text-sm text-green-700 font-medium">Entradas Vendidas</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatPrice(eventTickets?.reduce((sum, t) => 
                  t.estado?.toLowerCase() === 'activa' ? sum + (t.precio || 0) : sum, 0) || 0
                )}
              </div>
              <p className="text-sm text-purple-700 font-medium">Ingresos Generados</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminEntriesPage;
