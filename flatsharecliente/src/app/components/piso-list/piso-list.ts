import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import{ PisoService } from '../../services/piso';
import { IPiso } from '../../services/piso';

import { AuthService } from '../../services/auth';

declare const L: any;
@Component({
  selector: 'app-piso-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './piso-list.html',
})
export class PisoList implements OnInit, AfterViewInit, OnDestroy {
  private pisoService = inject(PisoService);
  private platformId = inject(PLATFORM_ID);
  auth = inject(AuthService);

  pisos = signal<IPiso[]>([]);
  private map: any;
  private markersLayer: any;
  private readonly defaultCenter: [number, number] = [39.4699, -0.3763];

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.map = L.map('pisos-map').setView(this.defaultCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderMapMarkers(this.pisos());

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  ngOnInit() {
    this.pisoService.getPisos().subscribe({
      next: (data) => {
        this.pisos.set(data);
        this.renderMapMarkers(data);
      },
      error: (err) => console.error(err)
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este piso?')) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => this.ngOnInit()
    });
  }

  private renderMapMarkers(pisos: IPiso[]) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const validPisos = pisos.filter(
      piso => typeof piso.lat === 'number' && typeof piso.lng === 'number'
    );

    if (validPisos.length === 0) {
      this.map.setView(this.defaultCenter, 13);
      return;
    }

    const bounds = L.latLngBounds([]);

    validPisos.forEach(piso => {
      const titulo = this.escapeHtml(piso.titulo ?? 'Piso');
      const ubicacion = this.escapeHtml(piso.ubicacion ?? '');
      const marker = L.marker([piso.lat as number, piso.lng as number])
        .bindPopup(`<b>${titulo}</b><br>${ubicacion}`);

      marker.addTo(this.markersLayer);
      bounds.extend([piso.lat as number, piso.lng as number]);
    });

    this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }

  private escapeHtml(text: string): string {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}