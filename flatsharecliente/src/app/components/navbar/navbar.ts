import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { MensajesService } from '../../services/mensajes';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit, OnDestroy {
  auth = inject(AuthService);
  mensajesService = inject(MensajesService);
  isDarkMode = false;
  noLeidos = signal(0);
  private polling: any;

  ngOnInit() {
    const theme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && systemPrefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }

    if (this.auth.isLoggedIn()) {
      this.cargarNoLeidos();
      this.polling = setInterval(() => this.cargarNoLeidos(), 10000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.polling);
  }

  cargarNoLeidos() {
    if (!this.auth.isLoggedIn()) return;
    this.mensajesService.getNoLeidos().subscribe({
      next: (data) => this.noLeidos.set(data.total),
      error: () => {}
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}