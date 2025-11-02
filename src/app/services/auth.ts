import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  accessToken: string; // We're now calling it accessToken
  user: { id: string; email: string };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private base = 'http://localhost:3000/api/auth';
  private accessToken: string | null = null; // ✅ Stored only in memory

  private authState = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  register(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password }, { withCredentials: true })
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }
  
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }, { withCredentials: true })
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }

  private handleLoginSuccess(res: AuthResponse) {
    this.accessToken = res.accessToken;
    this.authState.next(true);
  }

  logout() {
    this.accessToken = null;
    this.authState.next(false);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // 👉 Called automatically by interceptor when token is expired
  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      `${this.base}/refresh`,
      {},
      { withCredentials: true } // ✅ Needed to send the refresh cookie
    ).pipe(tap(res => {
      this.accessToken = res.accessToken; // ✅ Store new access token
    }));
  }

  getUsers() {
    return this.http.get<{ users: any[] }>(`${this.base}/users`, {
      withCredentials: true // ✅ REQUIRED
    });
  }
}
