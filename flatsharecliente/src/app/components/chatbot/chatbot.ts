import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
})
export class Chatbot {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private history: Turn[] = [];

  abierto  = signal(false);
  cargando = signal(false);
  input    = signal('');
  mensajes = signal<Mensaje[]>([
    {
      texto: '¡Hola! Soy Verónica, tu asistente de FlatShare. Puedo ayudarte a encontrar piso o resolver dudas sobre alquiler. ¿En qué te ayudo? 😊',
      esUsuario: false
    }
  ]);

  constructor() {
    effect(() => {
      this.auth.chatReset();
      this.resetChat();
    });
  }

  resetChat() {
    this.history = [];
    this.mensajes.set([{
      texto: '¡Hola! Soy Verónica, tu asistente de FlatShare. Puedo ayudarte a encontrar piso o resolver dudas sobre alquiler. ¿En qué te ayudo? 😊',
      esUsuario: false
    }]);
    this.abierto.set(false);
  }

  toggleChat() {
    this.abierto.set(!this.abierto());
  }

  enviar() {
    const texto = this.input().trim();
    if (!texto || this.cargando()) return;

    this.mensajes.update(m => [...m, { texto, esUsuario: true }]);
    this.history.push({ role: 'user', text: texto }); // ← corregido
    this.input.set('');
    this.cargando.set(true);

    this.http.post<{ reply: string }>(
      'http://localhost:8000/api/chat',
      {
        mensaje: texto,
        history: this.history.slice(-10)
      },
      { withCredentials: true }
    ).subscribe({
      next: (res: { reply: string }) => {
        this.mensajes.update(m => [...m, { texto: res.reply, esUsuario: false }]);
        this.history.push({ role: 'assistant', text: res.reply }); // ← corregido
        this.cargando.set(false);
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.mensajes.update(m => [...m, {
            texto: 'Debes iniciar sesión para usar el asistente. 😊',
            esUsuario: false
          }]);
        } else {
          this.mensajes.update(m => [...m, {
            texto: 'Error al conectar. Intenta de nuevo.',
            esUsuario: false
          }]);
        }
        this.cargando.set(false);
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.enviar();
  }
}