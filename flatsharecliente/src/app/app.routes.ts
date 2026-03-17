import { Routes } from '@angular/router';
import { Welcome } from './components/welcome/welcome';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { PisoList } from './components/piso-list/piso-list';
import { PisoCreate } from './components/piso-create/piso-create';
import { PisoDetail } from './components/piso-detail/piso-detail';
import { Profile } from './components/profile/profile';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
    { path: '', component: Welcome },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'pisos', component: PisoList },
    { path: 'pisos/create', component: PisoCreate, canActivate: [authGuard] },
    { path: 'pisos/:id', component: PisoDetail },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: '' },
];