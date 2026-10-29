import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IOrder, IOrderRes, IOrdersListRes } from '../models/order.model';

export interface ICreateOrderPayload {
    addressId?: string;
    addressSnapshot?: {
        title: string;
        addressData: string;
        city: string;
    };
    mobileSnapshot?: string;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'order';

    createOrder(payload: ICreateOrderPayload) {
        return this._http.post<IOrderRes>(this._apiURL, payload);
    }

    getMyOrders() {
        return this._http.get<IOrdersListRes>(this._apiURL + '/my-orders');
    }

    cancelMyOrder(orderId: string) {
        return this._http.patch<IOrderRes>(this._apiURL + '/cancel/' + orderId, {});
    }

    getAllOrders(status?: string, date?: string) {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (date) params = params.set('date', date);
        return this._http.get<IOrdersListRes>(this._apiURL, { params });
    }

    updateOrderStatus(orderId: string, status: string) {
        return this._http.patch<IOrderRes>(this._apiURL + '/' + orderId + '/status', { status });
    }

    getOrderById(orderId: string) {
        return this._http.get<IOrderRes>(this._apiURL + '/' + orderId);
    }
}
