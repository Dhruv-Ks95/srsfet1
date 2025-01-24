import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seat } from '../models/seat.model';

@Injectable({
    providedIn: 'root'
})
export class SeatService {
    private baseUrl = 'https://localhost:7186/api/Seat';

    constructor(private http: HttpClient) { }

    getAllSeats(): Observable<Seat[]> {
        return this.http.get<Seat[]>(`${this.baseUrl}/getAll`);
    }

    getSeatById(id: number): Observable<Seat> {
        return this.http.get<Seat>(`${this.baseUrl}/getById/${id}`);
    }

    getAvailableByDate(date: string): Observable<Seat[]> {
        return this.http.get<Seat[]>(`${this.baseUrl}/getAvailableByDate/${date}`);
    }
}