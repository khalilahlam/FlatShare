import { AfterViewInit, Component, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PisoService } from '../../services/piso';
import { CIUDADES_ESPANA } from '../../constants/ciudades';

declare const L: any;

@Component({
  selector: 'app-piso-create',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './piso-create.html',
})
export class PisoCreate implements AfterViewInit, OnDestroy {
  fb = inject(FormBuilder);
  pisoService = inject(PisoService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  error = '';
  fotoPreviews: string[] = [];
  fotosSeleccionadas: File[] = [];
  readonly ciudadesDisponibles = [...CIUDADES_ESPANA];
  private map: any;
  private marker: any;
  private readonly defaultCenter: [number, number] = [39.4699, -0.3763];

  form = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    precio: [null, Validators.required],
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

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.map = L.map('piso-create-map').setView(this.defaultCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(this.defaultCenter).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.form.patchValue({ lat, lng });
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
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
    fd.append('precio', this.form.value.precio ?? '');
    fd.append('ubicacion', this.form.value.ubicacion ?? '');
    fd.append('ciudad', this.form.value.ciudad ?? '');
    fd.append('num_companeros', String(this.form.value.num_companeros ?? 1));
    fd.append('habitaciones', String(this.form.value.habitaciones ?? 1));
    fd.append('banos', String(this.form.value.banos ?? 1));
    fd.append('metros', String(this.form.value.metros ?? 0));
    fd.append('amueblado', this.form.value.amueblado ? '1' : '0');
    fd.append('lat', String(this.form.value.lat ?? ''));
    fd.append('lng', String(this.form.value.lng ?? ''));

    this.fotosSeleccionadas.forEach(foto => {
      fd.append('fotos[]', foto, foto.name);
    });

    this.pisoService.createPiso(fd).subscribe({
      next: () => this.router.navigate(['/pisos']),
      error: () => this.error = 'Error al crear el piso'
    });
  }
}