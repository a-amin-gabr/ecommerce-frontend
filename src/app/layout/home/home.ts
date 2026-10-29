import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { FAQService } from '../../core/services/faq.service';
import { AuthService } from '../../core/services/auth.service';
import { IProduct } from '../../core/models/product.model';
import { ICategory } from '../../core/models/category.model';
import { ITestimonial } from '../../core/models/testimonial.model';
import { IFAQ } from '../../core/models/faq.model';
import { Product } from '../productslist/product/product';

@Component({
  imports: [CommonModule, RouterLink, FormsModule, Product],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _testimonialService = inject(TestimonialService);
  private _faqService = inject(FAQService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  featuredProducts: IProduct[] = [];
  categories: ICategory[] = [];
  testimonials: ITestimonial[] = [];
  faqs: IFAQ[] = [];

  // Review modal state
  showReviewModal = false;
  reviewName = '';
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewSuccessMessage = '';
  reviewErrorMessage = '';

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
    this.loadTestimonials();
    this.loadFAQs();

    const user = this._authService.getCurrentUser();
    if (user) {
      this.reviewName = user.name;
    }
  }

  loadFeaturedProducts(): void {
    this._productService.getAllProducts({ sort: 'newest' }).subscribe({
      next: (res) => {
        this.featuredProducts = (res.data || []).slice(0, 4);
        this._cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this._categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = (res.data || []).slice(0, 4);
        this._cdr.detectChanges();
      }
    });
  }

  loadTestimonials(): void {
    this._testimonialService.getApprovedTestimonials().subscribe({
      next: (res) => {
        this.testimonials = res.data || [];
        this._cdr.detectChanges();
      }
    });
  }

  loadFAQs(): void {
    this._faqService.getFAQs().subscribe({
      next: (res) => {
        this.faqs = (res.data || []).slice(0, 4);
        this._cdr.detectChanges();
      }
    });
  }

  openReviewModal(): void {
    this.showReviewModal = true;
    this.reviewSuccessMessage = '';
    this.reviewErrorMessage = '';
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (!this.reviewName.trim() || !this.reviewComment.trim()) {
      this.reviewErrorMessage = 'Please enter your name and review message.';
      return;
    }

    this.reviewSubmitting = true;
    this.reviewErrorMessage = '';

    this._testimonialService.submitTestimonial({
      userName: this.reviewName.trim(),
      rating: Number(this.reviewRating),
      comment: this.reviewComment.trim()
    }).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.reviewSuccessMessage = 'Thank you! Your testimonial has been submitted for admin approval.';
        this.reviewComment = '';
        setTimeout(() => {
          this.closeReviewModal();
        }, 2200);
      },
      error: (err) => {
        this.reviewSubmitting = false;
        this.reviewErrorMessage = err.error?.error || 'Failed to submit testimonial. Please try again.';
      }
    });
  }
}
