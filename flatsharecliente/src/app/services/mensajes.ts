import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IUsuarioChat {
  id: number;
  nombre: string;
  apellidos: string;
}

export interface IMensaje {
  id: number;
  chat_id: number;
  usuario_id: number;
  contenido: string;
  leido: boolean;
  created_at: string;
  usuario: IUsuarioChat;
}

export interface IChat {
  id: number;
  piso: { id: number; titulo: string; ciudad: string };
  usuarios: IUsuarioChat[];
  ultimo_mensaje: IMensaje | null;
  no_leidos: number;
}

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getMisChats(): Observable<IChat[]> {
    return this.http.get<IChat[]>(`${this.base}/conversaciones`);
  }

  getMensajes(chatId: number): Observable<IMensaje[]> {
    return this.http.get<IMensaje[]>(`${this.base}/conversaciones/${chatId}/mensajes`);
  }

  enviarMensaje(chatId: number, contenido: string): Observable<IMensaje> {
    return this.http.post<IMensaje>(`${this.base}/conversaciones/${chatId}/mensajes`, { contenido });
  }

  getNoLeidos(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.base}/conversaciones/no-leidos`);
  }

  crearChat(pisoId: number): Observable<any> {
    return this.http.post(`${this.base}/pisos/${pisoId}/chat`, {});
  }
}