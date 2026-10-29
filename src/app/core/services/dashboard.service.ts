import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IDashboardRes } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'dashboard';
    getDashboardStats() {
        return this._http.get<IDashboardRes>(this._apiURL + '/stats');
    }
}
