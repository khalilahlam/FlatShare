import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { PisoService, IPiso, IInteresado } from '../../services/piso';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  pisoService = inject(PisoService);
  http = inject(HttpClient);

  misPisos = signal<IPiso[]>([]);
  interesadosPorPiso = signal<{ [pisoId: number]: IInteresado[] }>({});
  pisosFavoritos = signal<IPiso[]>([]);
  pisosInteresados = signal<IPiso[]>([]);
  tabActiva = signal<'favoritos' | 'interesados'>('favoritos');
  subiendoFoto = signal(false);

  // Modales
  pisoAEliminar = signal<number | null>(null);
  candidatoAEliminar = signal<{ pisoId: number; usuarioId: number } | null>(null);

  // Editar perfil
  editandoPerfil = signal(false);
  guardandoPerfil = signal(false);
  perfilForm = signal({
    nombre: '',
    apellidos: '',
    telefono: '',
    ciudad: '',
    descripcion: '',
    intereses: '',
    fecha_nacimiento: '',
  });

  ngOnInit() {
    if (this.auth.isPropietario()) {
      this.pisoService.getPisos().subscribe({
        next: (data) => {
          const misId = this.auth.user()?.id;
          const pisos = data.filter(p => p.usuario_id === misId);
          this.misPisos.set(pisos);
          pisos.forEach(piso => this.cargarInteresados(piso.id));
        }
      });
    } else {
      this.cargarFavoritos();
      this.cargarMisIntereses();
    }
  }

  subirFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const formData = new FormData();
    formData.append('foto', input.files[0]);
    this.subiendoFoto.set(true);
    this.http.post<any>('http://localhost:8000/api/perfil/foto', formData).subscribe({
      next: (res) => {
        this.auth.setUser({ ...this.auth.user()!, foto_perfil: res.foto_perfil });
        this.subiendoFoto.set(false);
      },
      error: () => this.subiendoFoto.set(false)
    });
  }

  abrirEditarPerfil() {
    const u = this.auth.user();
    this.perfilForm.set({
      nombre: u?.nombre ?? '',
      apellidos: u?.apellidos ?? '',
      telefono: u?.telefono ?? '',
      ciudad: u?.ciudad ?? '',
      descripcion: u?.descripcion ?? '',
      intereses: u?.intereses ?? '',
      fecha_nacimiento: u?.fecha_nacimiento ?? '',
    });
    this.editandoPerfil.set(true);
  }

  guardarPerfil() {
    this.guardandoPerfil.set(true);
    this.http.put<any>('http://localhost:8000/api/me', this.perfilForm()).subscribe({
      next: (usuario) => {
        this.auth.setUser(usuario);
        this.editandoPerfil.set(false);
        this.guardandoPerfil.set(false);
      },
      error: () => this.guardandoPerfil.set(false)
    });
  }

  cancelarEditarPerfil() {
    this.editandoPerfil.set(false);
  }

  cargarInteresados(pisoId: number) {
    this.pisoService.getInteresados(pisoId).subscribe({
      next: (data) => {
        this.interesadosPorPiso.update(prev => ({ ...prev, [pisoId]: data }));
      }
    });
  }

  cargarFavoritos() {
    this.pisoService.getFavoritos().subscribe({
      next: (ids) => {
        if (ids.length === 0) return;
        this.pisoService.getPisos().subscribe({
          next: (pisos) => {
            this.pisosFavoritos.set(pisos.filter(p => ids.includes(p.id)));
          }
        });
      }
    });
  }

  cargarMisIntereses() {
    this.pisoService.getMisIntereses().subscribe({
      next: (pisos) => this.pisosInteresados.set(pisos)
    });
  }

  quitarFavorito(pisoId: number) {
    this.pisoService.removeFavorito(pisoId).subscribe({
      next: () => this.pisosFavoritos.update(favs => favs.filter(p => p.id !== pisoId))
    });
  }

  quitarInteres(pisoId: number) {
    this.pisoService.eliminarInteresado_inquilino(pisoId).subscribe({
      next: () => this.pisosInteresados.update(prev => prev.filter(p => p.id !== pisoId))
    });
  }

  aceptarInteresado(pisoId: number, usuarioId: number) {
    this.pisoService.aceptarInteresado(pisoId, usuarioId).subscribe({
      next: () => this.actualizarEstadoInteresado(pisoId, usuarioId, 'aceptado')
    });
  }

  rechazarInteresado(pisoId: number, usuarioId: number) {
    this.pisoService.rechazarInteresado(pisoId, usuarioId).subscribe({
      next: () => this.actualizarEstadoInteresado(pisoId, usuarioId, 'rechazado')
    });
  }

  private actualizarEstadoInteresado(pisoId: number, usuarioId: number, estado: string) {
    this.interesadosPorPiso.update(prev => ({
      ...prev,
      [pisoId]: prev[pisoId].map(i =>
        i.usuario_id === usuarioId ? { ...i, estado } : i
      )
    }));
  }

  eliminarInteresado(pisoId: number, usuarioId: number) {
    this.candidatoAEliminar.set({ pisoId, usuarioId });
  }

  confirmarEliminarCandidato() {
    const c = this.candidatoAEliminar();
    if (!c) return;
    this.pisoService.eliminarInteresado(c.pisoId, c.usuarioId).subscribe({
      next: () => {
        this.candidatoAEliminar.set(null);
        this.cargarInteresados(c.pisoId);
      }
    });
  }

  eliminar(id: number) {
    this.pisoAEliminar.set(id);
  }

  confirmarEliminarPiso() {
    const id = this.pisoAEliminar();
    if (!id) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => {
        this.pisoAEliminar.set(null);
        this.ngOnInit();
      }
    });
  }

  totalCandidatos(): number {
    return Object.values(this.interesadosPorPiso()).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  }

  precioMasBajo(): string | number {
    const pisos = this.misPisos();
    if (!pisos.length) return '—';
    const min = pisos.reduce((acc, piso) => piso.precio < acc ? piso.precio : acc, pisos[0].precio);
    return min + '€';
  }

  calcularEdad(fecha: string | undefined | null): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}