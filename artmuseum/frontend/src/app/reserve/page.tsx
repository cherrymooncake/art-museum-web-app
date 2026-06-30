'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useAuth, User } from '../context/AuthContext';

interface Exhibition {
  id: number;
  title: string;
}

interface Ticket {
  id: number;
  date: string;
  status: 'Available' | 'Booked' | 'Unavailable';
  price: number;
  exhibitionId: number;
}

type ReservationType = 'Adult' | 'Child' | 'Student' | 'Senior';

const TYPE_DISCOUNT: Record<ReservationType, number> = {
  Adult: 0,
  Child: 0.7,
  Student: 0.5,
  Senior: 0.5,
};

const MAX_ACTIVE = 5;

async function reloadTicketsAndActive(
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  setActiveCount: React.Dispatch<React.SetStateAction<number>>,
  user: User | null,
) {
  if (!user) { return; }
  const token = localStorage.getItem('token');
  if (!token) { return; }

  try {
    const [ticketsRes, reservationsRes] = await Promise.all([
      fetch('http://localhost:4000/artmuseum/tickets'),
      fetch('http://localhost:4000/artmuseum/reservations/my', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const ticketsData: Ticket[] = await ticketsRes.json();
    setTickets(ticketsData.filter(t => t.status === 'Available'));

    const reservations: any[] = await reservationsRes.json();
    setActiveCount(reservations.filter(r => r.status === 'Active').length);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error('Ошибка обновления данных:', e);
    alert('Ошибка загрузки данных');
  }
}

export default function ReservePage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  const [selectedExh, setSelectedExh] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<ReservationType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'visitor') {
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');

    const fetchExh = fetch('http://localhost:4000/artmuseum/exhibitions')
      .then(r => r.json())
      .then(setExhibitions);

    const fetchTickets = fetch('http://localhost:4000/artmuseum/tickets')
      .then(r => r.json())
      .then((data: Ticket[]) =>
        setTickets(data.filter(t => t.status === 'Available')),
      );

    const fetchActive = token
      ? fetch('http://localhost:4000/artmuseum/reservations/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async r => {
          if (!r.ok) { return []; }
          const data = await r.json();
          return data;
        })
        .then((data: any[]) =>
          setActiveCount(data.filter(r => r.status === 'Active').length),
        )
      : Promise.resolve();

    Promise.allSettled([fetchExh, fetchTickets, fetchActive])
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const availableDates = useMemo(() => {
    if (!selectedExh) { return []; }
    const set = new Set(
      tickets
        .filter(t => t.exhibitionId === selectedExh)
        .map(t => format(parseISO(t.date), 'yyyy-MM-dd')),
    );
    return Array.from(set).map(d => parseISO(d));
  }, [tickets, selectedExh]);

  const dayDisabled = (day: Date) =>
    !availableDates.some(d => d.getTime() === day.getTime());

  const basePrice = useMemo(() => {
    if (!selectedExh || !selectedDate) { return 0; }
    const ticket = tickets.find(
      t =>
        t.exhibitionId === selectedExh &&
        format(parseISO(t.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'),
    );
    return ticket?.price ?? 0;
  }, [tickets, selectedExh, selectedDate]);

  const totalPrice = useMemo(() => {
    if (!selectedType) { return 0; }
    return basePrice * (1 - TYPE_DISCOUNT[selectedType]);
  }, [selectedType, basePrice]);

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedExh || !selectedDate || !selectedType) { return; }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const ticketsForDate = tickets.filter(
      t =>
        t.exhibitionId === selectedExh &&
        format(parseISO(t.date), 'yyyy-MM-dd') === dateStr,
    );

    if (ticketsForDate.length === 0) {
      alert('Нет свободных билетов на выбранную дату');
      return;
    }

    const ticket = ticketsForDate[0];
    const body = JSON.stringify({
      ticketId: ticket.id,
      status: 'Active',
      type: selectedType,
      totalPrice: ticket.price * (1 - TYPE_DISCOUNT[selectedType]),
    });

    try {
      const res = await fetch('http://localhost:4000/artmuseum/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      alert('Бронь успешно создана!');
      router.push('/reservations');
    } catch (e: any) {
      alert('Ошибка при создании брони: ' + e.message);
      await reloadTicketsAndActive(setTickets, setActiveCount, user);
    }
  };

  if (loading) { return <p className='p-6'>Загрузка…</p>; }
  if (error) { return <p className='p-6 text-red-600'>{error}</p>; }

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-8'>
      <h1 className='text-2xl font-bold'>Бронирование билета</h1>

      <div>
        <h2 className='font-semibold mb-2'>Выберите выставку:</h2>
        <select
          className='border rounded p-2'
          value={selectedExh ?? ''}
          onChange={e => {
            setSelectedExh(+e.target.value || null);
            setSelectedDate(undefined);
            setSelectedType(null);
          }}
        >
          <option value=''>Выставка:</option>
          {exhibitions.map(exh => (
            <option key={exh.id} value={exh.id} className='text-[#5D2510]'>
              {exh.title}
            </option>
          ))}
        </select>
      </div>

      {selectedExh && (
        <div>
          <h2 className='font-semibold mb-2'>Выберите дату:</h2>
          <DayPicker
            mode='single'
            selected={selectedDate}
            onSelect={d => {
              setSelectedDate(d || undefined);
              setSelectedType(null);
            }}
            disabled={dayDisabled}
            locale={ru}
            fromDate={addDays(new Date(), 0)}
            modifiersClassNames={{
              selected: 'bg-[#5D2510] text-white',
              disabled: 'opacity-30',
            }}
            required
          />
        </div>
      )}

      {selectedDate && (
        <div>
          <h2 className="font-semibold mb-2">Выберите тип билета:</h2>
          <select
            className="border rounded p-2"
            value={selectedType ?? ''}
            onChange={e => setSelectedType(e.target.value as ReservationType)}
          >
            <option value="">Тип билета:</option>
            <option value="Adult" className="text-[#5D2510]">Взрослый</option>
            <option value="Child" className="text-[#5D2510]">Детский (−70%)</option>
            <option value="Student" className="text-[#5D2510]">Студенческий (−50%)</option>
            <option value="Senior" className="text-[#5D2510]">Пенсионный (−50%)</option>
          </select>
          <p>
            Обратите внимание, что для получения скидки Вам нужно будет предоставить соответствующий документ (паспорт, карту студента и т.д.) при посещении музея.
          </p>
        </div>
      )}
      {totalPrice > 0 && (
        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-xl font-semibold">
          Итого: {totalPrice.toFixed(2)} BYN
          </p>
          <button
            className='bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50'
            disabled={activeCount >= MAX_ACTIVE}
            onClick={handleConfirm}
          >
            Подтвердить
          </button>
        </div>
      )}

      {activeCount >= MAX_ACTIVE && (
        <p className='text-red-600'>
          У вас уже {MAX_ACTIVE} активных бронирований. Отмените одну, чтобы создать новую.
        </p>
      )}
    </div>
  );
}
