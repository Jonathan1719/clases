export interface UserRecord {
  id: number;
  name: string | null;
  email: string | null;
  age: number;
}

export interface CategoryRecord {
  id: number;
  nombre: string;
  detalle_string: string;
}

export interface UserPayload {
  name: string;
  email: string;
  age: number;
  password?: string;
}

export interface CategoryPayload {
  nombre: string;
  detalle_string: string;
}

export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  age: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
