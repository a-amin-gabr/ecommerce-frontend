import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ICart, ICartItem } from '../../core/models/cart.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class CartComponent implements OnInit {
  private _cartService = inject(CartService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  cart: ICart = {
    products: [],
    hasPriceChange: false,
    totalQuantity: 0,
    subtotal: 0
  };

  staticURL = enveronment.staticURL;

  ngOnInit(): void {
    this._cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this._cdr.detectChanges();
    });
  }

  incrementQuantity(item: ICartItem): void {
    this._cartService.updateQuantity(item.productId, item.quantity + 1).subscribe();
  }

  decrementQuantity(item: ICartItem): void {
    if (item.quantity > 1) {
      this._cartService.updateQuantity(item.productId, item.quantity - 1).subscribe();
    } else {
      this.removeItem(item.productId);
    }
  }

  removeItem(productId: string): void {
    this._cartService.removeFromCart(productId).subscribe();
  }

  clearCart(): void {
    this._cartService.clearCart().subscribe();
  }

  acceptPrice(productId: string): void {
    this._cartService.acceptPriceChange(productId).subscribe();
  }

  proceedToCheckout(): void {
    if (this.cart.hasPriceChange) {
      alert('One or more items in your cart had a price update. Please review and click "Accept New Price" before checking out.');
      return;
    }
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/checkout']);
    } else {
      this._router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    }
  }

  getItemImageUrl(item: ICartItem): string {
    const img = item.productDetails?.imgURL;
    if (!img) return 'assets/placeholder.jpg';
    if (img.startsWith('http')) return img;
    return this.staticURL + img;
  }
}
