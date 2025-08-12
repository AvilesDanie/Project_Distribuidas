import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Eye, EyeOff, Calendar, Users, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { LoginRequest } from '../types/auth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      await login(response.access_token);
      toast.success('¡Bienvenido a Encuentro!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Credenciales inválidas. Por favor, verifica tus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información de la plataforma */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">Encuentro</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              La plataforma líder en gestión de eventos. Descubre, organiza y vive experiencias únicas.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Gestión Completa</h3>
                <p className="opacity-80">Crea y administra eventos de manera profesional</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Comunidad Activa</h3>
                <p className="opacity-80">Conecta con miles de usuarios y organizadores</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Experiencias Únicas</h3>
                <p className="opacity-80">Accede a eventos exclusivos y experiencias memorables</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <LogIn className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-gray-600">
              Accede a tu cuenta para descubrir eventos increíbles
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                {...register('username', { required: 'El usuario es requerido' })}
                type="text"
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-500"
                placeholder="Ingresa tu usuario"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'La contraseña es requerida' })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-500 pr-10"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Demo info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Cuentas de prueba:</h4>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Usuario:</strong> usuario / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
