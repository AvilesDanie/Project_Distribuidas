import React from 'react';
import { useQuery } from 'react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign,
  Download
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const AdminStatsPage: React.FC = () => {
  const { data: events, isLoading: eventsLoading } = useQuery('all-events', eventService.getAllEvents);
  const { data: users, isLoading: usersLoading } = useQuery('all-users', authService.getAllUsers);

  // Calcular estadísticas
  const totalEvents = events?.length || 0;
  const publishedEvents = events?.filter(e => e.estado === 'publicado').length || 0;
  const draftEvents = events?.filter(e => e.estado === 'borrador').length || 0;
  const cancelledEvents = events?.filter(e => e.estado === 'cancelado').length || 0;

  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(u => u.rol === 'administrador').length || 0;
  const regularUsers = users?.filter(u => u.rol === 'usuario').length || 0;

  const totalRevenue = events?.reduce((sum, event) => sum + (event.precio || 0), 0) || 0;
  const avgEventPrice = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  // Datos simulados para gráficos
  const monthlyData = [
    { month: 'Ene', events: 12, users: 45, revenue: 2400 },
    { month: 'Feb', events: 19, users: 58, revenue: 3200 },
    { month: 'Mar', events: 15, users: 72, revenue: 2800 },
    { month: 'Abr', events: 22, users: 65, revenue: 4100 },
    { month: 'May', events: 28, users: 89, revenue: 5200 },
    { month: 'Jun', events: 25, users: 94, revenue: 4800 },
  ];

  const topCategories = [
    { name: 'Música', count: 45, percentage: 35 },
    { name: 'Teatro', count: 32, percentage: 25 },
    { name: 'Deportes', count: 25, percentage: 20 },
    { name: 'Gastronomía', count: 15, percentage: 12 },
    { name: 'Tecnología', count: 10, percentage: 8 },
  ];

  if (eventsLoading || usersLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Estadísticas y Reportes
            </h1>
            <p className="text-gray-300 mt-1">
              Panel de análisis y métricas de la plataforma
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Eventos</p>
              <p className="text-3xl font-bold text-white">{totalEvents}</p>
              <p className="text-green-400 text-sm mt-1">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                +12% este mes
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Usuarios</p>
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
              <p className="text-green-400 text-sm mt-1">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                +8% este mes
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Ingresos Potenciales</p>
              <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              <p className="text-green-400 text-sm mt-1">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                +15% este mes
              </p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Precio Promedio</p>
              <p className="text-3xl font-bold text-white">${avgEventPrice.toFixed(2)}</p>
              <p className="text-green-400 text-sm mt-1">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                +5% este mes
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estados de eventos */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Estados de Eventos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Publicados</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(publishedEvents / totalEvents) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{publishedEvents}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Borradores</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(draftEvents / totalEvents) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{draftEvents}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Cancelados</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(cancelledEvents / totalEvents) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{cancelledEvents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de usuarios */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Distribución de Usuarios</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Administradores</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(adminUsers / totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{adminUsers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Usuarios Regulares</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(regularUsers / totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{regularUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencias mensuales */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Tendencias Mensuales</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-300 py-2">Mes</th>
                <th className="text-left text-gray-300 py-2">Eventos</th>
                <th className="text-left text-gray-300 py-2">Usuarios</th>
                <th className="text-left text-gray-300 py-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => (
                <tr key={month.month} className="border-b border-gray-700">
                  <td className="text-white py-3">{month.month}</td>
                  <td className="text-white py-3">{month.events}</td>
                  <td className="text-white py-3">{month.users}</td>
                  <td className="text-white py-3">${month.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categorías más populares */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Categorías Más Populares</h3>
        <div className="space-y-3">
          {topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm w-8">#{index + 1}</span>
                <span className="text-white font-medium">{category.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-gray-300 text-sm w-12">{category.count}</span>
                <span className="text-gray-400 text-sm w-12">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;
