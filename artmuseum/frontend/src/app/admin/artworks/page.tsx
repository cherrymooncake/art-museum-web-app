'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface Artwork {
  id: number;
  title: string;
  author: string;
  description: string;
  yearCreated: string;
  category: string;
  imagePath?: string;
  exhibitionId: number;
}

interface Exhibition {
  id: number;
  title: string;
}

const categories = [
  'Drawing', 'Sculpture', 'Photography',
  'Printmaking', 'Textile', 'Ceramic',
];

export default function AdminArtworksPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const router = useRouter();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [form, setForm] = useState<Partial<Artwork>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (authLoading) { return; }
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchArtworks();
    fetchExhibitions();
  }, [isAuthenticated, user]);

  const fetchArtworks = async () => {
    const res = await fetch('http://localhost:4000/artmuseum/artworks');
    const data = await res.json();
    setArtworks(data);
  };

  const fetchExhibitions = async () => {
    const res = await fetch('http://localhost:4000/artmuseum/exhibitions');
    const data = await res.json();
    setExhibitions(data);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:4000/artmuseum/artworks/${editingId}`
      : 'http://localhost:4000/artmuseum/artworks';

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
      setForm({});
      setEditingId(null);
      setFile(null);
      fetchArtworks();
    }
  };

  const uploadImage = async (id: number) => {
    if (!file) { return; }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    await fetch(`http://localhost:4000/artmuseum/artworks/${id}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/artmuseum/artworks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchArtworks();
  };

  const startEdit = (art: Artwork) => {
    setForm(art);
    setEditingId(art.id);
  };

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Управление экспонатами</h1>

      <form onSubmit={handleSubmit} className='space-y-4 border p-4 rounded mb-6'>
        <input
          type='text'
          placeholder='Название'
          value={form.title || ''}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        <input
          type='text'
          placeholder='Автор'
          value={form.author || ''}
          onChange={e => setForm({ ...form, author: e.target.value })}
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
          type='text'
          placeholder='Год создания'
          value={form.yearCreated || ''}
          onChange={e => setForm({ ...form, yearCreated: e.target.value })}
          required
          className='w-full p-2 border rounded'
        />
        <select
          value={form.category || ''}
          onChange={e => setForm({ ...form, category: e.target.value })}
          required
          className='w-full p-2 border rounded'
        >
          <option value=''>Выберите категорию</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={form.exhibitionId?.toString() || ''}
          onChange={e => setForm({ ...form, exhibitionId: parseInt(e.target.value) })}
          required
          className='w-full p-2 border rounded'
        >
          <option value=''>Привязать к выставке</option>
          {exhibitions.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>
        <input type='file' onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type='submit' className='bg-green-600 text-white px-4 py-2 rounded'>
          {editingId ? 'Обновить' : 'Создать'}
        </button>
      </form>

      <ul className='space-y-4'>
        {artworks.map(art => (
          <li key={art.id} className='border p-4 rounded shadow'>
            <h2 className='font-bold'>{art.title}</h2>
            <p> {art.author}</p>
            <p> {art.yearCreated}</p>
            <p> {art.category}</p>
            <p>{art.description}</p>
            {art.imagePath && (
              <img
                src={`http://localhost:4000/${art.imagePath}`}
                alt={art.title}
                className='h-32 object-cover mt-2'
              />
            )}
            <div className='flex space-x-2 mt-2'>
              <button onClick={() => startEdit(art)} className='text-blue-600 underline'>Редактировать</button>
              <button onClick={() => handleDelete(art.id)} className='text-red-600 underline'>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
