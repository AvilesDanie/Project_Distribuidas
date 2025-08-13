import React from 'react';
import { useQuery } from 'react-query';
import { BarChart3, Users, Calendar, TrendingUp, Activity, PieChart } from 'lucide-react';
import { eventService } from '../services/eventService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EventStats } from '../types/events';

const StatisticsPage: React.FC = () => {
  const { data: statistics, isLoading, error } = useQuery<EventStats>(
    ['statistics'],
    () => eventService.getStatistics()
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <Activity className="w-16 h-16 mx-auto mb-2" />
          <p>Error al cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  const totalEvents = statistics ? Object.values(statistics).reduce((sum, count) => sum + count, 0) : 0;

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon, color, bgColor }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {totalEvents > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {((value / totalEvents) * 100).toFixed(1)}% del total
            </p>
          )}
        </div>
        <div className={`${bgColor} rounded-full p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 rounded-full p-3">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
            <p className="text-gray-300">
              Panel de control y métricas del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <PieChart className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Resumen General</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-2">{totalEvents}</p>
            <p className="text-gray-400">Total de Eventos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400 mb-2">
              {statistics?.eventos_publicados || 0}
            </p>
            <p className="text-gray-400">Eventos Activos</p>
          </div>
        </div>
      </div>

      {/* Estadísticas por Estado */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Estados de Eventos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Borradores"
            value={statistics?.eventos_borradores || 0}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="text-gray-300"
            bgColor="bg-gray-600"
          />
          
          <StatCard
            title="Publicados"
            value={statistics?.eventos_publicados || 0}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="text-green-400"
            bgColor="bg-green-600"
          />
          
          <StatCard
            title="Finalizados"
            value={statistics?.eventos_finalizados || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            color="text-blue-400"
            bgColor="bg-blue-600"
          />
          
          <StatCard
            title="Total"
            value={statistics?.total_eventos || 0}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="text-purple-400"
            bgColor="bg-purple-600"
          />
        </div>
      </div>

      {/* Gráfico de Distribución (representación visual simple) */}
      {totalEvents > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Distribución de Estados</h2>
          </div>
          
          <div className="space-y-4">
            {statistics && Object.entries(statistics).map(([estado, count]) => {
              const percentage = (count / totalEvents) * 100;
              const getColor = (estado: string) => {
                switch (estado) {
                  case 'NO_PUBLICADO': return 'bg-gray-500';
                  case 'PUBLICADO': return 'bg-green-500';
                  case 'FINALIZADO': return 'bg-blue-500';
                  case 'DESACTIVADO': return 'bg-red-500';
                  default: return 'bg-gray-500';
                }
              };
              
              const getLabel = (estado: string) => {
                switch (estado) {
                  case 'NO_PUBLICADO': return 'No Publicados';
                  case 'PUBLICADO': return 'Publicados';
                  case 'FINALIZADO': return 'Finalizados';
                  case 'DESACTIVADO': return 'Desactivados';
                  default: return estado;
                }
              };

              return (
                <div key={estado} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{getLabel(estado)}</span>
                    <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getColor(estado)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Información del Sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-white">
              {statistics?.eventos_publicados || 0}
            </p>
            <p className="text-gray-400 text-sm">Eventos Disponibles</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {statistics?.eventos_finalizados || 0}
            </p>
            <p className="text-gray-400 text-sm">Eventos Completados</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {((statistics?.eventos_publicados || 0) + (statistics?.eventos_finalizados || 0))}
            </p>
            <p className="text-gray-400 text-sm">Eventos Ejecutados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
