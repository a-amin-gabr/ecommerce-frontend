import { Component } from '@angular/core';
import { Header } from './shared/header/header';
import { Footer } from '../shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Header, RouterOutlet, Footer],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {}
