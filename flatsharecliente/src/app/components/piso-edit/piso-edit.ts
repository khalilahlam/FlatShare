import { AfterViewInit, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PisoService } from '../../services/piso';
import { CIUDADES_ESPANA } from '../../constants/ciudades';

declare const L: any;

@Component({
  selector: 'app-piso-edit',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './piso-edit.html',
})
export class PisoEdit implements OnInit, AfterViewInit, OnDestroy {
  fb = inject(FormBuilder);
  pisoService = inject(PisoService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  platformId = inject(PLATFORM_ID);

  error = '';
  cargando = true;
  fotoPreviews: string[] = [];
  fotosSeleccionadas: File[] = [];
  readonly ciudadesDisponibles = [...CIUDADES_ESPANA];
  private map: any;
  private marker: any;
  private readonly defaultCenter: [number, number] = [39.4699, -0.3763];
  private pisoId!: number;

  form = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    precio: [null as number | null, Validators.required],
    ubicacion: ['', Validators.required],
    ciudad: ['', Validators.required],
    num_companeros: [1],
    habitaciones: [1],
    banos: [1],
    metros: [0],
    amueblado: [false],
    lat: [this.defaultCenter[0], Validators.required],
    lng: [this.defaultCenter[1], Validators.required],
  });

  ngOnInit() {
    this.pisoId = Number(this.route.snapshot.paramMap.get('id'));
    this.pisoService.getPiso(this.pisoId).subscribe({
      next: (piso) => {
        this.form.patchValue({
          titulo: piso.titulo,
          descripcion: piso.descripcion,
          precio: piso.precio,
          ubicacion: piso.ubicacion,
          ciudad: piso.ciudad ?? '',
          num_companeros: piso.num_companeros,
          habitaciones: piso.habitaciones,
          banos: piso.banos,
          metros: piso.metros,
          amueblado: piso.amueblado,
          lat: piso.lat ?? this.defaultCenter[0],
          lng: piso.lng ?? this.defaultCenter[1],
        });
        if (piso.fotos) {
          this.fotoPreviews = piso.fotos.map(f => 'http://localhost:8000/storage/' + f.url);
        }
        this.cargando = false;
        setTimeout(() => this.initMap(piso.lat ?? this.defaultCenter[0], piso.lng ?? this.defaultCenter[1]), 0);
      },
      error: () => this.router.navigate(['/pisos'])
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  private initMap(lat: number, lng: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const container = document.getElementById('piso-edit-map');
    if (!container) return;
    this.map = L.map('piso-edit-map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.form.patchValue({ lat, lng });
    });
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  onFotosSelected(event: any) {
    const files: FileList = event.target.files;
    this.fotosSeleccionadas = Array.from(files);
    this.fotoPreviews = [];
    this.fotosSeleccionadas.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.fotoPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  onSubmit() {
    const fd = new FormData();
    fd.append('titulo', this.form.value.titulo ?? '');
    fd.append('descripcion', this.form.value.descripcion ?? '');
    fd.append('precio', String(this.form.value.precio ?? ''));
    fd.append('ubicacion', this.form.value.ubicacion ?? '');
    fd.append('ciudad', this.form.value.ciudad ?? '');
    fd.append('num_companeros', String(this.form.value.num_companeros ?? 1));
    fd.append('habitaciones', String(this.form.value.habitaciones ?? 1));
    fd.append('banos', String(this.form.value.banos ?? 1));
    fd.append('metros', String(this.form.value.metros ?? 0));
    fd.append('amueblado', this.form.value.amueblado ? '1' : '0');
    fd.append('lat', String(this.form.value.lat ?? ''));
    fd.append('lng', String(this.form.value.lng ?? ''));
    fd.append('_method', 'PUT');
    this.fotosSeleccionadas.forEach(foto => fd.append('fotos[]', foto, foto.name));

    this.pisoService.updatePiso(this.pisoId, fd).subscribe({
      next: () => this.router.navigate(['/perfil']),
      error: () => this.error = 'Error al guardar los cambios'
    });
  }
}