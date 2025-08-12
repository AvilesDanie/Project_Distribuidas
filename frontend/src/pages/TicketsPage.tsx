import React from 'react';
import { useQuery } from 'react-query';
import { Ticket, Calendar, QrCode, Download, Eye } from 'lucide-react';
import { ticketService } from '../services/ticketService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const TicketsPage: React.FC = () => {
  const { data: tickets, isLoading } = useQuery(
    'my-tickets',
    ticketService.getMyTickets
  );

  const TicketCard: React.FC<{ ticket: any }> = ({ ticket }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-lg">{ticket.evento_nombre}</h3>
            <p className="text-green-100">Código: {ticket.codigo}</p>
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
            <span className="font-semibold text-green-600">${ticket.precio}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estado</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Válida
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-outline flex items-center justify-center space-x-2 py-2">
            <QrCode className="w-4 h-4" />
            <span>Ver QR</span>
          </button>
          
          <button className="btn-primary flex items-center justify-center space-x-2 py-2">
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mis Entradas</h1>
            <p className="text-gray-400">
              Gestiona y visualiza todas tus entradas de eventos
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total entradas</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? <LoadingSpinner size="sm" /> : tickets?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="bg-[#1f2937] rounded-xl p-12 text-center shadow-sm">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No tienes entradas aún
              </h3>
              <p className="text-gray-500 mb-6">
                Explora nuestros eventos y compra tu primera entrada
              </p>
              <a
                href="/events"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Explorar Eventos</span>
              </a>
            </div>
          )}
        </>
      )}

      {/* Tips */}
      {tickets && tickets.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Consejos para tus entradas</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Descarga tus entradas antes del evento para acceso sin conexión</p>
            <p>• Presenta el código QR en la entrada del evento</p>
            <p>• Verifica la fecha y hora del evento antes de asistir</p>
            <p>• Contacta al organizador si tienes dudas sobre el evento</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
