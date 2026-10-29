import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class ContactComponent {
  name = '';
  email = '';
  phone = '';
  message = '';
  submitted = false;

  sendMessage(): void {
    if (this.name.trim() && this.message.trim()) {
      this.submitted = true;
      this.name = '';
      this.email = '';
      this.phone = '';
      this.message = '';
    }
  }
}
