import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PisoService } from '../../services/piso';

@Component({
  selector: 'app-piso-create',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './piso-create.html',
})
export class PisoCreate {
  fb = inject(FormBuilder);
  pisoService = inject(PisoService);
  router = inject(Router);
  error = '';
  fotoPreviews: string[] = [];
  fotosSeleccionadas: File[] = [];

  form = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    precio: [null, Validators.required],
    ubicacion: ['', Validators.required],
    num_companeros: [1],
    habitaciones: [1],
    banos: [1],
    metros: [0],
    amueblado: [false],
  });

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
    fd.append('num_companeros', String(this.form.value.num_companeros ?? 1));
    fd.append('habitaciones', String(this.form.value.habitaciones ?? 1));
    fd.append('banos', String(this.form.value.banos ?? 1));
    fd.append('metros', String(this.form.value.metros ?? 0));
    fd.append('amueblado', this.form.value.amueblado ? '1' : '0');

    this.fotosSeleccionadas.forEach(foto => {
      fd.append('fotos[]', foto, foto.name);
    });

    this.pisoService.createPiso(fd).subscribe({
      next: () => this.router.navigate(['/pisos']),
      error: () => this.error = 'Error al crear el piso'
    });
  }
}