import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAddress, IUser, IUserListRes } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'user';

    getUsers(search?: string, role?: string) {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        if (role) params = params.set('role', role);
        return this._http.get<IUserListRes>(this._apiURL, { params });
    }

    addAdmin(data: { name: string; email: string; password: string; phone?: string }) {
        return this._http.post<{ message: string; data: IUser }>(this._apiURL + '/add-admin', data);
    }

    toggleBlock(userId: string) {
        return this._http.patch<{ message: string; data: { _id: string; isBlocked: boolean } }>(
            this._apiURL + '/' + userId + '/toggle-block',
            {}
        );
    }

    updateProfile(data: { name?: string; phone?: string }) {
        return this._http.patch<{ message: string; data: IUser }>(this._apiURL + '/profile', data);
    }

    addAddress(address: IAddress) {
        return this._http.post<{ message: string; data: IAddress[] }>(this._apiURL + '/address', address);
    }

    updateAddress(addressId: string, address: IAddress) {
        return this._http.put<{ message: string; data: IAddress[] }>(this._apiURL + '/address/' + addressId, address);
    }

    deleteAddress(addressId: string) {
        return this._http.delete<{ message: string; data: IAddress[] }>(this._apiURL + '/address/' + addressId);
    }

    setDefaultAddress(addressId: string) {
        return this._http.patch<{ message: string; data: IAddress[] }>(
            this._apiURL + '/address/' + addressId + '/default',
            {}
        );
    }
}
