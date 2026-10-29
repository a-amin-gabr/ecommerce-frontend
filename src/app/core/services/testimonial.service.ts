import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ITestimonial, ITestimonialRes, ITestimonialsListRes } from '../models/testimonial.model';

@Injectable({
    providedIn: 'root'
})
export class TestimonialService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'testimonial';

    getApprovedTestimonials() {
        return this._http.get<ITestimonialsListRes>(this._apiURL);
    }

    submitTestimonial(data: { userName?: string; rating: number; comment: string }) {
        return this._http.post<ITestimonialRes>(this._apiURL, data);
    }

    getAllTestimonials(status?: string) {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        return this._http.get<ITestimonialsListRes>(this._apiURL + '/all', { params });
    }

    updateTestimonialStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
        return this._http.patch<ITestimonialRes>(this._apiURL + '/' + id + '/status', { status });
    }

    deleteTestimonial(id: string) {
        return this._http.delete<ITestimonialRes>(this._apiURL + '/' + id);
    }
}
