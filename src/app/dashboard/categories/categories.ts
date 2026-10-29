import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ICategory, ISubcategory } from '../../core/models/category.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard-categories',
  styleUrl: './categories.css',
  templateUrl: './categories.html',
})
export class DashboardCategories implements OnInit {
  private _categoryService = inject(CategoryService);
  private _cdr = inject(ChangeDetectorRef);

  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  isLoading = false;

  // Category Modal
  showCatModal = false;
  editingCatId: string | null = null;
  catName = '';
  catSlug = '';
  catDesc = '';
  catError = '';

  // Subcategory Modal
  showSubModal = false;
  editingSubId: string | null = null;
  subCatId = '';
  subName = '';
  subSlug = '';
  subDesc = '';
  subError = '';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this._categoryService.getCategories(true).subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.loadSubcategories();
      },
      error: () => this.isLoading = false
    });
  }

  loadSubcategories(): void {
    this._categoryService.getSubcategories(undefined, true).subscribe({
      next: (res) => {
        this.subcategories = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  // Category Methods
  openAddCatModal(): void {
    this.editingCatId = null;
    this.catName = '';
    this.catSlug = '';
    this.catDesc = '';
    this.catError = '';
    this.showCatModal = true;
  }

  openEditCatModal(c: ICategory): void {
    this.editingCatId = c._id;
    this.catName = c.name;
    this.catSlug = c.slug;
    this.catDesc = c.description || '';
    this.catError = '';
    this.showCatModal = true;
  }

  saveCategory(): void {
    if (!this.catName.trim() || !this.catSlug.trim()) {
      this.catError = 'Category name and slug are required.';
      return;
    }

    const payload: Partial<ICategory> = {
      name: this.catName.trim(),
      slug: this.catSlug.trim(),
      description: this.catDesc.trim()
    };

    if (this.editingCatId) {
      this._categoryService.updateCategory(this.editingCatId, payload).subscribe({
        next: () => {
          this.showCatModal = false;
          this.loadAll();
        },
        error: (err) => this.catError = err.error?.message || 'Update failed.'
      });
    } else {
      this._categoryService.addCategory(payload).subscribe({
        next: () => {
          this.showCatModal = false;
          this.loadAll();
        },
        error: (err) => this.catError = err.error?.message || 'Add category failed.'
      });
    }
  }

  toggleActiveCat(c: ICategory): void {
    this._categoryService.toggleActiveCategory(c._id).subscribe({
      next: (res) => {
        c.isActive = res.data.isActive;
        this._cdr.detectChanges();
      }
    });
  }

  softDeleteCat(c: ICategory): void {
    if (confirm(`Soft-delete category "${c.name}"? It will be archived.`)) {
      this._categoryService.deleteCategory(c._id).subscribe({
        next: () => this.loadAll()
      });
    }
  }

  // Subcategory Methods
  openAddSubModal(): void {
    this.editingSubId = null;
    this.subCatId = this.categories.length > 0 ? this.categories[0]._id : '';
    this.subName = '';
    this.subSlug = '';
    this.subDesc = '';
    this.subError = '';
    this.showSubModal = true;
  }

  openEditSubModal(s: ISubcategory): void {
    this.editingSubId = s._id;
    this.subCatId = typeof s.categoryId === 'object' ? s.categoryId._id : s.categoryId;
    this.subName = s.name;
    this.subSlug = s.slug;
    this.subDesc = s.description || '';
    this.subError = '';
    this.showSubModal = true;
  }

  saveSubcategory(): void {
    if (!this.subCatId || !this.subName.trim() || !this.subSlug.trim()) {
      this.subError = 'Parent category, name, and slug are required.';
      return;
    }

    const payload: Partial<ISubcategory> = {
      categoryId: this.subCatId,
      name: this.subName.trim(),
      slug: this.subSlug.trim(),
      description: this.subDesc.trim()
    };

    if (this.editingSubId) {
      this._categoryService.updateSubcategory(this.editingSubId, payload).subscribe({
        next: () => {
          this.showSubModal = false;
          this.loadSubcategories();
        },
        error: (err) => this.subError = err.error?.message || 'Update failed.'
      });
    } else {
      this._categoryService.addSubcategory(payload).subscribe({
        next: () => {
          this.showSubModal = false;
          this.loadSubcategories();
        },
        error: (err) => this.subError = err.error?.message || 'Add subcategory failed.'
      });
    }
  }

  toggleActiveSub(s: ISubcategory): void {
    this._categoryService.toggleActiveSubcategory(s._id).subscribe({
      next: (res) => {
        s.isActive = res.data.isActive;
        this._cdr.detectChanges();
      }
    });
  }

  softDeleteSub(s: ISubcategory): void {
    if (confirm(`Soft-delete subcategory "${s.name}"?`)) {
      this._categoryService.deleteSubcategory(s._id).subscribe({
        next: () => this.loadSubcategories()
      });
    }
  }
}
