import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { authService } from '../services/authService';
import { RegisterRequest } from '../types/auth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      toast.error('Error al crear la cuenta. Por favor, verifica tus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Formulario de registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="mt-2 text-gray-600">
              Únete a Encuentro y descubre eventos increíbles
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Usuario</span>
                </div>
              </label>
              <input
                {...register('usuario', { 
                  required: 'El usuario es requerido',
                  minLength: { value: 3, message: 'El usuario debe tener al menos 3 caracteres' }
                })}
                type="text"
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-500"
                placeholder="Elige tu nombre de usuario"
              />
              {errors.usuario && (
                <p className="mt-1 text-sm text-red-600">{errors.usuario.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Correo Electrónico</span>
                </div>
              </label>
              <input
                {...register('email', { 
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ingresa un correo válido'
                  }
                })}
                type="email"
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-500"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Contraseña</span>
                </div>
              </label>
              <div className="relative">
                <input
                  {...register('password', { 
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-500 pr-10"
                  placeholder="Crea una contraseña segura"
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
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Información de beneficios */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">Bienvenido a Encuentro</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Únete a nuestra comunidad y accede a experiencias únicas
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">🎉 Eventos Exclusivos</h3>
              <p className="opacity-80">
                Accede a eventos exclusivos y experiencias que no encontrarás en otro lugar
              </p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">🎫 Compra Fácil</h3>
              <p className="opacity-80">
                Sistema de compra de entradas rápido y seguro con confirmación inmediata
              </p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">📱 Gestión Simple</h3>
              <p className="opacity-80">
                Administra tus eventos y entradas desde una plataforma intuitiva
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
