'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';


interface Reservation {
  id: number;
  status: 'Active' | 'Canceled';
  type: string;
  totalPrice: number;
  ticketId: number;
}

interface Ticket {
  id: number;
  date: string;
  price: number;
  exhibitionId: number;
}

interface Exhibition { id: number; title: string; }

interface ReservationWithTicket extends Reservation {
  ticket: Ticket | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day   : '2-digit',
    month : '2-digit',
    year  : 'numeric',
  });
}

const API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/artmuseum';


export default function ReservationsPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const [reservations, setReservations] = useState<ReservationWithTicket[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<'all' | 'active' | 'canceled'>('all');
  const [error , setError]              = useState('');
  const [exhibitions,  setExhibitions]  = useState<Exhibition[]>([]);

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'visitor') { router.push('/'); return; }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/reservations/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const exhibitionsRes = await fetch(`${API}/exhibitions`);
        const exhibitionsData = exhibitionsRes.ok ? await exhibitionsRes.json() : [];

        setExhibitions(exhibitionsData);

        if (res.status === 404) {
          setReservations([]);
          setError('');
        } else if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
        } else {
          const raw: Reservation[] = await res.json();
          if (!Array.isArray(raw)) {
            throw new Error('Некорректный формат данных');
          }

          const full: ReservationWithTicket[] = await Promise.all(
            raw.map(async r => {
              try {
                const tRes = await fetch(`${API}/tickets/${r.ticketId}`);
                const ticket = tRes.ok ? ((await tRes.json()) as Ticket) : null;
                return { ...r, ticket };
              } catch {
                return { ...r, ticket: null };
              }
            }),
          );

          setReservations(full);
          setError('');
        }
      } catch (e) {
        setReservations([]);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user, router]);

  function getExhibitionTitle(id: number): string {
    const ex = exhibitions.find(e => e.id === id);
    return ex ? ex.title : `нет`;
  }

  async function handleCancel(reservationId: number) {
    const token = localStorage.getItem('token');
    if (!token) { return; }

    try {
      const res = await fetch(`${API}/reservations/cancel/${reservationId}`, {
        method : 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { throw new Error('Не удалось отменить бронь'); }

      setReservations(prev =>
        prev.map(r =>
          r.id === reservationId ? { ...r, status: 'Canceled' } : r,
        ),
      );
    } catch (e) {
      alert((e as Error).message);
    }
  }


  const filtered = reservations.filter(r =>
    filter === 'all' ? true : r.status.toLowerCase() === filter,
  );


  if (loading) { return <p className='p-6'>Загрузка…</p>; }
  if (error) {   return <p className='p-6 text-red-600'>{error}</p>; }

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Мои брони</h1>

      <div className='flex space-x-4'>
        {(['all', 'active', 'canceled'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={filter === key ? 'font-semibold underline' : ''}
          >
            {key === 'all' ? 'Все' : key === 'active' ? 'Активные' : 'Отменённые'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>Брони не найдены</p>
      ) : (
        <ul className='space-y-4'>
          {filtered.map(r => (
            <li
              key={r.id}
              className='border p-4 rounded shadow flex justify-between items-center'
            >
              <div>
                <p><strong>Тип билета:</strong> {r.type}</p>

                {r.ticket ? (
                  <>
                    <p><strong>Выставка: ID:</strong> {r.ticket.exhibitionId}</p>
                    <p><strong>Название выставки:</strong> {getExhibitionTitle(r.ticket.exhibitionId)}</p>
                    <p><strong>Дата:</strong> {formatDate(r.ticket.date)}</p>
                    <p><strong>Цена билета:</strong> {r.ticket.price} BYN</p>
                  </>
                ) : (
                  <p className='text-red-600'>
                    Данные билета не найдены (ID {r.ticketId})
                  </p>
                )}

                <p><strong>Итоговая цена:</strong> {r.totalPrice} BYN</p>
                <p><strong>Статус:</strong> {r.status}</p>
              </div>

              {r.status === 'Active' && (
                <button
                  onClick={() => handleCancel(r.id)}
                  className='bg-red-600 text-white px-4 py-2 rounded'
                >
                  Отменить
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
