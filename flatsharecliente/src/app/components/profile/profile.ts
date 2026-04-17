import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PisoService, IPiso, IInteresado } from '../../services/piso';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  pisoService = inject(PisoService);

  misPisos = signal<IPiso[]>([]);
  interesadosPorPiso = signal<{ [pisoId: number]: IInteresado[] }>({});
  pisosFavoritos = signal<IPiso[]>([]);

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
    }
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

  quitarFavorito(pisoId: number) {
    this.pisoService.removeFavorito(pisoId).subscribe({
      next: () => this.pisosFavoritos.update(favs => favs.filter(p => p.id !== pisoId))
    });
  }

  eliminarInteresado(pisoId: number, usuarioId: number) {
    if (!confirm('¿Eliminar este candidato?')) return;
    this.pisoService.eliminarInteresado(pisoId, usuarioId).subscribe({
      next: () => this.cargarInteresados(pisoId)
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este piso?')) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => this.ngOnInit()
    });
  }

  totalCandidatos(): number {
    const interesadosObj = this.interesadosPorPiso();
    return Object.values(interesadosObj).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  }

  precioMasBajo(): string | number {
    const pisos = this.misPisos();
    if (!pisos.length) return '—';
    const min = pisos.reduce((acc, piso) => piso.precio < acc ? piso.precio : acc, pisos[0].precio);
    return min + '€';
  }
}