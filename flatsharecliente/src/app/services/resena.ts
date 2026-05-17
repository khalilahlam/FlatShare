import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IResena {
  id: number;
  autor_id: number;
  destinatario_id: number;
  piso_id?: number;
  puntuacion: number;
  comentario?: string;
  etiquetas?: string[];
  created_at: string;
  autor: {
    id: number;
    nombre: string;
    apellidos: string;
    foto_perfil?: string;
    propietario: boolean;
  };
  piso?: {
    id: number;
    titulo: string;
  };
}

export interface IResenaResponse {
  resenas: IResena[];
  media: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ResenasService {
  private http = inject(HttpClient);
  private api = 'https://flatshare-production.up.railway.app/api';

  getResenas(usuarioId: number) {
    return this.http.get<IResenaResponse>(`${this.api}/resenas/${usuarioId}`);
  }

  puedoResena(usuarioId: number) {
    return this.http.get<{ puede: boolean; motivo?: string }>(
      `${this.api}/resenas/puedo-resena/${usuarioId}`
    );
  }

  crearResena(data: {
    destinatario_id: number;
    piso_id?: number;
    puntuacion: number;
    comentario?: string;
    etiquetas?: string[];
  }) {
    return this.http.post<IResena>(`${this.api}/resenas`, data);
  }

  eliminarResena(id: number) {
    return this.http.delete(`${this.api}/resenas/${id}`);
  }
}