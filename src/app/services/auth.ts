import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  user: { id: string; email: string; };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private base = 'http://localhost:4000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private authState = new BehaviorSubject<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {}

  isAuthenticated$(): Observable<boolean> {
    return this.authState.asObservable();
  }

  register(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password })
      .pipe(tap(r => this.setSession(r)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap(r => this.setSession(r)));
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.authState.next(true);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser() {
    const u = localStorage.getItem(this.userKey);
    return u ? JSON.parse(u) : null;
  }
}
