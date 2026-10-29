import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';
import { CartService } from '../../../core/services/cart.service';

@Component({
  imports: [RouterLink, CommonModule],
  selector: 'app-product',
  styleUrl: './product.css',
  templateUrl: './product.html',
})
export class Product {
  @Input() myProduct!: IProduct;
  staticURL = enveronment.staticURL;

  private _cartService = inject(CartService);
  isAdding = false;
  addedSuccess = false;

  addToCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.myProduct || this.myProduct.stock <= 0) return;

    this.isAdding = true;
    this._cartService.addToCart(this.myProduct, 1).subscribe({
      next: () => {
        this.isAdding = false;
        this.addedSuccess = true;
        setTimeout(() => this.addedSuccess = false, 1800);
      },
      error: () => {
        this.isAdding = false;
      }
    });
  }

  getCategoryName(): string {
    if (!this.myProduct?.categoryId) return 'Clothing';
    if (typeof this.myProduct.categoryId === 'object') {
      return this.myProduct.categoryId.name || 'Clothing';
    }
    return 'Clothing';
  }

  getImageUrl(): string {
    if (!this.myProduct?.imgURL) return 'assets/placeholder.jpg';
    if (this.myProduct.imgURL.startsWith('http')) return this.myProduct.imgURL;
    return this.staticURL + this.myProduct.imgURL;
  }
}
