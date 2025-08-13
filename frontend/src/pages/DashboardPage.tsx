import React from 'react';
import { useQuery } from 'react-query';
import { Calendar, Ticket, TrendingUp, Star, Plus, Eye, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const isAdmin = state.user?.rol === 'administrador';

  const { data: events, isLoading: eventsLoading } = useQuery(
    'published-events',
    eventService.getPublishedEvents
  );

  const { data: myTickets, isLoading: ticketsLoading } = useQuery(
    'my-tickets',
    ticketService.getMyTickets,
    { enabled: !!state.user }
  );

  const upcomingEvents = events?.slice(0, 4) || [];
  const recentTickets = myTickets?.slice(0, 3) || [];

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              ¡Hola, {state.user?.usuario}! 👋
            </h1>
            <p className="text-gray-300 mt-1">
              {isAdmin ? 'Panel de administración - Gestiona la plataforma' : 'Descubre eventos increíbles y gestiona tus entradas'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Rol</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              state.user?.rol === 'administrador' 
                ? 'bg-purple-600 text-purple-100' 
                : 'bg-blue-600 text-blue-100'
            }`}>
              {state.user?.rol === 'administrador' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas de Administrador</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/events/create"
              className="flex flex-col items-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center"
            >
              <Plus className="w-8 h-8 text-white mb-2" />
              <span className="text-white font-medium">Crear Evento</span>
            </Link>
            <Link
              to="/admin/users/create"
              className="flex flex-col items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
            >
              <Users className="w-8 h-8 text-white mb-2" />
              <span className="text-white font-medium">Crear Usuario</span>
            </Link>
            <Link
              to="/admin/events"
              className="flex flex-col items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-center"
            >
              <Eye className="w-8 h-8 text-white mb-2" />
              <span className="text-white font-medium">Ver Eventos</span>
            </Link>
            <Link
              to="/admin/stats"
              className="flex flex-col items-center p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-center"
            >
              <BarChart3 className="w-8 h-8 text-white mb-2" />
              <span className="text-white font-medium">Estadísticas</span>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Eventos Disponibles</p>
              <p className="text-2xl font-bold text-white">
                {eventsLoading ? <LoadingSpinner size="sm" className="text-white" /> : events?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Mis Entradas</p>
              <p className="text-2xl font-bold text-white">
                {ticketsLoading ? <LoadingSpinner size="sm" className="text-white" /> : myTickets?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center">
            <div className="bg-purple-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Categorías</p>
              <p className="text-2xl font-bold text-white">12+</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Experiencias</p>
              <p className="text-2xl font-bold text-white">Premium</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Eventos */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximos Eventos</h2>
            <Link
              to="/events"
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="text-white" />
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{event.titulo}</h3>
                      <p className="text-sm text-gray-400">{event.fecha}</p>
                      <p className="text-sm text-blue-400">${event.precio}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.tipo === 'presencial' 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-blue-600 text-blue-100'
                    }`}>
                      {event.tipo}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No hay eventos disponibles en este momento
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mis Entradas Recientes */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Mis Entradas</h2>
            <Link
              to="/tickets"
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Ver todas →
            </Link>
          </div>

          {ticketsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="text-white" />
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl p-4 border border-gray-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-5 rounded-full -translate-y-10 translate-x-10"></div>
                    
                    <div className="relative flex items-center space-x-4">
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <Ticket className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{ticket.evento_nombre}</h3>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-gray-300">#{ticket.codigo}</span>
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs font-medium">
                            {ticket.estado || 'activa'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{formatPrice(ticket.precio)}</p>
                        <p className="text-xs text-gray-300">Comprada</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    Aún no tienes entradas
                  </p>
                  <Link
                    to="/events"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Explorar eventos
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
