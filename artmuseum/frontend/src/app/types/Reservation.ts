export interface Reservation {
    id: number;
    status: 'Active' | 'Canceled';
    type: 'Adult' | 'Child' | 'Student' | 'Senior';
    totalPrice: number;
    ticketId: number;
    userId: number;
}
