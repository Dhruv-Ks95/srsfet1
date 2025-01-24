import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SeatService } from '../../../core/services/seat.service';
import { BookingService } from '../../../core/services/booking.service';
import { Seat } from '../../../core/models/seat.model';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DateOption {
  date: Date;
  formattedDate: string;
  availableSeats?: number;
  isSelected?: boolean;
}

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [CommonModule,RouterModule],
  template: `
    <div class="main-container">
      <!-- Side Navigation -->
      <div class="side-nav">
        <div class="nav-item" routerLink="/user">Home</div>
        <div class="nav-item active" routerLink="/add-booking">Add Booking</div>
        <div class="nav-item">Cancel Booking</div>
        <div class="nav-item">Book Multiple Days</div>
        <div class="nav-item logout" (click)="logout()">Logout</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="header">
          <h2>Add New Booking</h2>
          <p>Select a date to view available seats</p>
        </div>

        @if (!selectedDate) {
          <div class="dates-grid">
            @for (date of availableDates; track date.formattedDate) {
              <div 
                class="date-card" 
                [class.selected]="date.isSelected"
                (click)="selectDate(date)"
              >
                <div class="date-header">{{ date.date | date:'MMM d' }}</div>
                <div class="seats-info">
                  @if (date.availableSeats !== undefined) {
                    {{ date.availableSeats }} seats available
                  } @else {
                    Loading...
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="seats-selection">
            <div class="back-button" (click)="clearSelection()">
              ← Back to dates
            </div>
            
            <h3>Select a seat for {{ selectedDate.date | date:'MMM d, y' }}</h3>
            
            <div class="seats-grid">
              @for (seat of availableSeats; track seat.seatId) {
                <div 
                  class="seat-box"
                  [class.unavailable]="!isSeatAvailable(seat)"
                  [class.selected]="selectedSeat?.seatId === seat.seatId"
                  (click)="selectSeat(seat)"
                >
                  {{ seat.seatNumber }}
                </div>
              }
            </div>

            @if (selectedSeat) {
              <button 
                class="book-button"
                (click)="bookSeat()"
              >
                Book Seat {{ selectedSeat.seatNumber }}
              </button>
            }
          </div>
        }
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
      overflow-y: auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .header p {
      color: #7f8c8d;
      margin: 5px 0 0 0;
    }

    .dates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      padding: 20px;
    }

    .date-card {
      background-color: white;
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .date-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .date-card.selected {
      background-color: #3498db;
      color: white;
    }

    .date-header {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .seats-info {
      font-size: 0.9em;
      color: #7f8c8d;
    }

    .date-card.selected .seats-info {
      color: #fff;
    }

    .seats-selection {
      padding: 20px;
    }

    .back-button {
      display: inline-block;
      padding: 10px 20px;
      color: #3498db;
      cursor: pointer;
      margin-bottom: 20px;
    }

    .back-button:hover {
      color: #2980b9;
    }

    .seats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .seat-box {
      background-color: white;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .seat-box:not(.unavailable):hover {
      background-color: #edf7ed;
      border-color: #4caf50;
    }

    .seat-box.unavailable {
      background-color: #f5f5f5;
      border-color: #ddd;
      color: #999;
      cursor: not-allowed;
    }

    .seat-box.selected {
      background-color: #4caf50;
      border-color: #4caf50;
      color: white;
    }

    .book-button {
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.3s;
    }

    .book-button:hover {
      background-color: #45a049;
    }
  `]
})
export class AddBookingComponent implements OnInit {
  private authService = inject(AuthService);
  private seatService = inject(SeatService);
  private bookingService = inject(BookingService);
  private router = inject(Router);

  availableDates: DateOption[] = [];
  selectedDate: DateOption | null = null;
  availableSeats: Seat[] = [];
  selectedSeat: Seat | null = null;

  ngOnInit(): void {
    this.generateDateRange();
    this.loadAvailabilityForDates();
  }

  private generateDateRange(): void {
    const today = new Date();
    this.availableDates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return {
        date: date,
        formattedDate: date.toISOString().split('T')[0],
      };
    });
  }

  private loadAvailabilityForDates(): void {
    // Load availability for each date
    this.availableDates.forEach(dateOption => {
      this.seatService.getAvailableByDate(dateOption.formattedDate)
        .subscribe(seats => {
          const index = this.availableDates.findIndex(
            d => d.formattedDate === dateOption.formattedDate
          );
          if (index !== -1) {
            this.availableDates[index] = {
              ...this.availableDates[index],
              availableSeats: seats.length
            };
          }
        });
    });
  }

  selectDate(date: DateOption): void {
    this.selectedDate = date;
    this.selectedSeat = null;
    
    // Get all seats and available seats to show availability
    forkJoin({
      allSeats: this.seatService.getAllSeats(),
      availableSeats: this.seatService.getAvailableByDate(date.formattedDate)
    }).subscribe(({ allSeats, availableSeats }) => {
      this.availableSeats = allSeats;
      // Mark available seats
      this.availableSeatsMap = new Set(availableSeats.map(seat => seat.seatId));
    });
  }

  private availableSeatsMap = new Set<number>();

  isSeatAvailable(seat: Seat): boolean {
    return this.availableSeatsMap.has(seat.seatId);
  }

  selectSeat(seat: Seat): void {
    if (!this.isSeatAvailable(seat)) return;
    this.selectedSeat = seat;
  }

  clearSelection(): void {
    this.selectedDate = null;
    this.selectedSeat = null;
    this.availableSeats = [];
  }

  bookSeat(): void {
    if (!this.selectedDate || !this.selectedSeat) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const booking = {
      employeeId: currentUser.employeeId,
      seatId: this.selectedSeat.seatId,
      bookingDate: this.selectedDate.formattedDate
    };

    this.bookingService.addBooking(booking).subscribe({
      next: () => {
        alert('Booking successful!');
        this.router.navigate(['/user']);
      },
      error: (error) => {
        console.error('Booking failed:', error);
        alert('Failed to book seat. Please try again.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}