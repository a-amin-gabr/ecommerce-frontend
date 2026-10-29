import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct } from '../../core/models/product.model';
import { ICategory, ISubcategory } from '../../core/models/category.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class DashboardProducts implements OnInit {
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _cdr = inject(ChangeDetectorRef);

  products: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  isLoading = false;
  staticURL = enveronment.staticURL;

  // Search filter
  searchQuery = '';

  // Add / Edit Modal state
  showModal = false;
  editingProductId: string | null = null;
  formName = '';
  formDesc = '';
  formPrice: number = 0;
  formStock: number = 0;
  formSlug = '';
  formCategoryId = '';
  formSubcategoryId = '';
  formIsActive = true;
  selectedFile: File | null = null;
  modalError = '';
  isSaving = false;

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
  }

  fetchProducts(): void {
    this.isLoading = true;
    this._productService.getAllProducts({ all: true, search: this.searchQuery || undefined }).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  fetchCategories(): void {
    this._categoryService.getCategories(true).subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this._cdr.detectChanges();
      }
    });
  }

  onFormCategoryChange(): void {
    this.formSubcategoryId = '';
    if (this.formCategoryId) {
      this._categoryService.getSubcategories(this.formCategoryId, true).subscribe({
        next: (res) => {
          this.subcategories = res.data || [];
          this._cdr.detectChanges();
        }
      });
    } else {
      this.subcategories = [];
    }
  }

  openAddModal(): void {
    this.editingProductId = null;
    this.formName = '';
    this.formDesc = '';
    this.formPrice = 100;
    this.formStock = 10;
    this.formSlug = '';
    this.formCategoryId = this.categories.length > 0 ? this.categories[0]._id : '';
    this.formSubcategoryId = '';
    this.formIsActive = true;
    this.selectedFile = null;
    this.modalError = '';
    this.showModal = true;
    this.onFormCategoryChange();
  }

  openEditModal(p: IProduct): void {
    this.editingProductId = p._id;
    this.formName = p.name || p.title || '';
    this.formDesc = p.desc || p.description || '';
    this.formPrice = p.price;
    this.formStock = p.stock;
    this.formSlug = p.slug;
    this.formCategoryId = typeof p.categoryId === 'object' ? p.categoryId?._id || '' : p.categoryId || '';
    this.formSubcategoryId = typeof p.subcategoryId === 'object' ? p.subcategoryId?._id || '' : p.subcategoryId || '';
    this.formIsActive = p.isActive !== false;
    this.selectedFile = null;
    this.modalError = '';
    this.showModal = true;
    this.onFormCategoryChange();
  }

  closeModal(): void {
    this.showModal = false;
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  autoGenerateSlug(): void {
    if (!this.editingProductId && this.formName) {
      this.formSlug = this.formName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  saveProduct(): void {
    if (!this.formName.trim() || !this.formSlug.trim()) {
      this.modalError = 'Product name and slug are required.';
      return;
    }

    this.isSaving = true;
    this.modalError = '';

    const formData = new FormData();
    formData.append('name', this.formName.trim());
    formData.append('title', this.formName.trim());
    formData.append('desc', this.formDesc.trim());
    formData.append('description', this.formDesc.trim());
    formData.append('price', this.formPrice.toString());
    formData.append('stock', this.formStock.toString());
    formData.append('slug', this.formSlug.trim());
    formData.append('isActive', this.formIsActive.toString());
    if (this.formCategoryId) formData.append('categoryId', this.formCategoryId);
    if (this.formSubcategoryId) formData.append('subcategoryId', this.formSubcategoryId);
    if (this.selectedFile) formData.append('img', this.selectedFile);

    if (this.editingProductId) {
      this._productService.updateProduct(this.editingProductId, formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.fetchProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err.error?.message || err.error?.error || 'Update failed.';
          this._cdr.detectChanges();
        }
      });
    } else {
      this._productService.addProduct(formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.fetchProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.modalError = err.error?.message || err.error?.error || 'Creation failed.';
          this._cdr.detectChanges();
        }
      });
    }
  }

  toggleActive(p: IProduct): void {
    this._productService.toggleActiveProduct(p._id).subscribe({
      next: (res) => {
        p.isActive = res.data.isActive;
        this._cdr.detectChanges();
      }
    });
  }

  softDelete(p: IProduct): void {
    if (confirm(`Are you sure you want to soft-delete "${p.name}"? It will be archived and will not break past orders.`)) {
      this._productService.deleteProduct(p._id).subscribe({
        next: () => {
          this.fetchProducts();
        }
      });
    }
  }

  getImageUrl(p: IProduct): string {
    if (!p.imgURL) return 'assets/placeholder.jpg';
    if (p.imgURL.startsWith('http')) return p.imgURL;
    return this.staticURL + p.imgURL;
  }
}
