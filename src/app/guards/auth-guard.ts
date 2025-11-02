import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // If access token exists return true
    if (this.auth.getAccessToken()) {
      return of(true);
    }

    // No access token → try refresh token
    return this.auth.refreshToken().pipe(
      switchMap(() => of(true)), // refresh success → OK
      catchError(() => {
        // refresh failed → go login
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
