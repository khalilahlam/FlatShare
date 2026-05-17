import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PisoService } from '../../services/piso';
import { IResena, ResenasService } from '../../services/resena';
import { AuthService } from '../../services/auth';

export const ETIQUETAS_PROPIETARIO = [
  'Comunicativo', 'Piso en buen estado', 'Justo',
  'Respetuoso', 'Atento', 'Recomendable'
];

export const ETIQUETAS_INQUILINO = [
  'Puntual con el alquiler', 'Limpio', 'Tranquilo',
  'Responsable', 'Buen compañero', 'Respetuoso'
];

@Component({
  selector: 'app-usuario-perfil',
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './usuario-perfil.html',
})
export class UsuarioPerfil implements OnInit {
  route        = inject(ActivatedRoute);
  pisoService  = inject(PisoService);
  resenasService = inject(ResenasService);
  auth         = inject(AuthService);

  usuario      = signal<any>(null);
  cargando     = signal(true);

  // Reseñas
  resenas      = signal<IResena[]>([]);
  mediaResenas = signal<number>(0);
  totalResenas = signal<number>(0);
  puedoResena  = signal(false);

  // Modal
  modalAbierto    = signal(false);
  puntuacion      = signal(5);
  comentario      = signal('');
  etiquetasSel    = signal<string[]>([]);
  enviandoResena  = signal(false);
  errorResena     = signal('');

  get etiquetasDisponibles(): string[] {
    return this.usuario()?.propietario ? ETIQUETAS_PROPIETARIO : ETIQUETAS_INQUILINO;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pisoService.getUsuario(id).subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.cargando.set(false);
        this.cargarResenas(id);
        if (this.auth.isLoggedIn()) this.checkPuedoResena(id);
      },
      error: () => this.cargando.set(false)
    });
  }

  cargarResenas(id: number) {
    this.resenasService.getResenas(id).subscribe({
      next: (data) => {
        this.resenas.set(data.resenas);
        this.mediaResenas.set(data.media);
        this.totalResenas.set(data.total);
      }
    });
  }

  checkPuedoResena(id: number) {
    this.resenasService.puedoResena(id).subscribe({
      next: (data) => this.puedoResena.set(data.puede)
    });
  }

  abrirModal() {
    this.puntuacion.set(5);
    this.comentario.set('');
    this.etiquetasSel.set([]);
    this.errorResena.set('');
    this.modalAbierto.set(true);
  }

  toggleEtiqueta(etiqueta: string) {
    const actual = this.etiquetasSel();
    if (actual.includes(etiqueta)) {
      this.etiquetasSel.set(actual.filter(e => e !== etiqueta));
    } else if (actual.length < 3) {
      this.etiquetasSel.set([...actual, etiqueta]);
    }
  }

  enviarResena() {
    if (this.enviandoResena()) return;
    this.enviandoResena.set(true);
    this.errorResena.set('');

    this.resenasService.crearResena({
      destinatario_id: this.usuario().id,
      puntuacion: this.puntuacion(),
      comentario: this.comentario() || undefined,
      etiquetas: this.etiquetasSel(),
    }).subscribe({
      next: (resena) => {
        this.resenas.update(r => [resena, ...r]);
        this.totalResenas.update(t => t + 1);
        const nuevaMedia = this.resenas().reduce((a, r) => a + r.puntuacion, 0) / this.resenas().length;
        this.mediaResenas.set(Math.round(nuevaMedia * 10) / 10);
        this.puedoResena.set(false);
        this.modalAbierto.set(false);
        this.enviandoResena.set(false);
      },
      error: (err) => {
        this.errorResena.set(err.error?.error ?? 'Error al enviar la reseña');
        this.enviandoResena.set(false);
      }
    });
  }

  eliminarResena(id: number) {
    this.resenasService.eliminarResena(id).subscribe({
      next: () => {
        this.resenas.update(r => r.filter(x => x.id !== id));
        this.totalResenas.update(t => t - 1);
      }
    });
  }

  estrellas(n: number): number[] {
    return Array(n).fill(0);
  }

  estrellasVacias(n: number): number[] {
    return Array(5 - n).fill(0);
  }

  getFotoUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'https://flatshare-production.up.railway.app/storage/' + url;
  }

  calcularEdad(fecha: string | undefined | null): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }
}