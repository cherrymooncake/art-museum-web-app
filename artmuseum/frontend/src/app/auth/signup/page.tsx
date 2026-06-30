'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'male',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      localStorage.setItem('token', data.token);

      router.push('/');

    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Регистрация</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          className='w-full p-2 border'
          placeholder='Имя'
          name='name'
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className='w-full p-2 border'
          placeholder='Email'
          type='email'
          name='email'
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className='w-full p-2 border'
          placeholder='Пароль'
          type='password'
          name='password'
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          className='w-full p-2 border'
          name='gender'
          value={form.gender}
          onChange={handleChange}
        >
          <option value='male'>Мужской</option>
          <option value='female'>Женский</option>
        </select>

        <button className='w-full bg-[#412f26] text-white py-2 rounded'>
          Зарегистрироваться
        </button>
      </form>

      {message && (
        <p className='mt-4 text-red-600 font-medium'>{message}</p>
      )}
    </div>
  );
}
