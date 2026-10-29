import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IFAQ, IFAQLIstRes, IFAQRes } from '../models/faq.model';

@Injectable({
    providedIn: 'root'
})
export class FAQService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'faq';

    getFAQs(category?: string) {
        let params = new HttpParams();
        if (category) params = params.set('category', category);
        return this._http.get<IFAQLIstRes>(this._apiURL, { params });
    }

    addFAQ(faq: Partial<IFAQ>) {
        return this._http.post<IFAQRes>(this._apiURL, faq);
    }

    updateFAQ(id: string, faq: Partial<IFAQ>) {
        return this._http.put<IFAQRes>(this._apiURL + '/' + id, faq);
    }

    deleteFAQ(id: string) {
        return this._http.delete<IFAQRes>(this._apiURL + '/' + id);
    }
}
