import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: RegisterComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    // protected demo home (replace with real module later)
    // { path: '', canActivate: [AuthGuard], loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    { path: '**', redirectTo: '' }
];
