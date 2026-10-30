import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CategoryRecord, UserRecord } from './models';

type Section = 'overview' | 'users' | 'categories';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly section = signal<Section>('overview');
  readonly editorKind = signal<'user' | 'category'>('user');
  readonly users = signal<UserRecord[]>([]);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly authMode = signal<'login' | 'register'>('login');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    age: [18, [Validators.required, Validators.min(0), Validators.max(150)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
  });

  readonly userForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    age: [18, [Validators.required, Validators.min(0), Validators.max(150)]],
    password: ['', [Validators.minLength(6), Validators.maxLength(72)]],
  });

  readonly categoryForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    detalle_string: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.refreshData();
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        this.section.set('overview');
        this.refreshData();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const { name, email, password, age } = this.registerForm.getRawValue();
    this.auth.register({ name, email, password, age: Number(age) }).subscribe({
      next: () => {
        this.busy.set(false);
        this.section.set('overview');
        this.refreshData();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  logout() {
    this.auth.logout();
    this.users.set([]);
    this.categories.set([]);
    this.section.set('overview');
    this.error.set('');
    this.notice.set('');
  }

  navigate(section: Section) {
    this.section.set(section);
    this.error.set('');
    this.notice.set('');
    if (section === 'users') {
      this.loadUsers();
    } else if (section === 'categories') {
      this.loadCategories();
    }
  }

  openNewUser() {
    this.editorKind.set('user');
    this.editingId.set(null);
    this.userForm.reset({ name: '', email: '', age: 18, password: '' });
    this.userForm.controls.password.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(72),
    ]);
    this.userForm.controls.password.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  editUser(user: UserRecord) {
    this.editorKind.set('user');
    this.editingId.set(user.id);
    this.userForm.reset({
      name: user.name ?? '',
      email: user.email ?? '',
      age: user.age,
      password: '',
    });
    this.userForm.controls.password.setValidators([
      Validators.minLength(6),
      Validators.maxLength(72),
    ]);
    this.userForm.controls.password.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  openNewCategory() {
    this.editorKind.set('category');
    this.editingId.set(null);
    this.categoryForm.reset({ nombre: '', detalle_string: '' });
    this.modalOpen.set(true);
  }

  editCategory(category: CategoryRecord) {
    this.editorKind.set('category');
    this.editingId.set(category.id);
    this.categoryForm.reset({
      nombre: category.nombre,
      detalle_string: category.detalle_string,
    });
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const { name, email, age, password } = this.userForm.getRawValue();
    const payload = {
      name,
      email,
      age: Number(age),
      ...(password ? { password } : {}),
    };
    const id = this.editingId();
    this.busy.set(true);
    this.error.set('');
    const request = id === null ? this.api.createUser({ ...payload, password }) : this.api.updateUser(id, payload);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeModal();
        this.notice.set(id === null ? 'Usuario agregado.' : 'Usuario actualizado.');
        this.loadUsers();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const payload = this.categoryForm.getRawValue();
    const id = this.editingId();
    this.busy.set(true);
    this.error.set('');
    const request =
      id === null ? this.api.createCategory(payload) : this.api.updateCategory(id, payload);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.closeModal();
        this.notice.set(id === null ? 'Categoría agregada.' : 'Categoría actualizada.');
        this.loadCategories();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  deleteUser(user: UserRecord) {
    if (!window.confirm(`¿Eliminar el usuario ${user.name ?? user.email ?? user.id}?`)) {
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set('Usuario eliminado.');
        this.loadUsers();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  deleteCategory(category: CategoryRecord) {
    if (!window.confirm(`¿Eliminar la categoría "${category.nombre}"?`)) {
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.notice.set('Categoría eliminada.');
        this.loadCategories();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  private refreshData() {
    this.loadUsers();
    this.loadCategories();
  }

  private loadUsers() {
    this.api.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (error: unknown) => this.fail(error),
    });
  }

  private loadCategories() {
    this.api.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error: unknown) => this.fail(error),
    });
  }

  private fail(error: unknown) {
    this.busy.set(false);
    this.error.set(this.messageFor(error));
  }

  private messageFor(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el backend. Verifica que NestJS esté activo en el puerto 3000.';
      }
      const message = error.error?.message;
      return Array.isArray(message) ? message.join(' ') : message || 'Ocurrió un error inesperado.';
    }
    return 'Ocurrió un error inesperado.';
  }
}
