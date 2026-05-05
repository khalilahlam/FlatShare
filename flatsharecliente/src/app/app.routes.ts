import { Routes } from '@angular/router';
import { Welcome } from './components/welcome/welcome';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { PisoList } from './components/piso-list/piso-list';
import { PisoCreate } from './components/piso-create/piso-create';
import { PisoEdit } from './components/piso-edit/piso-edit';
import { PisoDetail } from './components/piso-detail/piso-detail';
import { Profile } from './components/profile/profile';
import { authGuard } from './auth/auth-guard';
import { UsuarioPerfil } from './components/usuario-perfil/usuario-perfil';
import { Mensajes } from './components/mensajes/mensajes';
import { PrivacidadComponent } from './components/privacidad/privacidad';
import { Terminos } from './components/terminos/terminos';
import { Footer } from './components/footer/footer';
import { Cookies } from './components/cookies/cookies';
import { NotFound } from './components/not-found/not-found';




export const routes: Routes = [
    { path: '', component: Welcome },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'pisos', component: PisoList },
    { path: 'pisos/create', component: PisoCreate, canActivate: [authGuard] },
    { path: 'pisos/:id/edit', component: PisoEdit, canActivate: [authGuard] },
    { path: 'pisos/:id', component: PisoDetail },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: 'usuarios/:id', component: UsuarioPerfil, canActivate: [authGuard] },
    { path: 'mensajes', component: Mensajes, canActivate: [authGuard] },
    { path: 'privacidad', component: PrivacidadComponent },
    { path: 'terminos', component: Terminos },
    { path: 'cookies', component: Cookies },
    { path: '**', component: NotFound },
];