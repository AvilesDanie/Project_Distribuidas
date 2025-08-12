import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import type { Event, EventFormData, CreateEventRequest } from '../../types/events';

interface TableProps {
  events: Event[];
  onPublish: (id: number) => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (event: Event) => void;
  onView: (event: Event) => void;
  isLoading?: boolean;
}

const EventsTable: React.FC<TableProps> = ({ 
  events, 
  onPublish, 
  onCancel, 
  onDelete, 
  onEdit, 
  onView,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gray-800/80">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Evento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-white">{event.titulo}</div>
                      <div className="text-sm text-gray-400">{event.categoria}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(event.fecha).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.estado === 'PUBLICADO' ? 'bg-green-100 text-green-800' :
                    event.estado === 'NO_PUBLICADO' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onView(event)} className="btn-secondary">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(event)} className="btn-secondary">
                      <Edit className="w-4 h-4" />
                    </button>
                    {event.estado === 'NO_PUBLICADO' && (
                      <button onClick={() => onPublish(event.id)} className="btn-success">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {event.estado === 'PUBLICADO' && (
                      <button onClick={() => onCancel(event.id)} className="btn-warning">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {event.estado !== 'PUBLICADO' && (
                      <button onClick={() => onDelete(event.id)} className="btn-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminEventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'cancelled'>('all');
  
  const [formData, setFormData] = useState<EventFormData>({
    titulo: '',
    descripcion: '',
    fecha: '',
    categoria: '',
    tipo: 'presencial',
    aforo: 0,
    precio: 0
  });

  const { data: events, isLoading, refetch: manualRefetch } = useQuery('all-events', eventService.getAllEvents, {
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true
  });

  const createEventMutation = useMutation(eventService.createEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('all-events');
      setShowCreateForm(false);
      setFormData({
        titulo: '',
        descripcion: '',
        fecha: '',
        categoria: '',
        tipo: 'presencial',
        aforo: 0,
        precio: 0
      });
      toast.success('Evento creado exitosamente');
    },
    onError: () => {
      toast.error('Error al crear evento');
    }
  });

  const publishEventMutation = useMutation(eventService.publishEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('all-events');
      toast.success('Evento publicado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al publicar evento');
    }
  });

  const cancelEventMutation = useMutation(eventService.cancelEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('all-events');
      toast.success('Evento cancelado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar evento');
    }
  });

  const deleteEventMutation = useMutation(eventService.deleteEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries('all-events');
      toast.success('Evento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar evento');
    }
  });

  const handlePublishEvent = (eventId: number) => {
    if (window.confirm('¿Estás seguro de que quieres publicar este evento?')) {
      publishEventMutation.mutate(eventId);
    }
  };

  const handleCancelEvent = (eventId: number) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar este evento?')) {
      cancelEventMutation.mutate(eventId);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData: CreateEventRequest = {
        ...formData,
      };
      await createEventMutation.mutateAsync(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    return events.filter((event: Event) => {
      if (filter === 'published') return event.estado === 'PUBLICADO';
      if (filter === 'draft') return event.estado === 'NO_PUBLICADO';
      if (filter === 'cancelled') return event.estado === 'CANCELADO';
      return true;
    });
  }, [events, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 shadow-lg border border-gray-600/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              Gestión de Eventos
            </h1>
            <p className="text-gray-300 mt-1">
              Administra todos los eventos de la plataforma
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-success flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'published'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Publicados
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'draft'
              ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Borradores
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'cancelled'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Cancelados
        </button>
      </div>

      {/* Events Table */}
      <EventsTable
        events={filteredEvents}
        onPublish={handlePublishEvent}
        onCancel={handleCancelEvent}
        onDelete={handleDeleteEvent}
        onEdit={setEditingEvent}
        onView={setSelectedEvent}
        isLoading={isLoading}
      />

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Crear Nuevo Evento</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Nombre del evento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="musica">Música</option>
                    <option value="teatro">Teatro</option>
                    <option value="deportes">Deportes</option>
                    <option value="gastronomia">Gastronomía</option>
                    <option value="tecnologia">Tecnología</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción *
                </label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 h-24 resize-none"
                  placeholder="Describe el evento..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: Number(e.target.value)})}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Aforo *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.aforo}
                    onChange={(e) => setFormData({...formData, aforo: Number(e.target.value)})}
                    className="input-field"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as 'presencial' | 'virtual'})}
                    className="input-field"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createEventMutation.isLoading}
                  className="flex-1 btn-success"
                >
                  {createEventMutation.isLoading ? 'Creando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Evento</h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-white">
              <p>Funcionalidad de edición en desarrollo</p>
              <p>Evento: {editingEvent.titulo}</p>
              <button
                onClick={() => setEditingEvent(null)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedEvent.titulo}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
                <p className="text-gray-300">{selectedEvent.descripcion}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-300">Fecha</h4>
                  <p className="text-white">{new Date(selectedEvent.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Precio</h4>
                  <p className="text-white">${selectedEvent.precio}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Aforo</h4>
                  <p className="text-white">{selectedEvent.aforo} personas</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Tipo</h4>
                  <p className="text-white capitalize">{selectedEvent.tipo}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="btn-secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
