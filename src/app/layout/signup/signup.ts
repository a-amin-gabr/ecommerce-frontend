import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ICanDeactivate } from '../../core/models/canDeactivate.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup implements OnInit, ICanDeactivate {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  returnUrl: string = '/';
  errorMessage: string = '';
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  ngOnInit(): void {
    this.returnUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }

  canDeactivate(): boolean {
    if (this.myForm.dirty && !this.isSubmitted) {
      return confirm('You have unsaved changes in your registration form. Do you really want to leave?');
    }
    return true;
  }

  myForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.myForm.value;
    this._authService.register({
      name: name || '',
      email: email || '',
      password: password || ''
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSubmitted = true;
        this._router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Registration failed. Please try another email.';
        this._cdr.detectChanges();
      }
    });
  }
}
