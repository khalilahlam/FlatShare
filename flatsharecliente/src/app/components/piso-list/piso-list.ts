import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PisoService, IPiso } from '../../services/piso';
import { CityFilterPipe } from '../../pipes/city-filter.pipe';
import { MaxPriceFilterPipe } from '../../pipes/max-price-filter.pipe';
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
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cityFilterPipe = new CityFilterPipe();
  private maxPriceFilterPipe = new MaxPriceFilterPipe();
  auth = inject(AuthService);

  pisos = signal<IPiso[]>([]);
  activeId = signal<number | null>(null);
  filtroCiudad = signal<string | null>(null);
  filtroPrecioMax = signal<number | null>(null);
  filtroHabitaciones = signal<number | null>(null);
  filtroAmueblado = signal<boolean | null>(null);

  filteredPisos = computed(() => {
    let resultado = this.cityFilterPipe.transform(this.pisos(), this.filtroCiudad());
    resultado = this.maxPriceFilterPipe.transform(resultado, this.filtroPrecioMax());
    if (this.filtroHabitaciones()) {
      resultado = resultado.filter(p => p.habitaciones >= this.filtroHabitaciones()!);
    }
    if (this.filtroAmueblado() !== null) {
      resultado = resultado.filter(p => p.amueblado === this.filtroAmueblado());
    }
    return resultado;
  });

  private map: any;
  private markersLayer: any;
  private markers: { id: number; marker: any }[] = [];
  private readonly defaultCenter: [number, number] = [39.4699, -0.3763];

  constructor() {
    effect(() => { this.renderMapMarkers(this.filteredPisos()); });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe({
      next: (params) => {
        const ciudad = params.get('ciudad')?.trim() || null;
        const precioMaxParam = Number(params.get('precioMax'));
        this.filtroCiudad.set(ciudad);
        this.filtroPrecioMax.set(Number.isNaN(precioMaxParam) || precioMaxParam <= 0 ? null : precioMaxParam);
      }
    });
    this.cargarPisos();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.map = L.map('pisos-map').setView(this.defaultCenter, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderMapMarkers(this.filteredPisos());
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  private cargarPisos() {
    this.pisoService.getPisos().subscribe({
      next: (data) => this.pisos.set(data),
      error: (err) => console.error(err)
    });
  }

  limpiarFiltros() {
    this.filtroCiudad.set(null);
    this.filtroPrecioMax.set(null);
    this.filtroHabitaciones.set(null);
    this.filtroAmueblado.set(null);
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este piso?')) return;
    this.pisoService.deletePiso(id).subscribe({
      next: () => this.cargarPisos()
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
    const validPisos = pisos.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    if (validPisos.length === 0) { this.map.setView(this.defaultCenter, 13); return; }
    const bounds = L.latLngBounds([]);
    validPisos.forEach(piso => {
      const titulo = this.escapeHtml(piso.titulo ?? 'Piso');
      const ubicacion = this.escapeHtml(piso.ubicacion ?? '');
      const imagen = piso.fotos?.length ? 'http://localhost:8000/storage/' + piso.fotos[0].url : '';
      const popup = '<div style="width:220px">'
        + (imagen ? '<img src="' + imagen + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">' : '')
        + '<h4 style="font-weight:bold;margin:6px 0">' + titulo + '</h4>'
        + '<p style="color:gray;font-size:13px">📍 ' + ubicacion + '</p>'
        + '<a href="/pisos/' + piso.id + '" style="display:block;margin-top:8px;text-align:center;background:#2563eb;color:white;padding:6px;border-radius:6px;text-decoration:none;">Ver detalle</a>'
        + '</div>';
      const marker = L.marker([piso.lat as number, piso.lng as number]).bindPopup(popup);
      marker.addTo(this.markersLayer);
      marker.on('click', () => {
        this.activeId.set(piso.id);
        const card = document.querySelector('[data-id="' + piso.id + '"]');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      this.markers.push({ id: piso.id, marker });
      bounds.extend([piso.lat as number, piso.lng as number]);
    });
    this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }

  private escapeHtml(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }
}