'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface Exhibition {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  imagePath?: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function AdminExhibitionsPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [form, setForm] = useState<Partial<Exhibition>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchExhibitions();
  }, [isAuthenticated, user]);

  const fetchExhibitions = async () => {
    const res = await fetch('http://localhost:4000/artmuseum/exhibitions');
    const data = await res.json();
    setExhibitions(data);
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(form.startDate || '');
    const end = new Date(form.endDate || '');
    if (start <= today) {
      alert('Дата начала выставки должна быть позже сегодняшнего дня.');
      return;
    }
    if (end < start) {
      alert('Дата окончания не может быть раньше даты начала.');
      return;
    }

    const token = localStorage.getItem('token');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:4000/artmuseum/exhibitions/${editingId}`
      : 'http://localhost:4000/artmuseum/exhibitions';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      if (file) {
        await uploadImage(data.id);
      }
    }

    setForm({});
    setEditingId(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fetchExhibitions();
  };

  const uploadImage = async (id: number) => {
    if (!file) { return; }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    await fetch(`http://localhost:4000/artmuseum/exhibitions/${id}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/artmuseum/exhibitions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchExhibitions();
  };

  const startEdit = (ex: Exhibition) => {
    setForm(ex);
    setEditingId(ex.id);
  };

  if (loading) { return <p className='p-4'>Загрузка...</p>; }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Управление выставками</h1>

      <form onSubmit={handleSubmit} className='space-y-4 mb-8 border p-4 rounded'>
        <input
          type='text'
          placeholder='Название'
          value={form.title || ''}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        <textarea
          placeholder='Описание'
          value={form.description || ''}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        <input
          type='date'
          value={form.startDate || ''}
          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
          required
          className='p-2 border rounded'
        />
        <input
          type='date'
          value={form.endDate || ''}
          min={form.startDate || ''}
          onChange={e => setForm({ ...form, endDate: e.target.value })}
          required
          className='p-2 border rounded'
        />
        <input
          type='file'
          ref={fileInputRef}
          onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type='submit' className='bg-[#5D2510] hover:bg-[#806044] text-white px-4 py-2 rounded'>
          {editingId ? 'Обновить' : 'Создать'}
        </button>
      </form>

      <ul className='space-y-4'>
        {exhibitions.map(ex => (
          <li key={ex.id} className='border p-4 rounded shadow'>
            <h2 className='font-bold'>{ex.title}</h2>
            <p>{ex.description}</p>
            <p>{formatDate(ex.startDate)} — {formatDate(ex.endDate)}</p>
            {ex.imagePath && <img src={`http://localhost:4000/${ex.imagePath}`} alt={ex.title} className='h-32 object-cover mt-2' />}
            <div className='flex space-x-2 mt-4'>
              <button onClick={() => startEdit(ex)} className='text-blue-600 underline'>Редактировать</button>
              <button onClick={() => handleDelete(ex.id)} className='text-red-600 underline'>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
