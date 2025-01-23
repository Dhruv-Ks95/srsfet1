import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private baseUrl = 'https://localhost:7186/api/Employee';

    constructor(private http: HttpClient) { }

    getByEmail(email: string): Observable<Employee> {
        return this.http.get<Employee>(`${this.baseUrl}/getByEmail/${email}`);
    }
}