import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ICategoriesRes, ICategory, ISubcategoriesRes, ISubcategory } from '../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private _http = inject(HttpClient);
    private _categoryURL = enveronment.apiURL + 'category';
    private _subcategoryURL = enveronment.apiURL + 'subcategory';

    // Categories
    getCategories(all: boolean = false) {
        let params = new HttpParams();
        if (all) params = params.set('all', 'true');
        return this._http.get<ICategoriesRes>(this._categoryURL, { params });
    }

    getCategoryBySlug(slug: string) {
        return this._http.get<{ message: string; data: ICategory }>(this._categoryURL + '/' + slug);
    }

    addCategory(category: Partial<ICategory>) {
        return this._http.post<{ message: string; data: ICategory }>(this._categoryURL, category);
    }

    updateCategory(id: string, category: Partial<ICategory>) {
        return this._http.put<{ message: string; data: ICategory }>(this._categoryURL + '/' + id, category);
    }

    deleteCategory(id: string) {
        return this._http.delete<{ message: string; data: ICategory }>(this._categoryURL + '/' + id);
    }

    toggleActiveCategory(id: string) {
        return this._http.patch<{ message: string; data: ICategory }>(this._categoryURL + '/' + id + '/toggle-active', {});
    }

    // Subcategories
    getSubcategories(categoryId?: string, all: boolean = false) {
        let params = new HttpParams();
        if (categoryId) params = params.set('categoryId', categoryId);
        if (all) params = params.set('all', 'true');
        return this._http.get<ISubcategoriesRes>(this._subcategoryURL, { params });
    }

    addSubcategory(subcategory: Partial<ISubcategory>) {
        return this._http.post<{ message: string; data: ISubcategory }>(this._subcategoryURL, subcategory);
    }

    updateSubcategory(id: string, subcategory: Partial<ISubcategory>) {
        return this._http.put<{ message: string; data: ISubcategory }>(this._subcategoryURL + '/' + id, subcategory);
    }

    deleteSubcategory(id: string) {
        return this._http.delete<{ message: string; data: ISubcategory }>(this._subcategoryURL + '/' + id);
    }

    toggleActiveSubcategory(id: string) {
        return this._http.patch<{ message: string; data: ISubcategory }>(this._subcategoryURL + '/' + id + '/toggle-active', {});
    }
}
