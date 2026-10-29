import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FAQService } from '../../core/services/faq.service';
import { IFAQ } from '../../core/models/faq.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard-faqs',
  styleUrl: './faqs.css',
  templateUrl: './faqs.html',
})
export class DashboardFaqs implements OnInit {
  private _faqService = inject(FAQService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFAQ[] = [];
  isLoading = false;

  // Add / Edit Modal state
  showModal = false;
  editingId: string | null = null;
  formQuestion = '';
  formAnswer = '';
  formCategory = 'General';
  formOrder = 0;
  formError = '';

  ngOnInit(): void {
    this.fetchFAQs();
  }

  fetchFAQs(): void {
    this.isLoading = true;
    this._faqService.getFAQs().subscribe({
      next: (res) => {
        this.faqs = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.editingId = null;
    this.formQuestion = '';
    this.formAnswer = '';
    this.formCategory = 'General';
    this.formOrder = this.faqs.length + 1;
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(f: IFAQ): void {
    this.editingId = f._id || null;
    this.formQuestion = f.question;
    this.formAnswer = f.answer;
    this.formCategory = f.category || 'General';
    this.formOrder = f.order || 0;
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveFAQ(): void {
    if (!this.formQuestion.trim() || !this.formAnswer.trim()) {
      this.formError = 'Question and answer are required.';
      return;
    }

    const payload: Partial<IFAQ> = {
      question: this.formQuestion.trim(),
      answer: this.formAnswer.trim(),
      category: this.formCategory.trim(),
      order: Number(this.formOrder) || 0
    };

    if (this.editingId) {
      this._faqService.updateFAQ(this.editingId, payload).subscribe({
        next: () => {
          this.showModal = false;
          this.fetchFAQs();
        },
        error: (err) => this.formError = err.error?.message || 'Update failed.'
      });
    } else {
      this._faqService.addFAQ(payload).subscribe({
        next: () => {
          this.showModal = false;
          this.fetchFAQs();
        },
        error: (err) => this.formError = err.error?.message || 'Add failed.'
      });
    }
  }

  deleteFAQ(id?: string): void {
    if (!id) return;
    if (confirm('Delete this FAQ item permanently? (Hard delete)')) {
      this._faqService.deleteFAQ(id).subscribe({
        next: () => this.fetchFAQs()
      });
    }
  }
}
