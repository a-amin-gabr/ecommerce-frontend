import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorHandelarInterceptor: HttpInterceptorFn = (req, next) => {
  const _router = inject(Router);
  const _authService = inject(AuthService);

  return next(req).pipe(catchError((error) => {
    const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

    if (error.status === 401) {
      if (!isAuthEndpoint) {
        _authService.logOut();
        _router.navigate(['/login']);
      }
    } else if (error.status === 403) {
      if (error.error?.error?.includes('blocked') || error.error?.message?.includes('blocked')) {
        _authService.logOut();
        _router.navigate(['/login']);
      }
    } else if (error.status === 500) {
      console.error('Server error:', error.error?.message || error.message);
    }
    return throwError(() => error);
  }));
};
