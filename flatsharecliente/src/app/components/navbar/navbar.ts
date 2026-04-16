import { Component, inject, OnInit } from '@angular/core'; // Añadido OnInit
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // ¡IMPORTANTE!
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true, // Asegúrate de que sea standalone
  imports: [RouterModule, CommonModule], // Añadido CommonModule
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  isDarkMode = false;

  ngOnInit() {
    // Leer preferencia guardada al iniciar
    const theme = localStorage.getItem('theme');
    // Si no hay tema guardado, podemos chequear la preferencia del sistema
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (!theme && systemPrefersDark)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }
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
