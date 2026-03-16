import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IFoto {
  id: number;
  url: string;
  piso_id: number;
}

export interface IPiso {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
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

  getPisos() {
    return this.http.get<IPiso[]>(`${this.apiUrl}/pisos`);
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
}