import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import{ PisoService } from '../../services/piso';
import { IPiso } from '../../services/piso';

import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-piso-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './piso-list.html',
})
export class PisoList implements OnInit {
  private pisoService = inject(PisoService);
  auth = inject(AuthService);

  pisos = signal<IPiso[]>([]);

  ngOnInit() {
    this.pisoService.getPisos().subscribe({
      next: (data) => this.pisos.set(data),
      error: (err) => console.error(err)
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este piso?')) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => this.ngOnInit()
    });
  }
}