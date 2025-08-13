import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/ticketService';
import { authService } from '../services/authService';
import { Ticket } from '../types/tickets';
import { UpdateUserRequest, UpdatePasswordRequest } from '../types/auth';
import { User, Ticket as TicketIcon, Edit3, Save, X, Lock, Mail, UserCheck } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { state, updateUser } = useAuth();
  const { user } = state;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Estados para edición de perfil
  const [profileData, setProfileData] = useState({
    usuario: user?.usuario || '',
    email: user?.email || ''
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirm_password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUserTickets();
  }, []);

  const loadUserTickets = async () => {
    try {
      const userTickets = await ticketService.getMyTickets();
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!user) return;
      
      const updateData: UpdateUserRequest = {};
      if (profileData.usuario !== user.usuario) updateData.usuario = profileData.usuario;
      if (profileData.email !== user.email) updateData.email = profileData.email;
      
      if (Object.keys(updateData).length === 0) {
        setEditingProfile(false);
        return;
      }
      
      const updatedUser = await authService.updateUser(user.id, updateData);
      updateUser(updatedUser);
      setSuccess('Perfil actualizado exitosamente');
      setEditingProfile(false);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al actualizar perfil');
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!user) return;
      
      if (passwordData.nueva !== passwordData.confirm_password) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }
      
      if (passwordData.nueva.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      const changeData: UpdatePasswordRequest = {
        actual: passwordData.actual,
        nueva: passwordData.nueva
      };
      
      await authService.updatePassword(user.id, changeData);
      setSuccess('Contraseña cambiada exitosamente');
      setChangingPassword(false);
      setPasswordData({ actual: '', nueva: '', confirm_password: '' });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error al cambiar contraseña');
    }
  };

  const getTicketStatusBadge = (estado: string) => {
    const badges = {
      'disponible': 'bg-green-100 text-green-800',
      'vendida': 'bg-blue-100 text-blue-800',
      'cancelada': 'bg-red-100 text-red-800',
      'reservada': 'bg-yellow-100 text-yellow-800'
    };
    
    return badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#1f2937] rounded-xl p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-full">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-blue-100">Gestiona tu información personal y revisa tus entradas</p>
          </div>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Información del perfil */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserCheck className="mr-2" size={20} />
            Información Personal
          </h2>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} className="mr-2" />
              Editar
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usuario</label>
              <input
                type="text"
                value={profileData.usuario}
                onChange={(e) => setProfileData({ ...profileData, usuario: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUpdateProfile}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={16} className="mr-2" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setProfileData({ usuario: user?.usuario || '', email: user?.email || '' });
                  setError('');
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Usuario</p>
                <p className="text-white font-medium">{user?.usuario}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserCheck className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Rol</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.rol === 'administrador' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.rol}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${user?.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm text-gray-400">Estado</p>
                <p className="text-white font-medium capitalize">{user?.estado}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cambio de contraseña */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Lock className="mr-2" size={20} />
            Seguridad
          </h2>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Lock size={16} className="mr-2" />
              Cambiar Contraseña
            </button>
          )}
        </div>

        {changingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña Actual</label>
              <input
                type="password"
                value={passwordData.actual}
                onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.nueva}
                onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleChangePassword}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={16} className="mr-2" />
                Cambiar Contraseña
              </button>
              <button
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordData({ actual: '', nueva: '', confirm_password: '' });
                  setError('');
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Tu cuenta está protegida. Cambia tu contraseña regularmente para mantenerla segura.</p>
        )}
      </div>

      {/* Estadísticas de entradas */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <TicketIcon className="mr-2" size={20} />
          Mis Entradas ({tickets.length})
        </h2>
        
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <TicketIcon size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No tienes entradas aún</p>
            <p className="text-gray-500">¡Explora nuestros eventos y adquiere tus primeras entradas!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white">#{ticket.codigo}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusBadge(ticket.estado || 'disponible')}`}>
                    {ticket.estado || 'disponible'}
                  </span>
                </div>
                {ticket.evento_nombre && (
                  <p className="text-sm text-gray-300 mb-2">{ticket.evento_nombre}</p>
                )}
                <p className="text-lg font-bold text-green-400">${ticket.precio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
