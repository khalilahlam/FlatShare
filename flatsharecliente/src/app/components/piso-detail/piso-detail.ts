import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PisoService, IPiso } from '../../services/piso';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-piso-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './piso-detail.html',
})
export class PisoDetail implements OnInit {
  route = inject(ActivatedRoute);
  pisoService = inject(PisoService);
  auth = inject(AuthService);

  piso = signal<IPiso | null>(null);
  fotoActual = signal(0);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pisoService.getPiso(id).subscribe({
      next: (data) => this.piso.set(data),
      error: (err) => console.error(err)
    });
  }

  fotoAnterior() {
    const fotos = this.piso()?.fotos ?? [];
    this.fotoActual.set((this.fotoActual() - 1 + fotos.length) % fotos.length);
  }

  fotoSiguiente() {
    const fotos = this.piso()?.fotos ?? [];
    this.fotoActual.set((this.fotoActual() + 1) % fotos.length);
  }

  getFotoUrl(url: string) {
    return `http://localhost:8000/storage/${url}`;
  }
}