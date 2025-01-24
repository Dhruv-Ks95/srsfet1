import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SeatService } from '../../../core/services/seat.service';
import { Employee } from '../../../core/models/employee.model';
import { Booking } from '../../../core/models/booking.model';
import { Seat } from '../../../core/models/seat.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule,RouterModule],
  providers: [BookingService, SeatService],
  template: `
    <div class="main-container">
      <!-- Side Navigation -->
      <div class="side-nav">
        <div class="nav-item active" routerLink="/user">Home</div>
        <div class="nav-item" routerLink="/add-booking">Add Booking</div>
        <div class="nav-item">Cancel Booking</div>
        <div class="nav-item">Book Multiple Days</div>
        <div class="nav-item logout" (click)="logout()">Logout</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="header">
          <h2>Welcome, {{ currentUser?.name }}!</h2>
        </div>

        <div class="bookings-section">
          <h3>Your Bookings</h3>
          
          @if (loading) {
            <div class="loading">Loading your bookings...</div>
          } @else if (bookings.length === 0) {
            <div class="no-bookings">You have no bookings.</div>
          } @else {
            <div class="bookings-list">
              @for (booking of bookings; track booking.bookingId) {
                <div class="booking-card">
                  <div class="booking-date">
                    {{ booking.bookingDate | date:'MMM d, y' }}
                  </div>
                  <div class="booking-seat">
                    Seat {{ booking.seatNumber }}
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      display: flex;
      height: 100vh;
    }

    .side-nav {
      width: 250px;
      background-color: #2c3e50;
      padding: 20px 0;
      color: white;
    }

    .nav-item {
      padding: 15px 25px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .nav-item:hover {
      background-color: #34495e;
    }

    .nav-item.active {
      background-color: #3498db;
    }

    .nav-item.logout {
      margin-top: auto;
      color: #e74c3c;
    }

    .content {
      flex: 1;
      padding: 20px;
      background-color: #f5f6fa;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .bookings-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .bookings-section h3 {
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 20px;
    }

    .loading, .no-bookings {
      text-align: center;
      padding: 20px;
      color: #7f8c8d;
    }

    .bookings-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .booking-card {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 15px;
      transition: transform 0.2s;
    }

    .booking-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .booking-date {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .booking-seat {
      color: #7f8c8d;
    }
  `]
})
export class UserHomeComponent implements OnInit {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private seatService = inject(SeatService);
  private router = inject(Router);

  currentUser: Employee | null = null;
  bookings: (Booking & { seatNumber?: number })[] = [];
  loading = true;

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of([]);
        }
        this.currentUser = user;
        return this.bookingService.getBookingsByUserId(user.employeeId);
      }),
      switchMap(bookings => {
        if (bookings.length === 0) {
          return of([]);
        }
        
        // Get seat details for each booking
        const bookingsWithSeats = bookings.map(booking =>
          this.seatService.getSeatById(booking.seatId).pipe(
            map((seat: Seat) => ({
              ...booking,
              seatNumber: seat.seatNumber
            }))
          )
        );
        
        return forkJoin(bookingsWithSeats);
      })
    ).subscribe({
      next: (bookingsWithSeats) => {
        this.bookings = bookingsWithSeats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching bookings:', error);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}