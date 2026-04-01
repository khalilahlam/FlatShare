import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

export interface IFoto {
  id: number;
  url: string;
  piso_id: number;
}
export interface IInteresado {
  id: number;
  usuario_id: number;
  piso_id: number;
  estado: string;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    ciudad?: string;
    descripcion?: string;
    intereses?: string;
    fecha_nacimiento?: string;
  };
}
export interface IPiso {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  ciudad?: string;
  lat?: number | null;
  lng?: number | null;
  num_companeros: number;
  habitaciones: number;
  banos: number;
  metros: number;
  amueblado: boolean;
  estado: string;
  usuario_id: number;
  usuario?: any;
  fotos?: IFoto[];
}
@Injectable({
  providedIn: 'root'
})
export class PisoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getPisos(ciudad?: string) {
    let params = new HttpParams();

    if (ciudad?.trim()) {
      params = params.set('ciudad', ciudad.trim());
    }

    return this.http.get<IPiso[]>(`${this.apiUrl}/pisos`, { params });
  }

  getPiso(id: number) {
    return this.http.get<IPiso>(`${this.apiUrl}/pisos/${id}`);
  }

  createPiso(data: any) {
    return this.http.post<IPiso>(`${this.apiUrl}/pisos`, data);
  }

  updatePiso(id: number, data: any) {
    return this.http.put<IPiso>(`${this.apiUrl}/pisos/${id}`, data);
  }

  deletePiso(id: number) {
    return this.http.delete(`${this.apiUrl}/pisos/${id}`);
  }
  getInteresados(pisoId: number) {
  return this.http.get<IInteresado[]>(`${this.apiUrl}/pisos/${pisoId}/interesados`);
}

eliminarInteresado(pisoId: number, usuarioId: number) {
  return this.http.delete(`${this.apiUrl}/pisos/${pisoId}/interesados/${usuarioId}`);
}
}