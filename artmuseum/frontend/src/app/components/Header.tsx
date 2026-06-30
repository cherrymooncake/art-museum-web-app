'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className='p-4 border-b bg-[#412f26] shadow-sm text-white'>
      <div className='flex justify-between items-center max-w-7xl mx-auto'>
        <div className='flex items-center space-x-6'>
          <Link href='/' className='text-xl font-bold'>Главная</Link>
          <nav className='space-x-4'>
            <Link href='/exhibitions'>Выставки</Link>
            <Link href='/artworks'>Экспонаты</Link>
            <Link href='/about'>О музее</Link>
            {isAuthenticated && <Link href='/profile'>Профиль</Link>}
            {user?.role === 'visitor' && (
              <Link href='/reservations' className='text-sm'>Мои брони</Link>
            )}
            {user?.role === 'visitor' && (
              <Link href='/reserve' className='text-sm'>Забронировать билет</Link>
            )}
            {user?.role === 'admin' && (
              <Link href='/admin/exhibitions' className='text-sm'>Управление выставками</Link>
            )}
            {user?.role === 'admin' && (
              <Link href='/admin/artworks' className='text-sm'>Управление экспонатами</Link>
            )}
            {user?.role === 'admin' && (
              <Link href='/admin/tickets' className='text-sm'>Управление билетами</Link>
            )}
            {user?.role === 'admin' && (
              <Link href='/admin/users' className='text-sm'>Пользователи</Link>
            )}
          </nav>
        </div>
        <div className='space-x-4'>
          {!isAuthenticated ? (
            <>
              <Link href='/auth/login'>Вход</Link>
              <Link href='/auth/signup'>Регистрация</Link>
            </>
          ) : (
            <>
              <span>{user?.name}</span>
              <button onClick={logout} className='underline text-sm'>Выйти</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
