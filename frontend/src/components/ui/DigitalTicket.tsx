import React from 'react';
import { Ticket, Calendar, MapPin, Clock, User } from 'lucide-react';

interface TicketProps {
  ticket: {
    id: number;
    codigo: string;
    evento_nombre: string;
    evento_id: number;
    precio: number;
    estado: string;
    fecha_evento?: string;
    fecha_compra?: string;
    usuario_id?: number;
  };
  onClick?: () => void;
  showQR?: boolean;
}

const DigitalTicket: React.FC<TicketProps> = ({ ticket, onClick, showQR = false }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha por confirmar';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = () => {
    switch (ticket.estado?.toLowerCase()) {
      case 'activa':
      case 'válida':
        return 'from-green-500 to-emerald-600';
      case 'cancelada':
        return 'from-red-500 to-red-600';
      default:
        return 'from-yellow-500 to-orange-600';
    }
  };

  const generateQRCode = (code: string) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white"/>
        <g fill="black">
          ${Array.from({length: 21}, (_, i) => 
            Array.from({length: 21}, (_, j) => {
              const isBlack = ((i + j + Math.abs(code.split('').reduce((a, b) => a + b.charCodeAt(0), 0))) % 3) === 0;
              return isBlack ? `<rect x="${j * 5.7}" y="${i * 5.7}" width="5.7" height="5.7"/>` : '';
            }).join('')
          ).join('')}
        </g>
      </svg>
    `)}`;
  };

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Ticket Container with boarding pass effect */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        {/* Top Section - Event Info */}
        <div className={`relative bg-gradient-to-r ${getStatusColor()} p-6 text-white overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full transform translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full transform -translate-x-16 translate-y-16"></div>
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Ticket className="w-5 h-5" />
                <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  ENTRADA DIGITAL
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1 leading-tight">
                {ticket.evento_nombre}
              </h2>
              <p className="text-sm opacity-75 font-mono tracking-wider">
                #{ticket.codigo}
              </p>
            </div>
            
            {showQR && (
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src={generateQRCode(ticket.codigo)}
                  alt="QR Code"
                  className="w-16 h-16"
                />
              </div>
            )}
          </div>

          {/* Ticket perforations effect */}
          <div className="absolute bottom-0 left-0 right-0 h-4">
            {Array.from({length: 20}, (_, i) => (
              <div 
                key={i}
                className="absolute w-4 h-4 bg-white rounded-full"
                style={{ 
                  left: `${(i * 5) + 2.5}%`,
                  bottom: '-8px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section - Details */}
        <div className="p-6 bg-white relative">
          {/* Ticket Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Fecha</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(ticket.fecha_evento)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Titular</p>
                  <p className="font-semibold text-gray-900">
                    Usuario #{ticket.usuario_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Precio</p>
                  <p className="font-bold text-xl text-green-600">
                    {formatPrice(ticket.precio)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Estado</p>
                  <p className={`font-semibold text-sm px-2 py-1 rounded-full inline-block ${
                    ticket.estado?.toLowerCase() === 'activa' 
                      ? 'bg-green-100 text-green-700'
                      : ticket.estado?.toLowerCase() === 'cancelada'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.estado?.toUpperCase() || 'PENDIENTE'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>🔒 Ticket verificado y seguro</span>
              <span className="font-mono">ID: {ticket.id}</span>
            </div>
          </div>

          {/* Hover effect indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicket;
