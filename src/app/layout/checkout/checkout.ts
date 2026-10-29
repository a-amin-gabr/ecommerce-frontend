import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user-service';
import { ICart } from '../../core/models/cart.model';
import { IAddress } from '../../core/models/user.model';
import { IOrder } from '../../core/models/order.model';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class CheckoutComponent implements OnInit {
  private _cartService = inject(CartService);
  private _orderService = inject(OrderService);
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  cart: ICart = {
    products: [],
    hasPriceChange: false,
    totalQuantity: 0,
    subtotal: 0
  };

  // User & Address state
  userAddresses: IAddress[] = [];
  selectedAddressId: string = '';
  phone: string = '';
  notes: string = '';

  // New Address inline form
  showAddAddress = false;
  newAddressTitle = 'Home';
  newAddressData = '';
  newAddressCity = 'Cairo';
  newAddressIsDefault = false;

  // Checkout process state
  isSubmitting = false;
  errorMessage = '';
  placedOrder: IOrder | null = null;

  ngOnInit(): void {
    // 1. Check cart
    this._cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (!this.placedOrder && cart.products.length === 0) {
        // Empty cart, redirect to product list after small delay
      }
      this._cdr.detectChanges();
    });

    // 2. Fetch user profile addresses & phone
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this._authService.getMe().subscribe({
      next: (res) => {
        const user = res.data;
        if (user) {
          this.phone = user.phone || '';
          this.userAddresses = user.addresses || [];
          if (this.userAddresses.length > 0) {
            const def = this.userAddresses.find(a => a.isDefault) || this.userAddresses[0];
            this.selectedAddressId = def._id || '';
          } else {
            this.showAddAddress = true;
          }
        }
        this._cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  saveNewAddress(): void {
    if (!this.newAddressData.trim()) {
      this.errorMessage = 'Please enter complete address details (Street, Building, Apartment).';
      return;
    }

    const addr: IAddress = {
      title: this.newAddressTitle.trim(),
      addressData: this.newAddressData.trim(),
      city: this.newAddressCity.trim(),
      isDefault: this.newAddressIsDefault || this.userAddresses.length === 0
    };

    this._userService.addAddress(addr).subscribe({
      next: (res) => {
        this.userAddresses = res.data || [];
        const added = this.userAddresses[this.userAddresses.length - 1];
        if (added) this.selectedAddressId = added._id || '';
        this.showAddAddress = false;
        this.newAddressData = '';
        this.errorMessage = '';
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save address.';
      }
    });
  }

  placeOrder(): void {
    this.errorMessage = '';

    if (!this.phone.trim()) {
      this.errorMessage = 'Please provide a valid contact mobile number for the courier.';
      return;
    }

    if (!this.selectedAddressId && (!this.newAddressData.trim() || !this.showAddAddress)) {
      this.errorMessage = 'Please select or add a delivery address.';
      return;
    }

    if (this.cart.hasPriceChange) {
      this.errorMessage = 'Some item prices have changed. Please return to your cart and accept the updated prices before ordering.';
      return;
    }

    if (this.cart.products.length === 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      mobileSnapshot: this.phone.trim(),
      notes: this.notes.trim()
    };

    if (this.showAddAddress && this.newAddressData.trim()) {
      payload.addressSnapshot = {
        title: this.newAddressTitle,
        addressData: this.newAddressData.trim(),
        city: this.newAddressCity
      };
    } else {
      payload.addressId = this.selectedAddressId;
    }

    this._orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.placedOrder = res.data;
        this._cartService.clearCart().subscribe();
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Failed to create order. Please check item stock.';
        this._cdr.detectChanges();
      }
    });
  }
}
