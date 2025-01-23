import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { EmployeeService } from './employee.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<Employee | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private employeeService: EmployeeService) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    login(email: string): Observable<boolean> {
        return this.employeeService.getByEmail(email).pipe(
            tap(employee => {
                localStorage.setItem('currentUser', JSON.stringify(employee));
                this.currentUserSubject.next(employee);
            }),
            map(employee => true)
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserSubject.value;
    }

    isAdmin(): boolean {
        return this.currentUserSubject.value?.role === 1;
    }
}