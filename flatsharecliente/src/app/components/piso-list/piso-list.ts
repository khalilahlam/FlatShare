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
  styleUrl: './piso-list.css',
})
export class PisoList implements OnInit, AfterViewInit, OnDestroy {
  private pisoService = inject(PisoService);
  private platformId = inject(PLATFORM_ID);
  auth = inject(AuthService);

  pisos = signal<IPiso[]>([]);
  activeId = signal<number | null>(null);
  private map: any;
  private markersLayer: any;
  private markers: { id: number; marker: any }[] = [];
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

  flyToPiso(piso: IPiso) {
    if (!this.map || !piso.lat || !piso.lng) return;
    this.activeId.set(piso.id);
    this.map.setView([piso.lat, piso.lng], 16);
    const m = this.markers.find(m => m.id === piso.id);
    if (m) m.marker.openPopup();
  }

  private renderMapMarkers(pisos: IPiso[]) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    this.markers = [];

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
      const imagen = piso.fotos?.length
        ? `http://localhost:8000/storage/${piso.fotos[0].url}`
        : '';

      const popup = `
        <div style="width:220px">
          ${imagen ? `<img src="${imagen}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">` : ''}
          <h4 style="font-weight:bold;margin:6px 0">${titulo}</h4>
          <p style="color:gray;font-size:13px">📍 ${ubicacion}</p>
          <a href="/pisos/${piso.id}" style="
            display:block;
            margin-top:8px;
            text-align:center;
            background:#2563eb;
            color:white;
            padding:6px;
            border-radius:6px;
            text-decoration:none;
          ">Ver detalle</a>
        </div>
      `;

      const marker = L.marker([piso.lat as number, piso.lng as number])
        .bindPopup(popup);

      marker.addTo(this.markersLayer);

      marker.on('click', () => {
        this.activeId.set(piso.id);
        const card = document.querySelector(`[data-id="${piso.id}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      this.markers.push({ id: piso.id, marker });
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