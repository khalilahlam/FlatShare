import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './privacidad.html',
})
export class PrivacidadComponent {}