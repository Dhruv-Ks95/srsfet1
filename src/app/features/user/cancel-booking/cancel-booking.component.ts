import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SeatService } from '../../../core/services/seat.service';
import { Booking } from '../../../core/models/booking.model';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

interface BookingWithSeat extends Booking {
  seatNumber: number;
  isSelected?: boolean;
}

@Component({
  selector: 'app-cancel-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cancel-booking.component.html',
  styleUrl: './cancel-booking.component.css'
})
export class CancelBookingComponent implements OnInit {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private seatService = inject(SeatService);
  private router = inject(Router);

  bookings: BookingWithSeat[] = [];
  loading = true;
  showConfirmDialog = false;

  ngOnInit(): void {
    this.loadUserBookings();
  }

  private loadUserBookings(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.bookingService.getBookingsByUserId(currentUser.employeeId).pipe(
      switchMap(bookings => {
        if (bookings.length === 0) {
          return of([]);
        }

        const bookingsWithSeats = bookings.map(booking =>
          this.seatService.getSeatById(booking.seatId).pipe(
            map(seat => ({
              ...booking,
              seatNumber: seat.seatNumber,
              isSelected: false
            }))
          )
        );

        return forkJoin(bookingsWithSeats);
      })
    ).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  toggleSelection(booking: BookingWithSeat): void {
    booking.isSelected = !booking.isSelected;
  }

  getSelectedBookings(): BookingWithSeat[] {
    return this.bookings.filter(booking => booking.isSelected);
  }

  confirmCancellation(): void {
    if (this.getSelectedBookings().length > 0) {
      this.showConfirmDialog = true;
    }
  }

  async cancelBookings(): Promise<void> {
    const selectedBookings = this.getSelectedBookings();
    let successCount = 0;
    let failureCount = 0;

    // Process each booking cancellation sequentially
    for (const booking of selectedBookings) {
      try {
        // Need to format the date correctly as the API expects
        const formattedDate = new Date(booking.bookingDate).toISOString().split('T')[0];
        
        const result = await this.bookingService.deleteBooking({
          bookingId: booking.bookingId,
          bookingDate: formattedDate
        }).toPromise();

        if (result) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        failureCount++;
      }
    }

    // Show results
    if (failureCount === 0) {
      alert(`Successfully cancelled ${successCount} booking(s)`);
    } else {
      alert(`Successfully cancelled ${successCount} booking(s), failed to cancel ${failureCount} booking(s)`);
    }

    this.showConfirmDialog = false;
    this.loadUserBookings(); // Reload the list
  }

  private toPromise<T>(observable: Observable<T>): Promise<T> {
    return firstValueFrom(observable);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
