import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService, IProductFilters } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct } from '../../core/models/product.model';
import { ICategory, ISubcategory } from '../../core/models/category.model';
import { Product } from './product/product';
import { Subscription } from 'rxjs';

@Component({
  imports: [Product, CommonModule, FormsModule],
  selector: 'app-productslist',
  styleUrl: './productslist.css',
  templateUrl: './productslist.html',
})
export class Productslist implements OnInit, OnDestroy {
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  products: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  isLoading = false;

  // Filter state
  searchTerm = '';
  selectedCategoryId = '';
  selectedSubcategoryId = '';
  inStockOnly = false;
  selectedSort = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadCategories();

    // Check for queryParams (e.g. ?category=... or ?search=... or ?inStock=true)
    this._subscriptions.add(
      this._activatedRoute.queryParams.subscribe(params => {
        if (params['search']) this.searchTerm = params['search'];
        if (params['category']) {
          this.selectedCategoryId = params['category'];
          this._categoryService.getSubcategories(this.selectedCategoryId).subscribe({
            next: (res) => {
              this.subcategories = res.data || [];
              this._cdr.detectChanges();
            }
          });
        }
        if (params['inStock'] === 'true' || params['inStock'] === true) {
          this.inStockOnly = true;
        }
        this.fetchProducts();
      })
    );
  }

  loadCategories(): void {
    this._categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this._cdr.detectChanges();
      }
    });
  }

  onCategoryChange(): void {
    this.selectedSubcategoryId = '';
    if (this.selectedCategoryId) {
      this._categoryService.getSubcategories(this.selectedCategoryId).subscribe({
        next: (res) => {
          this.subcategories = res.data || [];
          this._cdr.detectChanges();
        }
      });
    } else {
      this.subcategories = [];
    }
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoading = true;
    const filters: IProductFilters = {
      search: this.searchTerm.trim() || undefined,
      categoryId: this.selectedCategoryId || undefined,
      subcategoryId: this.selectedSubcategoryId || undefined,
      inStock: this.inStockOnly ? true : undefined,
      sort: this.selectedSort || undefined,
      minPrice: this.minPrice !== null ? this.minPrice : undefined,
      maxPrice: this.maxPrice !== null ? this.maxPrice : undefined
    };

    this._productService.getAllProducts(filters).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = '';
    this.selectedSubcategoryId = '';
    this.inStockOnly = false;
    this.selectedSort = 'newest';
    this.minPrice = null;
    this.maxPrice = null;
    this.subcategories = [];
    this.fetchProducts();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
