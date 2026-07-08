export type UserRole = "ADMIN" | "OPERATOR";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}
