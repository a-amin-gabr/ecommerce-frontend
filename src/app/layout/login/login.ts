import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ILoginData } from '../../core/models/auth.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  returnUrl: string = '/';
  errorMessage: string = '';
  isLoading: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  ngOnInit(): void {
    this.returnUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    if (this._authService.isLoggedIn()) {
      const user = this._authService.getCurrentUser();
      if (user?.role === 'admin') {
        this._router.navigate(['/dashboard']);
      } else {
        this._router.navigate([this.returnUrl]);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._authService.login(this.loginForm.value as ILoginData).subscribe({
      next: (res) => {
        this.isLoading = false;
        const user = this._authService.decodeToken(res.data);
        if (user?.role === 'admin') {
          this._router.navigate(['/dashboard']);
        } else {
          this._router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Invalid email or password.';
        this._cdr.detectChanges();
      }
    });
  }
}
