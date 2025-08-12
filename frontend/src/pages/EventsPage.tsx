import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { eventService } from '../services/eventService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Event } from '../types/events';

const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data: events, isLoading } = useQuery(
    'published-events',
    eventService.getPublishedEvents
  );

  const { data: categories } = useQuery(
    'categories',
    eventService.getCategories
  );

  const filteredEvents = events?.filter((event: Event) => {
    const matchesSearch = event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.categoria === selectedCategory;
    const matchesType = !selectedType || event.tipo === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="bg-[#1f2937] rounded-xl shadow-md border border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-indigo-600 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.tipo === 'presencial' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-sky-500 text-white'
          }`}>
            {event.tipo}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{event.titulo}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{new Date(event.fecha).toLocaleDateString('es-ES')}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">Aforo: {event.aforo} personas</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm capitalize">{event.categoria}</span>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {event.descripcion}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-indigo-400">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="text-lg font-bold">{event.precio}</span>
          </div>
          
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">Eventos Disponibles</h1>
        <p className="text-gray-100">
          Descubre experiencias únicas y encuentra tu próximo evento favorito
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-[#1f2937]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">Todas las categorías</option>
            {categories?.map((category: string) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            <option value="">Todos los tipos</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedType('');
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-500">
                Intenta con diferentes filtros o términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {filteredEvents.length > 0 && (
        <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-[#1f2937]">
          <div className="flex items-center justify-between text-sm text-white">
            <span>
              Mostrando {filteredEvents.length} de {events?.length || 0} eventos
            </span>
            <span>
              {filteredEvents.filter(e => e.tipo === 'presencial').length} presenciales • {' '}
              {filteredEvents.filter(e => e.tipo === 'virtual').length} virtuales
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
