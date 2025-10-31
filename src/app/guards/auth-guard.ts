import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$().pipe(
      take(1),
      map(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        return true;
      })
    );
  }
}
