import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

interface Turn {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
})
export class Chatbot {
  private http = inject(HttpClient);

  private history: Turn[] = [];

  abierto  = signal(false);
  cargando = signal(false);
  input    = signal('');
  mensajes = signal<Mensaje[]>([
    {
      texto: '¡Hola! Soy el asistente de FlatShare. Puedo ayudarte a encontrar piso o resolver dudas sobre alquiler. ¿En qué te ayudo?',
      esUsuario: false
    }
  ]);

  toggleChat() {
    this.abierto.set(!this.abierto());
  }

  enviar() {
    const texto = this.input().trim();
    if (!texto || this.cargando()) return;

    this.mensajes.update(m => [...m, { texto, esUsuario: true }]);
    this.history.push({ role: 'user', text: texto });
    this.input.set('');
    this.cargando.set(true);

    this.http.post<{ reply: string }>(
      'http://localhost:8000/api/chat',
      {
        mensaje: texto,
        history: this.history
      },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.mensajes.update(m => [...m, { texto: res.reply, esUsuario: false }]);
        this.history.push({ role: 'model', text: res.reply });
        this.cargando.set(false);
      },
      error: (err) => {   // ← añadido err
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