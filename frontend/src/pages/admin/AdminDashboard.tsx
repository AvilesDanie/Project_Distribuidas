import React from 'react';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  Award,
  Clock,
  BarChart3
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'event-stats',
    eventService.getStatistics
  );

  const { data: events, isLoading: eventsLoading } = useQuery(
    'all-events',
    eventService.getAllEvents
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    'all-users',
    authService.getAllUsers
  );

  const { data: sales, isLoading: salesLoading } = useQuery(
    'event-sales',
    () => eventService.getSales()
  );

  const StatsCard: React.FC<{
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
  }> = ({ title, description, icon, onClick, color }) => (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border-2 border-dashed ${color} text-left hover:bg-[#374151] transition-colors w-full`}
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 rounded-lg bg-[#1f2937] shadow-md">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-purple-100">
              Gestiona eventos, usuarios y analiza el rendimiento de la plataforma
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Eventos"
          value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.total_eventos || 0}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          trend="+12% este mes"
        />
        
        <StatsCard
          title="Eventos Publicados"
          value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.eventos_publicados || 0}
          icon={<Award className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          trend="+8% este mes"
        />
        
        <StatsCard
          title="Total Usuarios"
          value={usersLoading ? <LoadingSpinner size="sm" /> : users?.length || 0}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          trend="+15% este mes"
        />
        
        <StatsCard
          title="Ingresos Totales"
          value={salesLoading ? <LoadingSpinner size="sm" /> : `$${sales?.reduce((acc, sale) => acc + (sale.ingresos_totales || 0), 0) || 0}`}
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
          color="bg-yellow-100"
          trend="+22% este mes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Acciones Rápidas</h2>
          <div className="space-y-4">
            <QuickAction
              title="Crear Nuevo Evento"
              description="Agrega un nuevo evento a la plataforma"
              icon={<Calendar className="w-5 h-5 text-blue-400" />}
              onClick={() => window.location.href = '/admin/events'}
              color="border-blue-500"
            />
            
            <QuickAction
              title="Ver Estadísticas"
              description="Analiza métricas detalladas del sistema"
              icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
              onClick={() => window.location.href = '/admin/stats'}
              color="border-purple-500"
            />
            
            <QuickAction
              title="Gestionar Usuarios"
              description="Administra cuentas de usuario"
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              onClick={() => window.location.href = '/admin/users'}
              color="border-emerald-500"
            />
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Eventos Recientes</h2>
            <a href="/admin/events" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">
              Ver todos →
            </a>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {events?.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 hover:bg-[#374151] transition-colors"
                >
                  <div className={`p-3 rounded-lg ${
                    event.estado === 'publicado' ? 'bg-emerald-900/50' : 'bg-amber-900/50'
                  }`}>
                    <Calendar className={`w-5 h-5 ${
                      event.estado === 'publicado' ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{event.titulo}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{event.fecha}</span>
                      <span>•</span>
                      <span className="capitalize">{event.estado}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-indigo-400">${event.precio}</p>
                    <p className="text-xs text-gray-400">{event.tipo}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No hay eventos recientes
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-[#1f2937] rounded-xl p-6 shadow-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Servicios</h3>
            <p className="text-sm text-emerald-400">Todos operativos</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Performance</h3>
            <p className="text-sm text-blue-400">Excelente</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Calidad</h3>
            <p className="text-sm text-amber-400">Muy buena</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
