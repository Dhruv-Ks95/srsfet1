export interface Booking {
    bookingId: number;
    employeeId: number;
    seatId: number;
    bookingDate: string;
    seatNumber?: number;
}