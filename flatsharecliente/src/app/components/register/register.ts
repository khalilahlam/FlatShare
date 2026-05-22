import { Component, inject } from '@angular/core';
import { CIUDADES_ESPANA } from '../../constants/ciudades';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password && confirmation && password !== confirmation ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
})
export class Register {
  readonly ciudadesDisponibles = [...CIUDADES_ESPANA];
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';
  submitted = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', Validators.required],
    propietario: [false, Validators.required],
    fecha_nacimiento: [''],
    telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
    ciudad: [''],
    descripcion: [''],
    intereses: [''],
  }, { validators: passwordsIguales });

  get f() { return this.form.controls; }

  get passwordStrength(): { score: number; label: string; color: string } {
    const password = this.form.get('password')?.value || '';
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Muy débil', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Débil', color: 'bg-orange-400' };
    if (score === 3) return { score, label: 'Media', color: 'bg-yellow-400' };
    if (score === 4) return { score, label: 'Fuerte', color: 'bg-blue-500' };
    return { score, label: 'Muy fuerte', color: 'bg-green-500' };
  }

  get passwordChecks() {
    const p = this.form.get('password')?.value || '';
    return {
      length: p.length >= 6,
      uppercase: /[A-Z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/pisos']),
      error: (err) => {
        if (err.status === 422 && err.error?.errors?.email) {
          this.error = 'Este email ya está registrado';
        } else {
          this.error = 'Error al registrarse. Inténtalo de nuevo.';
        }
      }
    });
  }
}