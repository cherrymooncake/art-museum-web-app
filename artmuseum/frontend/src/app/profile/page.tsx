'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

type Gender = 'male' | 'female';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/artmuseum';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser, logout, authLoading } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [gender,   setGender]   = useState<Gender>('male');
  const [currPass, setCurrPass] = useState('');
  const [newPass,  setNewPass]  = useState('');

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role !== 'visitor' && user?.role !== 'admin') {
      router.push('/');
      return;
    }

    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (!token) { return; }

    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal : controller.signal,
    })
      .then(r => { if (!r.ok) { throw new Error('Не удалось получить профиль'); } return r.json(); })
      .then(u => {
        setName(u.name);
        setEmail(u.email);
        setGender(u.gender);
        setError('');
      })
      .catch(e => { if (e.name !== 'AbortError') { setError(e.message); } })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isAuthenticated, user, router]);

  async function handleSaveProfile() {
    if (!name.trim()) { alert('Имя не может быть пустым'); return; }

    const token = localStorage.getItem('token');
    if (!token) { return; }

    setSaving(true);
    try {
      const res = await fetch(`${API}/users/me`, {
        method : 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept'      : 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), gender }),
      });

      if (!res.ok) {
        const { message } = await res.json().catch(() => ({ message: '' }));
        throw new Error(message || 'Ошибка сохранения');
      }

      const updated = await res.json();
      setUser(updated);
      alert('Данные профиля обновлены!');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    const token = localStorage.getItem('token');
    if (!token || !currPass || !newPass) { return; }
    if (newPass.length < 6) { alert('Новый пароль слишком короткий'); return; }

    try {
      const res = await fetch(`${API}/users/me/password`, {
        method : 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept'      : 'application/json',
        },
        body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
      });

      if (!res.ok) {
        const { message } = await res.json().catch(() => ({ message: '' }));
        throw new Error(message || 'Не удалось изменить пароль');
      }

      alert('Пароль успешно изменён');
      setCurrPass('');
      setNewPass('');
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) { return <p className='p-6'>Загрузка профиля…</p>; }
  if (error) {   return <p className='p-6 text-red-600'>{error}</p>; }

  return (
    <div className='max-w-2xl mx-auto p-6 space-y-8'>
      <h1 className='text-2xl font-bold'>Мой профиль</h1>

      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Личные данные</h2>

        <label className='block'>
          <span className='block mb-1'>Имя</span>
          <input
            type='text'
            className='border p-2 rounded w-full'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className='block'>
          <span className='block mb-1'>Email (нельзя изменить)</span>
          <input
            type='email'
            className='border p-2 rounded w-full cursor-not-allowed'
            value={email}
            disabled
          />
        </label>

        <label className='block'>
          <span className='block mb-1'>Пол</span>
          <select
            className='border p-2 rounded'
            value={gender}
            onChange={e => setGender(e.target.value as Gender)}
          >
            <option value='male'>Мужской</option>
            <option value='female'>Женский</option>
          </select>
        </label>

        <button
          className='bg-[#5D2510] px-4 py-2 rounded hover:bg-[#806044] disabled:opacity-50'
          disabled={saving}
          onClick={handleSaveProfile}
        >
          Сохранить
        </button>
      </section>

      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Изменить пароль</h2>

        <label className='block'>
          <span className='block mb-1'>Текущий пароль</span>
          <input
            type='password'
            className='border p-2 rounded w-full'
            value={currPass}
            onChange={e => setCurrPass(e.target.value)}
          />
        </label>

        <label className='block'>
          <span className='block mb-1'>Новый пароль (мин. 6 символов)</span>
          <input
            type='password'
            className='border p-2 rounded w-full'
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
          />
        </label>

        <button
          className='bg-[#5D2510] px-4 py-2 rounded hover:bg-[#806044] disabled:opacity-50'
          disabled={!currPass || newPass.length < 6}
          onClick={handleChangePassword}
        >
          Сменить пароль
        </button>
      </section>

      <section>
        <button
          className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
          onClick={logout}
        >
          Выйти из аккаунта
        </button>
      </section>
    </div>
  );
}
