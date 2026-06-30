'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface Ticket {
  id: number;
  date: string;
  status: 'Available' | 'Booked' | 'Unavailable';
  price: number;
  exhibitionId: number;
}
interface Exhibition {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
}

interface FormState {
  status?: Ticket['status'];
  price?: number;
  date?: string;
  exhibitionId?: number;
  count?: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/artmuseum';
const statuses: Array<Ticket['status']> = ['Available', 'Booked', 'Unavailable'];
const editableStatuses = statuses.filter(s => s !== 'Booked');

export default function AdminTicketsPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const statusLabels: Record<Ticket['status'], string> = {
    Available: 'Доступен',
    Booked: 'Забронирован',
    Unavailable: 'Недоступен',
  };

  const [tickets,      setTickets]      = useState<Ticket[]>([]);
  const [exhibitions,  setExhibitions]  = useState<Exhibition[]>([]);
  const [form,         setForm]         = useState<FormState>({});
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [delEx,   setDelEx]   = useState<number>();
  const [delDate, setDelDate] = useState<string>('');

  const token = () => localStorage.getItem('token');

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('ru-RU',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const [manualUpdateMessage, setManualUpdateMessage] = useState('');

  async function handleManualUpdate() {
    if (!token()) {
      alert('Пожалуйста, войдите в систему');
      return;
    }
    try {
      const res = await fetch(`${API}/tickets/mark-expired-unavailable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();
      setManualUpdateMessage(`Обновлено билетов: ${data.updatedCount}`);
      fetchAll();
    } catch (e) {
      setManualUpdateMessage(`Ошибка при обновлении: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/auth/login'); return; }
    fetchAll();
  }, [isAuthenticated, user]);

  const fetchAll = async () => {
    const [t, e] = await Promise.all([
      fetch(`${API}/tickets`).then(r => r.json()),
      fetch(`${API}/exhibitions`).then(r => r.json()),
    ]);
    setTickets(t);
    setExhibitions(e);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token()) { return; }

    if (!editingId && form.date) {
      const selectedDate = new Date(form.date);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        alert('Нельзя создавать билеты на сегодняшнюю или прошедшую дату.');
        return;
      }

      if (!editingId && form.date && form.exhibitionId) {
        const selectedTicketDateStr = form.date;
        const selectedExhibitionId = form.exhibitionId;

        const selectedExhibition = exhibitions.find(ex => ex.id === selectedExhibitionId);

        if (!selectedExhibition) {
          alert('Выбранная выставка не найдена. Пожалуйста, обновите страницу.');
          return;
        }

        const exhibitionStartDateStr = selectedExhibition.startDate;
        const exhibitionEndDateStr = selectedExhibition.endDate;

        if (selectedTicketDateStr < exhibitionStartDateStr || selectedTicketDateStr > exhibitionEndDateStr) {
          alert(
              `Нельзя создать билет на эту дату. Выставка "${selectedExhibition.title}" проходит с ` +
              `${fmtDate(exhibitionStartDateStr)} по ${fmtDate(exhibitionEndDateStr)}.`
          );
          return;
        }
      }

    }

    try {
      if (editingId) {
        await fetch(`${API}/tickets/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
          },
          body: JSON.stringify({
            date: form.date,
            exhibitionId: form.exhibitionId,
            status: form.status,
            price: form.price,
          }),
        });
      } else {
        const body = {
          ticket: {
            date: form.date,
            status: form.status,
            price: form.price,
            exhibitionId: form.exhibitionId,
          },
          count: form.count,
        };
        await fetch(`${API}/tickets/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
          },
          body: JSON.stringify(body),
        });
      }

      resetForm();
      fetchAll();
    } catch (err) {
      alert('Ошибка сохранения: ' + (err as Error).message);
    }
  }

  function resetForm() {
    setForm({});
    setEditingId(null);
  }

  function getExhibitionTitle(id: number): string {
    const ex = exhibitions.find(e => e.id === id);
    return ex ? ex.title : `ID: ${id}`;
  }

  async function handleDelete(id: number) {
    if (!token()) { return; }

    const res = await fetch(`${API}/tickets/${id}`, {
      method : 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });

    if (!res.ok) {
      const { message } = await res.json().catch(() => ({ message: '' }));
      alert('Не удалось удалить билет: ' + (message || res.status));
      return;
    }
    fetchAll();
  }

  function startEdit(t: Ticket) {
    setEditingId(t.id);
    setForm({
      status      : t.status,
      price       : t.price,
      date        : t.date,
      exhibitionId: t.exhibitionId,
    });
  }

  const [bulkDeleteMessage, setBulkDeleteMessage] = useState('');

  async function bulkDeleteByExhibition() {
    if (!delEx || !delDate) {
      setBulkDeleteMessage('Пожалуйста, выберите выставку и дату');
      return;
    }
    const ticketsToDelete = tickets.filter(ticket => {
      const ticketDate = ticket.date.split('T')[0];
      return (
        ticket.exhibitionId === delEx &&
        ticketDate === delDate &&
        ticket.status !== 'Booked'
      );
    });
    if (ticketsToDelete.length === 0) {
      setBulkDeleteMessage('Нет билетов для удаления. Забронированные билеты не удаляются.');
      return;
    }
    try {
      if (!token()) {
        setBulkDeleteMessage('Необходима авторизация');
        return;
      }
      await fetch(`${API}/tickets/by-exhibition`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({ exhibitionId: delEx, date: delDate }),
      });
      setBulkDeleteMessage(`Удалено ${ticketsToDelete.length} билетов. Забронированные билеты не удалялись.`);
      setDelEx(undefined);
      setDelDate('');
      fetchAll();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setBulkDeleteMessage(`Ошибка при удалении: ${error.message}`);
      } else {
        setBulkDeleteMessage('Произошла неизвестная ошибка при удалении');
      }
    }
  }

  async function bulkDeleteUnavailable() {
    if (!token()) { return; }
    await fetch(`${API}/tickets/unavailable`, {
      method : 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    fetchAll();
  }

  const visibleTickets =
    filterStatus === '' ? tickets : tickets.filter(t => t.status === filterStatus);

  return (
    <div className='max-w-5xl mx-auto p-6 space-y-8'>
      <h1 className='text-2xl font-bold'>Управление билетами</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
        {!editingId && (
          <>
            <input
              type="date"
              value={form.date || ''}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
              className="w-full p-2 border rounded"
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
            />
            <select
              value={form.exhibitionId ?? ''}
              onChange={e => setForm({ ...form, exhibitionId: parseInt(e.target.value) })}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Выберите выставку</option>
              {exhibitions.map(ex => (
                <option key={ex.id} value={ex.id} className="text-[#5D2510]">{ex.title}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              placeholder="Количество билетов"
              value={form.count ?? ''}
              onChange={e => setForm({ ...form, count: parseInt(e.target.value) })}
              required
              className="w-full p-2 border rounded"
            />
          </>
        )}

        <select
          value={form.status || ''}
          onChange={e => setForm({ ...form, status: e.target.value as Ticket['status'] })}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Статус…</option>
          {editableStatuses.map(s => <option key={s} value={s} className="text-[#5D2510]">{s}</option>)}
        </select>

        <input
          type='number'
          min={0}
          step='0.01'
          placeholder='Цена'
          value={form.price ?? ''}
          onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
          className='w-full p-2 border rounded'
        />

        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
          {editingId ? 'Сохранить' : 'Создать'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-3 text-sm underline"
          >
            отменить редактирование
          </button>
        )}
      </form>

      <div className="border p-4 rounded space-y-4">
        <h2 className="font-semibold">Массовое удаление</h2>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={delEx ?? ''}
            onChange={e => setDelEx(parseInt(e.target.value))}
            className='p-2 border rounded'
          >
            <option value=''>Выставка…</option>
            {exhibitions.map(ex => <option key={ex.id} value={ex.id} className='text-[#5D2510]'>{ex.title}</option>)}
          </select>
          <input
            type='date'
            value={delDate}
            onChange={e => setDelDate(e.target.value)}
            className='p-2 border rounded'
          />
          <button onClick={bulkDeleteByExhibition} className='bg-red-600 text-white px-3 py-2 rounded'>
            Удалить билеты этой выставки в этот день
          </button>
          <div className='text-red-600 mt-2'>
            {bulkDeleteMessage}
          </div>
        </div>

        <button onClick={bulkDeleteUnavailable} className='bg-red-600 text-white px-3 py-2 rounded'>
          Удалить все недоступные билеты
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleManualUpdate}
          className="bg-[#5D2510] hover:bg-[#806044] px-4 py-2 rounded"
        >
          Обновить статусы билетов на Недоступно (для незабронированных старых билетов)
        </button>
      </div>

      {manualUpdateMessage && (
        <p className="mt-2 text-green-600">{manualUpdateMessage}</p>
      )}

      <div>
        <label className='mr-2 font-medium'>Статус:</label>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className='p-2 border rounded'
        >
          <option value=''>все билеты</option>
          {statuses.map(s => <option className='text-[#5D2510]' key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <ul className='space-y-4'>
        {visibleTickets.map(t => (
          <li key={t.id} className='border p-4 rounded shadow'>
            <p><strong>Дата:</strong> {fmtDate(t.date)}</p>
            <p><strong>Статус:</strong> {statusLabels[t.status]}</p>
            <p><strong>Цена:</strong> {t.price} BYN</p>
            <p><strong>ID выставки:</strong> {t.exhibitionId}</p>
            <p><strong>Выставка:</strong> {getExhibitionTitle(t.exhibitionId)}</p>

            {t.status !== 'Booked' && (
              <div className='flex gap-4 mt-2'>
                <button onClick={() => startEdit(t)} className='text-blue-600 underline'>Редактировать</button>
                <button onClick={() => handleDelete(t.id)} className='text-red-600 underline'>Удалить</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
