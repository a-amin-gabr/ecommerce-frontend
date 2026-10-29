import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { IOrder, OrderStatus } from '../../core/models/order.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard-orders',
  styleUrl: './orders.css',
  templateUrl: './orders.html',
})
export class DashboardOrders implements OnInit {
  private _orderService = inject(OrderService);
  private _cdr = inject(ChangeDetectorRef);

  orders: IOrder[] = [];
  selectedStatus: string = '';
  selectedDate: string = '';
  isLoading = false;

  // Selected Order for Modal View
  activeOrder: IOrder | null = null;
  showDetailsModal = false;

  availableStatuses: OrderStatus[] = [
    'pending',
    'preparing',
    'shipped',
    'delivered',
    'received',
    'cancelled by admin',
    'cancelled by client',
    'rejected',
    'refunded'
  ];

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading = true;
    this._orderService.getAllOrders(this.selectedStatus || undefined, this.selectedDate || undefined).subscribe({
      next: (res) => {
        this.orders = res.data || [];
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

  changeStatus(order: IOrder, newStatus: string): void {
    this._orderService.updateOrderStatus(order._id, newStatus).subscribe({
      next: (res) => {
        order.status = res.data.status;
        if (this.activeOrder && this.activeOrder._id === order._id) {
          this.activeOrder.status = res.data.status;
        }
        this._cdr.detectChanges();
      },
      error: (err) => alert(err.error?.message || 'Failed to update order status.')
    });
  }

  viewDetails(order: IOrder): void {
    this.activeOrder = order;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.activeOrder = null;
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
