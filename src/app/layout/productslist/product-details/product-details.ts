import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { IProduct } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';
import { Product } from '../product/product';

@Component({
  imports: [Product, RouterLink, CommonModule],
  selector: 'app-product-details',
  styleUrl: './product-details.css',
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  private _productService = inject(ProductService);
  private _cartService = inject(CartService);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  myProduct!: IProduct;
  relatedProducts: IProduct[] = [];
  staticURL = enveronment.staticURL;

  quantity: number = 1;
  isAdding: boolean = false;
  addedSuccess: boolean = false;

  ngOnInit(): void {
    this._activatedRoute.data.subscribe(data => {
      const res = data['productRes'];
      if (res?.data) {
        this.myProduct = res.data;
        this.quantity = 1;
        this.fetchRelated(res.data.slug);
        this._cdr.detectChanges();
      } else {
        const slug = this._activatedRoute.snapshot.paramMap.get('slug');
        if (slug) {
          this.loadProduct(slug);
        }
      }
    });
  }

  loadProduct(slug: string): void {
    this._productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.data) {
          this.myProduct = res.data;
          this.quantity = 1;
          this.fetchRelated(slug);
          this._cdr.detectChanges();
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchRelated(slug: string): void {
    this._productService.getRelatedProducts(slug).subscribe({
      next: (res) => {
        this.relatedProducts = res.data || [];
        this._cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  incrementQty(): void {
    if (this.myProduct && this.quantity < this.myProduct.stock) {
      this.quantity++;
    }
  }

  decrementQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.myProduct || this.myProduct.stock <= 0) return;

    this.isAdding = true;
    this._cartService.addToCart(this.myProduct, this.quantity).subscribe({
      next: () => {
        this.isAdding = false;
        this.addedSuccess = true;
        setTimeout(() => this.addedSuccess = false, 2500);
      },
      error: () => {
        this.isAdding = false;
      }
    });
  }

  getCategoryTitle(): string {
    if (!this.myProduct?.categoryId) return 'Apparel';
    if (typeof this.myProduct.categoryId === 'object') {
      return this.myProduct.categoryId.name || 'Apparel';
    }
    return 'Apparel';
  }

  getImageUrl(): string {
    if (!this.myProduct?.imgURL) return 'assets/placeholder.jpg';
    if (this.myProduct.imgURL.startsWith('http')) return this.myProduct.imgURL;
    return this.staticURL + this.myProduct.imgURL;
  }
}
