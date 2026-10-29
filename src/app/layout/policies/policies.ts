import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-policies',
  styleUrl: './policies.css',
  templateUrl: './policies.html',
})
export class PoliciesComponent {
  activeTab: 'returns' | 'cod' | 'shipping' | 'privacy' = 'returns';
}
