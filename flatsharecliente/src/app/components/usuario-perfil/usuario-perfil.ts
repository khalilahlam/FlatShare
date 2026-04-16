import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { PisoService } from '../../services/piso';

@Component({
  selector: 'app-usuario-perfil',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './usuario-perfil.html',
})
export class UsuarioPerfil implements OnInit {
  route = inject(ActivatedRoute);
  pisoService = inject(PisoService);

  usuario = signal<any>(null);
  cargando = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pisoService.getUsuario(id).subscribe({
      next: (data) => { this.usuario.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }
}