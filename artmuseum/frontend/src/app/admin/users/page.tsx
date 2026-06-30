'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  gender: 'male' | 'female';
  role: 'admin' | 'visitor';
  password?: string;
}

const AdminUsersPage = () => {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Partial<User>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reservationCounts, setReservationCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchUsers();
    fetchReservationCounts();
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/artmuseum/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const fetchReservationCounts = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/artmuseum/reservations/active-count-by-user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReservationCounts(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:4000/artmuseum/users/${editingId}`
      : 'http://localhost:4000/artmuseum/users';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({});
      setEditingId(null);
      fetchUsers();
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/artmuseum/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const startEdit = (user: User) => {
    setForm(user);
    setEditingId(user.id);
  };

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Пользователи</h1>

      <form onSubmit={handleSubmit} className='space-y-4 border p-4 rounded mb-6'>
        <input
          type='text'
          placeholder='Имя'
          value={form.name || ''}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        <input
          type='email'
          placeholder='Email'
          value={form.email || ''}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        {!editingId && (
          <input
            type='password'
            placeholder='Пароль (min 6 символов)'
            value={form.password || ''}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            className='w-full p-2 border rounded'
          />
        )}
        <select
          value={form.gender || ''}
          onChange={e => setForm({ ...form, gender: e.target.value as User['gender'] })}
          required
          className='w-full p-2 border rounded'
        >
          <option value=''>Пол</option>
          <option value='male'>Мужской</option>
          <option value='female'>Женский</option>
        </select>
        <select
          value={form.role || ''}
          onChange={e => setForm({ ...form, role: e.target.value as User['role'] })}
          required
          className='w-full p-2 border rounded'
        >
          <option value=''>Роль</option>
          <option value='visitor'>Посетитель</option>
          <option value='admin'>Администратор</option>
        </select>
        <button type='submit' className='bg-green-600 text-white px-4 py-2 rounded'>
          {editingId ? 'Обновить' : 'Создать'}
        </button>
      </form>

      <ul className='space-y-4'>
        {users.map(user => (
          <li key={user.id} className="border p-4 rounded shadow">
            <p><strong>Имя:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Пол:</strong> {user.gender === 'male' ? 'Мужской' : 'Женский'}</p>
            <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Посетитель'}</p>
            <p><strong>Активных броней:</strong> {reservationCounts[user.id] || 0}</p>
            <div className="flex space-x-2 mt-2">
              <button onClick={() => startEdit(user)} className="text-blue-600 underline">Редактировать</button>
              <button onClick={() => handleDelete(user.id)} className="text-red-600 underline">Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUsersPage;
