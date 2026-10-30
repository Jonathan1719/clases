import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from './api.config';
import { CategoryPayload, CategoryRecord, UserPayload, UserRecord } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getUsers() {
    return this.http.get<UserRecord[]>(`${API_BASE_URL}/users`);
  }

  createUser(user: UserPayload) {
    return this.http.post<UserRecord>(`${API_BASE_URL}/users`, user);
  }

  updateUser(id: number, user: Partial<UserPayload>) {
    return this.http.patch<UserRecord>(`${API_BASE_URL}/users/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete<{ id: number; deleted: boolean }>(`${API_BASE_URL}/users/${id}`);
  }

  getCategories() {
    return this.http.get<CategoryRecord[]>(`${API_BASE_URL}/categoria`);
  }

  createCategory(category: CategoryPayload) {
    return this.http.post<CategoryRecord>(`${API_BASE_URL}/categoria`, category);
  }

  updateCategory(id: number, category: CategoryPayload) {
    return this.http.patch<CategoryRecord>(`${API_BASE_URL}/categoria/${id}`, category);
  }

  deleteCategory(id: number) {
    return this.http.delete<{ id: number; deleted: boolean }>(`${API_BASE_URL}/categoria/${id}`);
  }
}
