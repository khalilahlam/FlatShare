import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PisoService, IPiso } from '../../services/piso';
import { CIUDADES_ESPANA } from '../../constants/ciudades';

@Component({
  selector: 'app-welcome',
  imports: [RouterModule, FormsModule],
  templateUrl: './welcome.html',
})
export class Welcome implements OnInit {
  pisoService = inject(PisoService);
  pisos = signal<IPiso[]>([]);
  readonly ciudadesDisponibles = [...CIUDADES_ESPANA];

  ciudadBusqueda = '';
  precioMaxBusqueda: number | null = null;

  ngOnInit() {
    this.pisoService.getPisos().subscribe({
      next: (data) => this.pisos.set(data.slice(0, 3))
    });
  }

  getBusquedaQueryParams(): { ciudad?: string; precioMax?: number } {
    const queryParams: { ciudad?: string; precioMax?: number } = {};

    if (this.ciudadBusqueda.trim()) {
      queryParams.ciudad = this.ciudadBusqueda.trim();
    }

    if (this.precioMaxBusqueda && this.precioMaxBusqueda > 0) {
      queryParams.precioMax = this.precioMaxBusqueda;
    }

    return queryParams;
  }
}