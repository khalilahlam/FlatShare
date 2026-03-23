import { Pipe, PipeTransform } from '@angular/core';
import { IPiso } from '../services/piso';

@Pipe({
  name: 'maxPriceFilter',
  standalone: true,
})
export class MaxPriceFilterPipe implements PipeTransform {
  transform(pisos: IPiso[] | null | undefined, precioMax: number | null | undefined): IPiso[] {
    if (!pisos?.length) return [];
    if (precioMax == null || Number.isNaN(precioMax) || precioMax <= 0) return pisos;

    return pisos.filter((piso) => Number(piso.precio) <= precioMax);
  }
}
