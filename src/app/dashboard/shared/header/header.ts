import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IToken } from '../../../core/models/auth.model';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  adminUser: IToken | null = null;

  ngOnInit(): void {
    this._authService.getUserData().subscribe(user => {
      this.adminUser = user;
    });
  }

  logout(): void {
    this._authService.logOut();
    this._router.navigate(['/login']);
  }
}
