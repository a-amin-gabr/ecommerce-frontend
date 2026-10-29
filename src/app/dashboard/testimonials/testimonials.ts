import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService } from '../../core/services/testimonial.service';
import { ITestimonial } from '../../core/models/testimonial.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard-testimonials',
  styleUrl: './testimonials.css',
  templateUrl: './testimonials.html',
})
export class DashboardTestimonials implements OnInit {
  private _testimonialService = inject(TestimonialService);
  private _cdr = inject(ChangeDetectorRef);

  testimonials: ITestimonial[] = [];
  statusFilter: string = '';
  isLoading = false;

  ngOnInit(): void {
    this.fetchTestimonials();
  }

  fetchTestimonials(): void {
    this.isLoading = true;
    this._testimonialService.getAllTestimonials(this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.testimonials = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  updateStatus(t: ITestimonial, status: 'approved' | 'rejected' | 'pending'): void {
    this._testimonialService.updateTestimonialStatus(t._id!, status).subscribe({
      next: () => {
        t.status = status;
        this._cdr.detectChanges();
      }
    });
  }

  deleteTestimonial(id: string): void {
    if (confirm('Delete this testimonial permanently?')) {
      this._testimonialService.deleteTestimonial(id).subscribe({
        next: () => this.fetchTestimonials()
      });
    }
  }
}
