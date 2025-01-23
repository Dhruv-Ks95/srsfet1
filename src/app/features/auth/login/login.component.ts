import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <div class="form-group">
        <input 
          type="email" 
          [(ngModel)]="email" 
          placeholder="Enter your email"
          (keyup.enter)="login()"
        >
      </div>
      <button (click)="login()">Login</button>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    .form-group {
      margin: 20px 0;
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
    }
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login(): void {
    if (!this.email) {
      alert('Please enter your email');
      return;
    }

    this.authService.login(this.email).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: () => {
        alert('Invalid credentials');
      }
    });
  }
}
