import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PisoService, IPiso } from '../../services/piso';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';

declare const L: any;

@Component({
  selector: 'app-piso-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './piso-detail.html',
})
export class PisoDetail implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  pisoService = inject(PisoService);
  auth = inject(AuthService);
  http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  piso = signal<IPiso | null>(null);
  fotoActual = signal(0);
  interesado = signal(false);
  cargandoInteres = signal(false);
  favorito = signal(false);
  private map: any;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pisoService.getPiso(id).subscribe({
      next: (data) => {
        this.piso.set(data);
        setTimeout(() => this.renderMap(), 0);
        if (this.auth.isLoggedIn() && !this.auth.isPropietario()) {
          this.http.get<{ interesado: boolean }>('http://localhost:8000/api/pisos/' + id + '/mi-estado')
            .subscribe({ next: (res) => this.interesado.set(res.interesado) });
          this.pisoService.getFavoritos().subscribe({
            next: (favs) => this.favorito.set(favs.includes(id))
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    this.renderMap();
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  toggleFavorito() {
    const pisoId = this.piso()?.id;
    if (!pisoId) return;
    if (this.favorito()) {
      this.pisoService.removeFavorito(pisoId).subscribe({
        next: () => this.favorito.set(false)
      });
    } else {
      this.pisoService.addFavorito(pisoId).subscribe({
        next: () => this.favorito.set(true)
      });
    }
  }

  toggleInteres() {
    const pisoId = this.piso()?.id;
    if (!pisoId || this.cargandoInteres()) return;
    this.cargandoInteres.set(true);
    if (this.interesado()) {
      this.http.delete('http://localhost:8000/api/pisos/' + pisoId + '/interesados').subscribe({
        next: () => { this.interesado.set(false); this.cargandoInteres.set(false); },
        error: () => this.cargandoInteres.set(false)
      });
    } else {
      this.http.post('http://localhost:8000/api/pisos/' + pisoId + '/interesados', {}).subscribe({
        next: () => { this.interesado.set(true); this.cargandoInteres.set(false); },
        error: () => this.cargandoInteres.set(false)
      });
    }
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
    return 'http://localhost:8000/storage/' + url;
  }

  private renderMap() {
    if (!isPlatformBrowser(this.platformId)) return;
    const piso = this.piso();
    if (!piso || piso.lat == null || piso.lng == null) return;
    const mapContainer = document.getElementById('piso-detail-map');
    if (!mapContainer) return;
    if (this.map) this.map.remove();
    this.map = L.map('piso-detail-map').setView([piso.lat, piso.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    L.marker([piso.lat, piso.lng])
      .addTo(this.map)
      .bindPopup('<b>' + piso.titulo + '</b><br>' + piso.ubicacion)
      .openPopup();
    setTimeout(() => this.map.invalidateSize(), 0);
  }
}