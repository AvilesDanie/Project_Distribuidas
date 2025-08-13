import React from 'react';
import { Crown, Users, GraduationCap, Star, CheckCircle, Zap } from 'lucide-react';

interface EntryCardProps {
  entry: {
    id: string;
    name: string;
    description: string;
    price: number;
    available: number;
    total: number;
  };
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  formatPrice: (price: number) => string;
}

const EntryCard: React.FC<EntryCardProps> = ({ 
  entry, 
  quantity, 
  onQuantityChange, 
  formatPrice 
}) => {
  const getEntryIcon = () => {
    switch (entry.id) {
      case 'vip':
        return <Crown className="w-8 h-8" />;
      case 'estudiante':
        return <GraduationCap className="w-8 h-8" />;
      default:
        return <Users className="w-8 h-8" />;
    }
  };

  const getEntryColor = () => {
    switch (entry.id) {
      case 'vip':
        return 'from-purple-500 to-pink-500';
      case 'estudiante':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const getEntryBadge = () => {
    switch (entry.id) {
      case 'vip':
        return (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-current" />
            <span>PREMIUM</span>
          </div>
        );
      case 'estudiante':
        return (
          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <Zap className="w-3 h-3" />
            <span>40% OFF</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>POPULAR</span>
          </div>
        );
    }
  };

  const getBenefits = () => {
    switch (entry.id) {
      case 'vip':
        return [
          'Zona VIP exclusiva',
          'Bebida de bienvenida',
          'Parking preferencial',
          'Meet & Greet',
          'Acceso anticipado'
        ];
      case 'estudiante':
        return [
          'Precio especial estudiante',
          'Acceso completo al evento',
          'Área de descanso',
          'Validación de carnet requerida'
        ];
      default:
        return [
          'Acceso completo al evento',
          'Área de descanso',
          'Servicios básicos',
          'Tienda de souvenirs'
        ];
    }
  };

  return (
    <div className={`relative overflow-hidden border-2 rounded-2xl transition-all duration-300 ${
      quantity > 0 
        ? 'border-blue-400 shadow-lg scale-105' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full bg-gradient-to-br ${getEntryColor()} rounded-full transform rotate-45 translate-x-16 -translate-y-16`}></div>
      </div>

      {/* Card Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getEntryColor()} text-white shadow-lg`}>
              {getEntryIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{entry.name}</h3>
              {getEntryBadge()}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{formatPrice(entry.price)}</p>
            <p className="text-sm text-gray-500">por persona</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed">{entry.description}</p>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            ✨ Incluye:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {getBenefits().map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Disponibilidad:</span>
            <span className="font-semibold text-gray-900">
              {entry.available - quantity} de {entry.total}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getEntryColor()}`}
              style={{ width: `${((entry.available - quantity) / entry.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => quantity > 0 && onQuantityChange(quantity - 1)}
              disabled={quantity === 0}
              className="w-10 h-10 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <span className="text-xl font-bold text-gray-600">−</span>
            </button>
            
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-gray-900">{quantity}</span>
            </div>
            
            <button
              onClick={() => quantity < entry.available && onQuantityChange(quantity + 1)}
              disabled={quantity >= entry.available}
              className="w-10 h-10 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <span className="text-xl font-bold text-gray-600">+</span>
            </button>
          </div>

          {quantity > 0 && (
            <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Subtotal:</p>
              <p className="text-xl font-bold text-blue-700">
                {formatPrice(quantity * entry.price)}
              </p>
            </div>
          )}
        </div>

        {/* Selected Indicator */}
        {quantity > 0 && (
          <div className="absolute top-4 left-4">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
              {quantity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryCard;
