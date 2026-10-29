import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user-service';
import { AuthService } from '../../core/services/auth.service';
import { IUser } from '../../core/models/user.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-user-list',
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList implements OnInit {
  private _userService = inject(UserService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  users: IUser[] = [];
  isLoading = false;
  searchQuery = '';
  roleFilter = '';

  // Add Admin Modal state
  showAdminModal = false;
  adminName = '';
  adminEmail = '';
  adminPassword = '';
  adminPhone = '';
  adminError = '';
  adminSuccess = '';
  isCreatingAdmin = false;

  currentAdminId: string | null = null;

  ngOnInit(): void {
    const me = this._authService.getCurrentUser();
    this.currentAdminId = me ? me._id : null;
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this._userService.getUsers(this.searchQuery || undefined, this.roleFilter || undefined).subscribe({
      next: (res) => {
        this.users = res.data || [];
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  toggleBlock(user: IUser): void {
    if (user._id === this.currentAdminId) {
      alert('You cannot block your own account.');
      return;
    }

    const action = user.isBlocked ? 'unblock' : 'block';
    if (confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      this._userService.toggleBlock(user._id).subscribe({
        next: (res) => {
          user.isBlocked = res.data.isBlocked;
          this._cdr.detectChanges();
        },
        error: (err) => alert(err.error?.message || 'Failed to toggle block status.')
      });
    }
  }

  openAdminModal(): void {
    this.adminName = '';
    this.adminEmail = '';
    this.adminPassword = '';
    this.adminPhone = '';
    this.adminError = '';
    this.adminSuccess = '';
    this.showAdminModal = true;
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  createAdmin(): void {
    if (!this.adminName.trim() || !this.adminEmail.trim() || !this.adminPassword.trim()) {
      this.adminError = 'Name, email, and password are required.';
      return;
    }

    this.isCreatingAdmin = true;
    this.adminError = '';
    this.adminSuccess = '';

    this._userService.addAdmin({
      name: this.adminName.trim(),
      email: this.adminEmail.trim(),
      password: this.adminPassword.trim(),
      phone: this.adminPhone.trim()
    }).subscribe({
      next: () => {
        this.isCreatingAdmin = false;
        this.adminSuccess = 'New Administrator created with equal permissions.';
        setTimeout(() => {
          this.closeAdminModal();
          this.fetchUsers();
        }, 1500);
      },
      error: (err) => {
        this.isCreatingAdmin = false;
        this.adminError = err.error?.message || err.error?.error || 'Failed to create admin.';
        this._cdr.detectChanges();
      }
    });
  }
}
