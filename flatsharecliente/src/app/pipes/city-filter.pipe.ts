import { Pipe, PipeTransform } from '@angular/core';
import { IPiso } from '../services/piso';

@Pipe({
  name: 'cityFilter',
  standalone: true,
})
export class CityFilterPipe implements PipeTransform {
  transform(pisos: IPiso[] | null | undefined, ciudad: string | null | undefined): IPiso[] {
    if (!pisos?.length) return [];
    if (!ciudad?.trim()) return pisos;

    const ciudadNormalizada = this.normalize(ciudad);

    return pisos.filter((piso) => {
      const ciudadPiso = this.normalize(piso.ciudad ?? '');
      const ubicacionPiso = this.normalize(piso.ubicacion ?? '');

      return ciudadPiso === ciudadNormalizada || ubicacionPiso.includes(ciudadNormalizada);
    });
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}
