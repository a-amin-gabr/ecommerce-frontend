import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user-service';
import { OrderService } from '../../core/services/order.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { IUser, IAddress } from '../../core/models/user.model';
import { IOrder } from '../../core/models/order.model';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-userprofile',
  styleUrl: './userprofile.css',
  templateUrl: './userprofile.html',
})
export class Userprofile implements OnInit {
  private _authService = inject(AuthService);
  private _userService = inject(UserService);
  private _orderService = inject(OrderService);
  private _testimonialService = inject(TestimonialService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  activeTab: 'orders' | 'addresses' | 'profile' | 'testimonial' = 'orders';

  user: IUser | null = null;
  orders: IOrder[] = [];
  addresses: IAddress[] = [];

  // Edit Profile form
  profileName = '';
  profilePhone = '';
  profileMsg = '';

  // Address Modal / Form state
  showAddressModal = false;
  editingAddressId: string | null = null;
  addrTitle = 'Home';
  addrData = '';
  addrCity = 'Cairo';
  addrDefault = false;
  addrMsg = '';

  // Testimonial Form state
  testRating = 5;
  testComment = '';
  testMsg = '';
  testError = '';
  testSubmitting = false;

  ngOnInit(): void {
    this.loadUserData();
    this.loadOrders();
  }

  loadUserData(): void {
    this._authService.getMe().subscribe({
      next: (res) => {
        this.user = res.data;
        if (this.user) {
          this.profileName = this.user.name;
          this.profilePhone = this.user.phone || '';
          this.addresses = this.user.addresses || [];
        }
        this._cdr.detectChanges();
      },
      error: () => {
        this._authService.logOut();
        this._router.navigate(['/login']);
      }
    });
  }

  loadOrders(): void {
    this._orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this._cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  updateProfile(): void {
    this.profileMsg = '';
    this._userService.updateProfile({
      name: this.profileName.trim(),
      phone: this.profilePhone.trim()
    }).subscribe({
      next: (res) => {
        this.user = res.data;
        this.profileMsg = 'Profile updated successfully!';
        setTimeout(() => this.profileMsg = '', 2500);
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.profileMsg = err.error?.message || 'Update failed.';
      }
    });
  }

  // Address Actions
  openAddAddressModal(): void {
    this.editingAddressId = null;
    this.addrTitle = 'Home';
    this.addrData = '';
    this.addrCity = 'Cairo';
    this.addrDefault = this.addresses.length === 0;
    this.addrMsg = '';
    this.showAddressModal = true;
  }

  openEditAddressModal(addr: IAddress): void {
    this.editingAddressId = addr._id || null;
    this.addrTitle = addr.title;
    this.addrData = addr.addressData;
    this.addrCity = addr.city;
    this.addrDefault = addr.isDefault;
    this.addrMsg = '';
    this.showAddressModal = true;
  }

  saveAddress(): void {
    if (!this.addrData.trim()) {
      this.addrMsg = 'Please enter detailed address.';
      return;
    }

    const payload: IAddress = {
      title: this.addrTitle.trim(),
      addressData: this.addrData.trim(),
      city: this.addrCity.trim(),
      isDefault: this.addrDefault
    };

    if (this.editingAddressId) {
      this._userService.updateAddress(this.editingAddressId, payload).subscribe({
        next: (res) => {
          this.addresses = res.data || [];
          this.showAddressModal = false;
          this._cdr.detectChanges();
        },
        error: (err) => this.addrMsg = err.error?.message || 'Error updating address.'
      });
    } else {
      this._userService.addAddress(payload).subscribe({
        next: (res) => {
          this.addresses = res.data || [];
          this.showAddressModal = false;
          this._cdr.detectChanges();
        },
        error: (err) => this.addrMsg = err.error?.message || 'Error adding address.'
      });
    }
  }

  deleteAddress(addressId?: string): void {
    if (!addressId) return;
    if (confirm('Are you sure you want to delete this address?')) {
      this._userService.deleteAddress(addressId).subscribe({
        next: (res) => {
          this.addresses = res.data || [];
          this._cdr.detectChanges();
        }
      });
    }
  }

  setDefaultAddress(addressId?: string): void {
    if (!addressId) return;
    this._userService.setDefaultAddress(addressId).subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this._cdr.detectChanges();
      }
    });
  }

  // Cancel order (allowed if pending)
  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order? Products stock will be restored.')) {
      this._orderService.cancelMyOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert(err.error?.message || 'Unable to cancel order.');
        }
      });
    }
  }

  // Submit Testimonial
  submitTestimonial(): void {
    if (!this.testComment.trim()) {
      this.testError = 'Please enter a review message.';
      return;
    }

    this.testSubmitting = true;
    this.testError = '';
    this.testMsg = '';

    this._testimonialService.submitTestimonial({
      userName: this.user?.name || 'Customer',
      rating: Number(this.testRating),
      comment: this.testComment.trim()
    }).subscribe({
      next: () => {
        this.testSubmitting = false;
        this.testMsg = 'Thank you! Your testimonial was submitted for admin review.';
        this.testComment = '';
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.testSubmitting = false;
        this.testError = err.error?.message || 'Submission error.';
        this._cdr.detectChanges();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'preparing': return 'bg-info text-dark';
      case 'shipped': return 'bg-primary text-white';
      case 'delivered':
      case 'received': return 'bg-success text-white';
      case 'cancelled by client':
      case 'cancelled by admin':
      case 'rejected':
      case 'refunded': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
