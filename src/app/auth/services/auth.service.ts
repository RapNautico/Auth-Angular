import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResponse, User } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl;
  private _user!: User;

  get user(): User {
    return {...this._user};
  }

  constructor( private http: HttpClient) { }

  login(email: string, password: string) {

    const url = `${this.baseUrl}/auth/sign_in`;

    return this.http.post<AuthResponse>(url, { email, password })
      .pipe(
        tap( resp => {
          localStorage.setItem('token', resp.token!);
          if (resp.ok) {
            this._user = {
              uid: resp.uid,
              name: resp.name
            };
          }
        }),
        map( resp => resp.ok),
        catchError( err => of(err.error.msg))
      )
  }

  validarToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get<AuthResponse>(url, { headers})
      .pipe(
        map( resp => {

          localStorage.setItem('token', resp.token!);
          if (resp.ok) {
            this._user = {
              uid: resp.uid,
              name: resp.name
            };
          }
          return resp.ok;
        }),
        catchError( err => of(false))
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  register( name: string, email: string, password: string) {

    const url = `${this.baseUrl}/auth/new`;

    return this.http.post<AuthResponse>(url, { name, email, password })
    .pipe(
      tap( resp => {
        localStorage.setItem('token', resp.token!);
        if (resp.ok) {
          this._user = {
            uid: resp.uid,
            name: resp.name
          };
        }
      }),
      map( resp => resp.ok),
      catchError( err => of(err.error.msg))
    )
  }
}
