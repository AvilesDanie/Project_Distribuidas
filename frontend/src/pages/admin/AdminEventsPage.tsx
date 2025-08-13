import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye, Calendar, CheckCircle, XCircle, Upload } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { uploadService } from '../../services/uploadService';
import { getImageUrl } from '../../utils/imageUtils';
import { formatDateForInput, formatDateForBackend } from '../../utils/dateUtils';

import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';
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
                Imagen
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
              <tr key={`event-${event.id}-${event.estado}`} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-white">{event.titulo}</div>
                      <div className="text-sm text-gray-400">{event.categoria}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.imagen_url ? (
                    <img 
                      src={getImageUrl(event.imagen_url) || event.imagen_url} 
                      alt={event.titulo}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}
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
                      <button onClick={() => onPublish(Number(event.id))} className="btn-success">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {event.estado === 'PUBLICADO' && (
                      <button onClick={() => onCancel(Number(event.id))} className="btn-warning">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {event.estado !== 'PUBLICADO' && (
                      <button onClick={() => onDelete(Number(event.id))} className="btn-danger">
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [formData, setFormData] = useState<EventFormData>({
    titulo: '',
    descripcion: '',
    fecha: '',
    categoria: '',
    tipo: 'presencial',
    aforo: 0,
    precio: 0,
    imagen_url: ''
  });

  // Variables para controlar el estado de loading
  const uploading = uploadingImage;

  // Función helper para resetear el formulario
  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha: '',
      categoria: '',
      tipo: 'presencial',
      aforo: 0,
      precio: 0,
      imagen_url: ''
    });
  };

  const { data: events, isLoading, refetch } = useQuery(['all-events', refreshKey], eventService.getAllEvents, {
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: false
  });

  const createEventMutation = useMutation(eventService.createEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['all-events']);
      setRefreshKey(prev => prev + 1); // Forzar actualización
      refetch(); // Forzar recarga inmediata
      setShowCreateForm(false);
      resetForm();
      
      // SweetAlert2 para éxito
      Swal.fire({
        title: '¡Éxito!',
        text: 'El evento ha sido creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
    },
    onError: (error: any) => {
      // SweetAlert2 para error
      Swal.fire({
        title: '¡Error!',
        text: error.message || 'No se pudo crear el evento',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    }
  });

  const publishEventMutation = useMutation(eventService.publishEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['all-events']);
      setRefreshKey(prev => prev + 1); // Forzar actualización
      refetch(); // Forzar recarga inmediata
      
      Swal.fire({
        title: '¡Publicado!',
        text: 'El evento ha sido publicado exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: '¡Error!',
        text: error.message || 'No se pudo publicar el evento',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    }
  });

  const cancelEventMutation = useMutation(eventService.cancelEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['all-events']);
      setRefreshKey(prev => prev + 1); // Forzar actualización
      refetch(); // Forzar recarga inmediata
      
      Swal.fire({
        title: '¡Cancelado!',
        text: 'El evento ha sido cancelado exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: '¡Error!',
        text: error.message || 'No se pudo cancelar el evento',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    }
  });

  const deleteEventMutation = useMutation(eventService.deleteEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['all-events']);
      setRefreshKey(prev => prev + 1); // Forzar actualización
      refetch(); // Forzar recarga inmediata
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El evento ha sido eliminado exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: '¡Error!',
        text: error.message || 'No se pudo eliminar el evento',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    }
  });

  const updateEventMutation = useMutation(
    ({ id, data }: { id: number, data: any }) => eventService.updateEvent(id, data), 
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['all-events']);
        setRefreshKey(prev => prev + 1);
        refetch();
        setEditingEvent(null);
        resetForm();
        
        Swal.fire({
          title: '¡Actualizado!',
          text: 'El evento ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
      },
      onError: (error: any) => {
        Swal.fire({
          title: '¡Error!',
          text: error.message || 'No se pudo actualizar el evento',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  );

  const handlePublishEvent = async (eventId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres publicar este evento?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, publicar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#fff',
    });

    if (result.isConfirmed) {
      publishEventMutation.mutate(eventId);
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cancelar este evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No cancelar',
      background: '#1f2937',
      color: '#fff',
    });

    if (result.isConfirmed) {
      cancelEventMutation.mutate(eventId);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres eliminar este evento? Esta acción no se puede deshacer.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#fff',
    });

    if (result.isConfirmed) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (formData.precio < 0 || formData.precio > 10000) {
      Swal.fire({
        title: '¡Error!',
        text: 'El precio debe estar entre €0 y €10,000',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    
    if (formData.aforo < 1 || formData.aforo > 100000) {
      Swal.fire({
        title: '¡Error!',
        text: 'El aforo debe estar entre 1 y 100,000 personas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    
    // Validar fecha no sea en el pasado
    const eventDate = new Date(formData.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      Swal.fire({
        title: '¡Error!',
        text: 'La fecha del evento no puede ser en el pasado',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    
    try {
      const eventData: CreateEventRequest = {
        ...formData,
        fecha: formatDateForBackend(formData.fecha),
      };
      await createEventMutation.mutateAsync(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: '¡Error!',
        text: 'Por favor selecciona un archivo de imagen válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: '¡Error!',
        text: 'La imagen es muy grande. Máximo 5MB',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      // Subir imagen al servidor
      const imageUrl = await uploadService.uploadImage(file);
      setFormData({...formData, imagen_url: imageUrl});
      
      // Mostrar mensaje de éxito
      Swal.fire({
        title: '¡Imagen cargada!',
        text: 'La imagen se ha subido correctamente al servidor',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        title: '¡Error!',
        text: 'No se pudo subir la imagen al servidor',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para llenar el formulario cuando se edita un evento
  const populateEditForm = (event: Event) => {
    setFormData({
      titulo: event.titulo,
      descripcion: event.descripcion,
      fecha: formatDateForInput(event.fecha),
      categoria: event.categoria,
      tipo: event.tipo,
      aforo: event.aforo,
      precio: event.precio,
      imagen_url: event.imagen_url || ''
    });
  };

  // Función para manejar la actualización del evento
  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    
    try {
      const eventData = {
        ...formData,
        fecha: formatDateForBackend(formData.fecha),
        precio: typeof formData.precio === 'string' ? parseFloat(formData.precio) : formData.precio,
        aforo: typeof formData.aforo === 'string' ? parseInt(formData.aforo) : formData.aforo
      };
      await updateEventMutation.mutateAsync({ id: Number(editingEvent.id), data: eventData });
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Función para manejar el cambio de imagen en edición
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones similares a handleImageUpload
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: '¡Error!',
        text: 'Por favor selecciona un archivo de imagen válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: '¡Error!',
        text: 'La imagen es muy grande. Máximo 5MB',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      const imageUrl = await uploadService.uploadImage(file);
      setFormData({...formData, imagen_url: imageUrl});
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        title: '¡Error!',
        text: 'No se pudo subir la imagen al servidor',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Efecto para llenar el formulario cuando se selecciona un evento para editar
  React.useEffect(() => {
    if (editingEvent) {
      populateEditForm(editingEvent);
    }
  }, [editingEvent]);

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
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Imagen del Evento
                </label>
                <div className="space-y-4">
                  {/* Solo mostrar área de subida si NO hay imagen */}
                  {!formData.imagen_url && (
                    <div>
                      <label className="flex items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          {uploadingImage ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <p className="text-sm text-gray-400 mt-2">Cargando imagen...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-400">Haz clic para subir imagen</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  )}
                  
                  {/* Vista previa de imagen - Más prominente */}
                  {formData.imagen_url && (
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Imagen cargada exitosamente
                        </span>
                        <div className="flex space-x-2">
                          {/* Botón para cambiar imagen */}
                          <label className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Cambiar
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, imagen_url: ''});
                            }}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Quitar
                          </button>
                        </div>
                      </div>
                      <div className="relative inline-block">
                        <img 
                          src={getImageUrl(formData.imagen_url) || formData.imagen_url} 
                          alt="Vista previa del evento" 
                          className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-600 shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error('Error cargando imagen:', formData.imagen_url);
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMTUwVjE3NUgxNzVMMjAwIDE1MFoiIGZpbGw9IiM2QjcyODAiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg pointer-events-none"></div>
                      </div>
                    </div>
                  )}
                </div>
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
                    Precio * (€)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.precio || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData({...formData, precio: value});
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value < 0) {
                        setFormData({...formData, precio: 0});
                      } else if (value > 10000) {
                        setFormData({...formData, precio: 10000});
                      } else {
                        // Auto-formatear a 2 decimales al salir del campo
                        setFormData({...formData, precio: parseFloat(value.toFixed(2))});
                      }
                    }}
                    className="input-field focus:border-green-500 focus:ring-green-500/20"
                    placeholder="Ej: 25.50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Máximo €10,000 - se puede poner 0 para eventos gratuitos</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Aforo * (personas)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100000"
                    value={formData.aforo || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFormData({...formData, aforo: value});
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value < 1) {
                        setFormData({...formData, aforo: 1});
                      } else if (value > 100000) {
                        setFormData({...formData, aforo: 100000});
                      }
                    }}
                    className="input-field focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Ej: 500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Entre 1 y 100,000 personas</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as 'presencial' | 'virtual'})}
                    className="input-field focus:border-purple-500 focus:ring-purple-500/20"
                  >
                    <option value="presencial">🏢 Presencial</option>
                    <option value="virtual">💻 Virtual</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
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
                onClick={() => {
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateEvent();
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-titulo" className="block text-sm font-medium text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    id="edit-titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del evento"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-categoria" className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    id="edit-categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Concierto">Concierto</option>
                    <option value="Teatro">Teatro</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Festival">Festival</option>
                    <option value="Exposición">Exposición</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-fecha" className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    id="edit-fecha"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-tipo" className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    id="edit-tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'presencial' | 'virtual' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-aforo" className="block text-sm font-medium text-gray-300 mb-2">
                    Aforo
                  </label>
                  <input
                    type="number"
                    id="edit-aforo"
                    min="1"
                    value={formData.aforo}
                    onChange={(e) => setFormData(prev => ({ ...prev, aforo: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Número de asistentes"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-precio" className="block text-sm font-medium text-gray-300 mb-2">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    id="edit-precio"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 para evento gratuito"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-descripcion" className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  id="edit-descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe tu evento..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen del evento
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {(formData.imagen_url || editingEvent.imagen_url) && (
                    <div className="relative">
                      <img 
                        src={getImageUrl(formData.imagen_url || editingEvent.imagen_url) || formData.imagen_url || editingEvent.imagen_url} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          console.log('Error cargando imagen:', formData.imagen_url || editingEvent.imagen_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateEventMutation.isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                >
                  {updateEventMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Evento'
                  )}
                </button>
              </div>
            </form>
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
              {/* Imagen del evento */}
              {selectedEvent.imagen_url && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Imagen</h3>
                  <img 
                    src={getImageUrl(selectedEvent.imagen_url) || selectedEvent.imagen_url} 
                    alt={selectedEvent.titulo}
                    className="w-full h-64 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
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
                <div>
                  <h4 className="font-medium text-gray-300">Estado</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedEvent.estado === 'PUBLICADO' ? 'bg-green-100 text-green-800' :
                    selectedEvent.estado === 'NO_PUBLICADO' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedEvent.estado}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-300">Categoría</h4>
                  <p className="text-white capitalize">{selectedEvent.categoria}</p>
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
