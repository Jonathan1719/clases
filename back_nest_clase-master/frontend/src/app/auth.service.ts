import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthResponse, AuthUser } from './models';

const TOKEN_KEY = 'back_nest_token';
const USER_KEY = 'back_nest_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenState = signal(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<AuthUser | null>(this.readUser());
  readonly isAuthenticated = signal(Boolean(this.tokenState()));

  constructor(private readonly http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  register(user: { name: string; email: string; password: string; age: number }) {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, user)
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenState.set(null);
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  private saveSession(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.tokenState.set(response.token);
    this.user.set(response.user);
    this.isAuthenticated.set(true);
  }

  private readUser(): AuthUser | null {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  }
}
