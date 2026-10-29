import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ILoginData, ILoginRes, ISignupData, IToken } from '../models/auth.model';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'auth';
    private _router = inject(Router);

    private tokenKey = 'token';
    private userData = new BehaviorSubject<IToken | null>(null);

    constructor() {
        this.checkIfLogedin();
    }

    getUserData() {
        return this.userData.asObservable();
    }

    getCurrentUser(): IToken | null {
        return this.userData.value;
    }

    isLoggedIn(): boolean {
        return !!this.userData.value;
    }

    checkIfLogedin() {
        const token = this.getToken();
        if (token) {
            const decode = this.decodeToken(token);
            if (decode?.exp) {
                const expiryDate = decode.exp * 1000;
                if (Date.now() < expiryDate) {
                    this.userData.next(decode);
                    return;
                }
            }
        }
        this.logOut();
    }

    ifLogedinWithRole(role: string): boolean {
        const token = this.getToken();
        if (token) {
            const decode = this.decodeToken(token);
            if (decode?.exp) {
                const expiryDate = decode.exp * 1000;
                if (Date.now() < expiryDate) {
                    if (decode.role === role) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    logOut() {
        this.deleteToken();
        this.userData.next(null);
    }

    login(data: ILoginData) {
        return this._http.post<ILoginRes>(this._apiURL + '/login', data).pipe(
            tap((res) => {
                if (res.data) {
                    const myUserInfo = this.decodeToken(res.data);
                    if (myUserInfo) {
                        this.saveToken(res.data);
                        this.userData.next(myUserInfo);
                    }
                }
            })
        );
    }

    register(data: ISignupData) {
        return this._http.post<ILoginRes>(this._apiURL + '/register', data).pipe(
            tap((res) => {
                if (res.data) {
                    const myUserInfo = this.decodeToken(res.data);
                    if (myUserInfo) {
                        this.saveToken(res.data);
                        this.userData.next(myUserInfo);
                    }
                }
            })
        );
    }

    getMe() {
        return this._http.get<{ message: string; data: any }>(this._apiURL + '/me');
    }

    private saveToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private deleteToken() {
        localStorage.removeItem(this.tokenKey);
    }

    decodeToken(token: string): IToken | null {
        try {
            return jwtDecode<IToken>(token);
        } catch (err) {
            return null;
        }
    }
}
