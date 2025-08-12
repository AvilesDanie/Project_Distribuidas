import React from 'react';
import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Configuración
            </h1>
            <p className="text-gray-300 mt-1">
              Administra la configuración de tu cuenta y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Secciones de configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de perfil */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <User className="w-6 h-6 mr-2" />
            Perfil de Usuario
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Tu nombre de usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
              />
            </div>
            <button className="btn-primary">
              Actualizar Perfil
            </button>
          </div>
        </div>

        {/* Configuración de notificaciones */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email de eventos</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notificaciones push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS de recordatorios</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Configuración de seguridad */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Seguridad
          </h3>
          <div className="space-y-4">
            <button className="w-full btn-outline text-left">
              Cambiar Contraseña
            </button>
            <button className="w-full btn-outline text-left">
              Autenticación de Dos Factores
            </button>
            <button className="w-full btn-outline text-left">
              Sesiones Activas
            </button>
          </div>
        </div>

        {/* Configuración de preferencias */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            Preferencias
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Idioma
              </label>
              <select className="input-field">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Zona Horaria
              </label>
              <select className="input-field">
                <option value="UTC-5">UTC-5 (Colombia)</option>
                <option value="UTC-6">UTC-6 (México)</option>
                <option value="UTC-3">UTC-3 (Argentina)</option>
              </select>
            </div>
            <button className="btn-primary">
              Guardar Preferencias
            </button>
          </div>
        </div>
      </div>

      {/* Configuración avanzada */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Database className="w-6 h-6 mr-2" />
          Configuración Avanzada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-outline">
            Exportar Datos
          </button>
          <button className="btn-outline">
            Importar Configuración
          </button>
          <button className="btn-danger">
            Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
