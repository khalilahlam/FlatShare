import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PisoService, IPiso } from '../../services/piso';

@Component({
  selector: 'app-welcome',
  imports: [RouterModule],
  templateUrl: './welcome.html',
})
export class Welcome implements OnInit {
  pisoService = inject(PisoService);
  pisos = signal<IPiso[]>([]);

  ngOnInit() {
    this.pisoService.getPisos().subscribe({
      next: (data) => this.pisos.set(data.slice(0, 3))
    });
  }
}