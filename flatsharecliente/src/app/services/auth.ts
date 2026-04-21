import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface IUsuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  propietario: boolean;
  fecha_nacimiento?: string;
  telefono?: string;
  ciudad?: string;
  descripcion?: string;
  intereses?: string;
  foto_perfil?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8000/api';

  user = signal<IUsuario | null>(null);
  token = signal<string | null>(null);
  chatReset = signal(0);

  isLoggedIn = computed(() => !!this.token());
  isPropietario = computed(() => !!this.user()?.propietario);

  constructor() {
    const t = localStorage.getItem('auth_token');
    const u = localStorage.getItem('auth_user');
    if (t) this.token.set(t);
    if (u) this.user.set(JSON.parse(u));
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(r => this.guardarSesion(r.token, r.user))
    );
  }

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(r => this.guardarSesion(r.token, r.user))
    );
  }

  logout() {
    this.limpiarSesion();
    this.chatReset.update(v => v + 1);
    this.router.navigate(['/login']);
  }

  setUser(user: IUsuario) {
    this.user.set(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private guardarSesion(token: string, user: IUsuario) {
    this.token.set(token);
    this.user.set(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private limpiarSesion() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}