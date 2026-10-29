import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IProductRes, IProductsListRes } from '../models/product.model';

export interface IProductFilters {
    search?: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    all?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'product';

    getAllProducts(filters?: IProductFilters) {
        let params = new HttpParams();
        if (filters) {
            if (filters.search) params = params.set('search', filters.search);
            if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
            if (filters.subcategoryId) params = params.set('subcategoryId', filters.subcategoryId);
            if (filters.minPrice !== undefined && filters.minPrice !== null) params = params.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined && filters.maxPrice !== null) params = params.set('maxPrice', filters.maxPrice.toString());
            if (filters.inStock) params = params.set('inStock', 'true');
            if (filters.sort) params = params.set('sort', filters.sort);
            if (filters.all) params = params.set('all', 'true');
        }
        return this._http.get<IProductsListRes>(this._apiURL, { params });
    }

    getProductBySlug(slug: string) {
        return this._http.get<IProductRes>(this._apiURL + '/' + slug);
    }

    getRelatedProducts(slug: string) {
        return this._http.get<IProductsListRes>(this._apiURL + '/related-products/' + slug);
    }

    addProduct(formData: FormData) {
        return this._http.post<IProductRes>(this._apiURL, formData);
    }

    updateProduct(id: string, formData: FormData | object) {
        return this._http.put<IProductRes>(this._apiURL + '/' + id, formData);
    }

    deleteProduct(id: string) {
        return this._http.delete<IProductRes>(this._apiURL + '/' + id);
    }

    toggleActiveProduct(id: string) {
        return this._http.patch<IProductRes>(this._apiURL + '/' + id + '/toggle-active', {});
    }
}
