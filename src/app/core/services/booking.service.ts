import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private baseUrl = 'https://localhost:7186/api/Booking';

    constructor(private http: HttpClient) { }

    getBookingsByUserId(userId: number): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.baseUrl}/getByUserId/${userId}`);
    }

    addBooking(booking: Omit<Booking, 'bookingId'>): Observable<Booking> {
        return this.http.post<Booking>(`${this.baseUrl}/add`, booking);
    }

    deleteBooking(booking: { bookingId: number, bookingDate: string }): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/delete`, booking);
    }
}