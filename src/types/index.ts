export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  username?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface AuthResponse {
  token?: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginVerifyRequest {
  token: string;
}

export interface TodoCreateRequest {
  title: string;
}

export interface TodoUpdateRequest {
  title?: string;
  completed?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}
