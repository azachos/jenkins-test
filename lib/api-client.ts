import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Environment } from './interfaces/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiClient {

  constructor(private http: HttpClient, @Inject('env') private environment: Environment) { }

  get<T extends object>(endpoint: string, withCredentials: boolean = true) {
    return this.http.get(`${this.environment.serverUrl}${endpoint}`, { withCredentials }) as Observable<T>;
  }

  post<T extends object>(endpoint: string, data: any, withCredentials: boolean = true) {
    return this.http.post(`${this.environment.serverUrl}${endpoint}`, data, { withCredentials }) as Observable<T>;
  }

}
