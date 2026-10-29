import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { IToken } from '../../../core/models/auth.model';

@Component({
  imports: [RouterLink, RouterLinkActive, AsyncPipe, CommonModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {
  private _authService = inject(AuthService);
  private _cartService = inject(CartService);
  private _router = inject(Router);

  currentUser: IToken | null = null;
  cartCount$ = this._cartService.itemCount$;
  cartSubtotal$ = this._cartService.subtotal$;

  ngOnInit(): void {
    this._authService.getUserData().subscribe({
      next: (data) => {
        this.currentUser = data;
      }
    });
  }

  logout(): void {
    this._authService.logOut();
    this._router.navigate(['/login']);
  }
}
