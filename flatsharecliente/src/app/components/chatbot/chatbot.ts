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

  // ── Historial para Gemini ──────────────────────────────
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

    // Mostrar mensaje del usuario
    this.mensajes.update(m => [...m, { texto, esUsuario: true }]);
    this.history.push({ role: 'user', text: texto }); // ← añadir al historial
    this.input.set('');
    this.cargando.set(true);

    this.http.post<{ reply: string }>(
      'http://localhost:8000/api/chat',
      {
        mensaje: texto,
        history: this.history   // ← enviar historial al backend
      },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.mensajes.update(m => [...m, { texto: res.reply, esUsuario: false }]);
        this.history.push({ role: 'model', text: res.reply }); // ← guardar respuesta
        this.cargando.set(false);
      },
      error: () => {
        this.mensajes.update(m => [...m, {
          texto: 'Error al conectar. Intenta de nuevo.',
          esUsuario: false
        }]);
        this.cargando.set(false);
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.enviar();
  }
}