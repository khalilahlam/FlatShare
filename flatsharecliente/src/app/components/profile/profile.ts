import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PisoService, IPiso } from '../../services/piso';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  pisoService = inject(PisoService);
  misPisos = signal<IPiso[]>([]);

  ngOnInit() {
    if (this.auth.isPropietario()) {
      this.pisoService.getPisos().subscribe({
        next: (data) => {
          const misId = this.auth.user()?.id;
          this.misPisos.set(data.filter(p => p.usuario_id === misId));
        }
      });
    }
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este piso?')) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => this.ngOnInit()
    });
  }
}