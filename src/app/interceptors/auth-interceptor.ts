// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  // endpoints to skip auto-refresh (prevent loop)
  private authUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding Authorization for refresh/login/register calls
    if (!this.isAuthUrl(req.url)) {
      const token = this.auth.getAccessToken();
      if (token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log('Error',err);
        // only handle 401 (unauthorized)
        if (err.status === 401 && !this.isAuthUrl(req.url)) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private isAuthUrl(url: string): boolean {
    return this.authUrls.some(u => url.endsWith(u));
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshToken().pipe(
        switchMap((res) => {
          const newToken = res.accessToken ?? (res as any);
          this.refreshSubject.next(newToken);
          // retry original request with new token
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
          return next.handle(cloned);
        }),
        catchError(err => {
          // refresh failed — logout
          this.auth.logout();
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // wait for ongoing refresh to finish, then retry
      return this.refreshSubject.pipe(
        filter(t => t != null),
        take(1),
        switchMap((token) => {
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(cloned);
        })
      );
    }
  }
}
