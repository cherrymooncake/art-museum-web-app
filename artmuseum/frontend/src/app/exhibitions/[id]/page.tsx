'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExhibitionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exhibition, setExhibition] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/artmuseum/exhibitions/${id}`)
      .then(res => res.json())
      .then(data => setExhibition(data))
      .catch(err => console.error('Ошибка загрузки', err));
  }, [id]);

  if (!exhibition) {
    return <div className='p-6'>Загрузка...</div>;
  }

  const imageUrl = exhibition.imagePath
    ? `http://localhost:4000/${exhibition.imagePath.replace(/\\/g, '/')}`
    : '/default.jpg'; // fallback image

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <button
        onClick={() => router.back()}
        className='bg-[#5D2510] mb-4 px-4 py-2 hover:bg-[#806044] rounded transition'
      >
        ← Вернуться назад
      </button>
      <div className='shadow-lg rounded-lg overflow-hidden'>
        <img
          src={imageUrl}
          alt={exhibition.title}
          className='w-full h-96 object-cover'
        />
        <div className='p-6'>
          <h1 className='text-3xl font-bold mb-2'>{exhibition.title}</h1>
          <p className='text-sm mb-4'>
            {exhibition.startDate?.slice(0, 10)} – {exhibition.endDate?.slice(0, 10)}
          </p>
          <Link href='/reserve'>
            <button className='bg-[#5D2510] hover:bg-[#806044] px-4 py-2 rounded transition'>
              Забронировать билет
            </button>
          </Link>
          <p className='leading-relaxed'>{exhibition.description}</p>
        </div>
      </div>
    </div>
  );
}
