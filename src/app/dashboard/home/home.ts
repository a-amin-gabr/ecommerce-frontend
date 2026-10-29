import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { OrderService } from '../../core/services/order.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { IDashboardStats } from '../../core/models/dashboard.model';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private _dashboardService = inject(DashboardService);
  private _orderService = inject(OrderService);
  private _testimonialService = inject(TestimonialService);
  private _cdr = inject(ChangeDetectorRef);

  stats: IDashboardStats | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this._dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.data;
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

  quickUpdateStatus(orderId: string, status: string): void {
    this._orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadStats();
      }
    });
  }

  approveTestimonial(id: string): void {
    this._testimonialService.updateTestimonialStatus(id, 'approved').subscribe({
      next: () => {
        this.loadStats();
      }
    });
  }

  rejectTestimonial(id: string): void {
    this._testimonialService.updateTestimonialStatus(id, 'rejected').subscribe({
      next: () => {
        this.loadStats();
      }
    });
  }
}
