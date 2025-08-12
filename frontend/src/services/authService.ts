import api from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UpdateUserRequest, 
  UpdatePasswordRequest 
} from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // OAuth2PasswordRequestForm expects form-data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/usuarios/usuarios/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<void> {
    await api.post('/usuarios/usuarios/registro', userData);
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/usuarios/usuarios/get-mi-perfil');
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/usuarios/usuarios/get-usuarios');
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/usuarios/usuarios/get-usuario/${id}`);
    return response.data;
  },

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/usuarios/usuarios/update-usuarios/${id}`, userData);
    return response.data;
  },

  async updatePassword(id: number, passwordData: UpdatePasswordRequest): Promise<void> {
    await api.put(`/usuarios/usuarios/update-password/${id}`, passwordData);
  },

  async createUser(userData: RegisterRequest): Promise<User> {
    const response = await api.post('/usuarios/usuarios/registro', userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/usuarios/usuarios/delete-usuario/${id}`);
  },

  async deactivateUser(id: number): Promise<User> {
    const response = await api.put(`/usuarios/usuarios/deactivate-usuario/${id}`);
    return response.data;
  },

  async activateUser(id: number): Promise<User> {
    const response = await api.put(`/usuarios/usuarios/activate-usuario/${id}`);
    return response.data;
  }
};
