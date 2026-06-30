'use client';
import { useState } from 'react';
import { Reservation } from '@/app/types/Reservation';

interface Props {
  reservation: Reservation;
  token: string;
}

export default function ReservationCard({ reservation, token }: Props) {
  const [status, setStatus] = useState(reservation.status);

  const cancelReservation = async () => {
    const res = await fetch(`http://localhost:4000/artmuseum/reservations/cancel/${reservation.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setStatus('Canceled');
    } else {
      alert('Ошибка при отмене брони');
    }
  };

  return (
    <div className='border p-4 rounded shadow-sm flex justify-between items-center'>
      <div>
        <p><strong>Тип:</strong> {reservation.type}</p>
        <p><strong>Цена:</strong> {reservation.totalPrice}₽</p>
        <p><strong>Статус:</strong> {status}</p>
      </div>
      {status === 'Active' && (
        <button onClick={cancelReservation} className='bg-red-500 text-white px-4 py-2 rounded'>
          Отменить
        </button>
      )}
    </div>
  );
}
