'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/artmuseum/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { throw new Error('Ошибка входа'); }
      const data = await res.json();
      login(data.token);
      router.push('/');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Вход</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input className='w-full p-2 border' placeholder='Email' type='email' name='email' value={form.email} onChange={handleChange} required />
        {/* tslint:disable-next-line:max-line-length */}
        <input className='w-full p-2 border' placeholder='Пароль' type='password' name='password' value={form.password} onChange={handleChange} required />
        <button className='w-full bg-[#412f26] text-white py-2 rounded'>Войти</button>
      </form>
    </div>
  );
}
