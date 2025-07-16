import { Injectable } from '@angular/core';
import { User } from '../../models/user';

declare let localStorage: any;

@Injectable({
  providedIn: 'root'
})
export class LocalStroageService {

  public getUserData() {
    const user = localStorage.getItem('user');
    if (!user) {
      return;
    }
    return JSON.parse(user);
  }

  public setUserData(user?: User): void {
    if (!user) {
      return;
    }
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getAccessToken() {
    return localStorage.getItem('listcrm-access-token');
  }

  public setAccessToken(token: string): void {
    localStorage.setItem('listcrm-access-token', token);
  }

  public logout(): void {
    localStorage.setItem('user', '');
    localStorage.setItem('listcrm-access-token', '');
  }
}
