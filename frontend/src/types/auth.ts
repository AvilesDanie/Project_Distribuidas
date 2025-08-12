export interface User {
  id: number;
  usuario: string;
  email: string;
  rol: 'usuario' | 'administrador';
  estado: 'activo' | 'desactivado';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  usuario: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UpdateUserRequest {
  usuario?: string;
  email?: string;
}

export interface UpdatePasswordRequest {
  actual: string;
  nueva: string;
}
