import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FAQService } from '../../core/services/faq.service';
import { IFAQ } from '../../core/models/faq.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-faq',
  styleUrl: './faq.css',
  templateUrl: './faq.html',
})
export class FaqComponent implements OnInit {
  private _faqService = inject(FAQService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFAQ[] = [];
  filteredFaqs: IFAQ[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  searchQuery: string = '';

  ngOnInit(): void {
    this._faqService.getFAQs().subscribe({
      next: (res) => {
        this.faqs = res.data || [];
        const cats = new Set(this.faqs.map(f => f.category || 'General'));
        this.categories = ['All', ...Array.from(cats)];
        this.filterFAQs();
        this._cdr.detectChanges();
      }
    });
  }

  filterFAQs(): void {
    this.filteredFaqs = this.faqs.filter(f => {
      const matchCat = this.selectedCategory === 'All' || f.category === this.selectedCategory;
      const matchSearch = !this.searchQuery.trim() || 
        f.question.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        f.answer.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }
}
