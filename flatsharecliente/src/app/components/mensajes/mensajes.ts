import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MensajesService, IChat, IMensaje } from '../../services/mensajes';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mensajes',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mensajes.html',
})
export class Mensajes implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  mensajesService = inject(MensajesService);
  auth = inject(AuthService);

  chats = signal<IChat[]>([]);
  chatActivo = signal<IChat | null>(null);
  mensajes = signal<IMensaje[]>([]);
  nuevoMensaje = signal('');
  cargandoChats = signal(true);
  cargandoMensajes = signal(false);
  enviando = signal(false);
  private polling: any;
  private scrollPendiente = false;

  miId = computed(() => this.auth.user()?.id);

  ngOnInit() {
    this.cargarChats();
    // Polling cada 3 segundos para nuevos mensajes
    this.polling = setInterval(() => {
      if (this.chatActivo()) this.cargarMensajes(this.chatActivo()!.id, false);
      this.cargarChats(false);
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.polling);
  }

  ngAfterViewChecked() {
    if (this.scrollPendiente) {
      this.scrollAbajo();
      this.scrollPendiente = false;
    }
  }

  cargarChats(mostrarCarga = true) {
    if (mostrarCarga) this.cargandoChats.set(true);
    this.mensajesService.getMisChats().subscribe({
      next: (data) => {
        this.chats.set(data);
        this.cargandoChats.set(false);
      },
      error: () => this.cargandoChats.set(false)
    });
  }

  seleccionarChat(chat: IChat) {
    this.chatActivo.set(chat);
    this.cargarMensajes(chat.id);
  }

  cargarMensajes(chatId: number, mostrarCarga = true) {
    if (mostrarCarga) this.cargandoMensajes.set(true);
    this.mensajesService.getMensajes(chatId).subscribe({
      next: (data) => {
        const anterior = this.mensajes().length;
        this.mensajes.set(data);
        if (data.length !== anterior) this.scrollPendiente = true;
        this.cargandoMensajes.set(false);
        // Actualizar no_leidos en el chat activo
        this.chats.update(chats =>
          chats.map(c => c.id === chatId ? { ...c, no_leidos: 0 } : c)
        );
      },
      error: () => this.cargandoMensajes.set(false)
    });
  }

  enviar() {
    const texto = this.nuevoMensaje().trim();
    const chat = this.chatActivo();
    if (!texto || !chat || this.enviando()) return;

    this.enviando.set(true);
    this.mensajesService.enviarMensaje(chat.id, texto).subscribe({
      next: (msg) => {
        this.mensajes.update(m => [...m, msg]);
        this.nuevoMensaje.set('');
        this.enviando.set(false);
        this.scrollPendiente = true;
      },
      error: () => this.enviando.set(false)
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  private scrollAbajo() {
    try {
      const el = this.mensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  esMio(msg: IMensaje): boolean {
    return msg.usuario_id === this.miId();
  }

  getIniciales(nombre: string, apellidos: string): string {
    return `${nombre?.charAt(0) ?? ''}${apellidos?.charAt(0) ?? ''}`.toUpperCase();
  }

  getColorAvatar(nombre: string): string {
    const colores = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-amber-500 to-orange-500',
    ];
    return colores[(nombre?.charCodeAt(0) ?? 0) % colores.length];
  }

  getNombreChat(chat: IChat): string {
    const otros = chat.usuarios.filter(u => u.id !== this.miId());
    if (otros.length === 0) return 'Solo tú';
    if (otros.length === 1) return `${otros[0].nombre} ${otros[0].apellidos}`;
    return `${otros[0].nombre} y ${otros.length - 1} más`;
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) return 'Hoy';
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    if (d.toDateString() === ayer.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  totalNoLeidos = computed(() =>
    this.chats().reduce((acc, c) => acc + c.no_leidos, 0)
  );
}