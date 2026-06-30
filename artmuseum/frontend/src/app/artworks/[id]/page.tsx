'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/artmuseum/artworks/${id}`)
      .then(res => res.json())
      .then(data => setArtwork(data))
      .catch(err => console.error('Ошибка загрузки', err));
  }, [id]);

  if (!artwork) {
    return <div className='p-6'>Загрузка...</div>;
  }

  const imageUrl = artwork.imagePath
    ? `http://localhost:4000/${artwork.imagePath.replace(/\\/g, '/')}`
    : '/default.jpg';

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <button
        onClick={() => router.back()}
        className='mb-4 px-4 py-2 bg-[#5D2510] hover:bg-[#806044] rounded transition'
      >
        ← Вернуться назад
      </button>
      <div className='shadow-lg rounded-lg overflow-hidden p-6'>
        <div className='flex justify-center mb-6'>
          <img
            src={imageUrl}
            alt={artwork.title}
            className='max-w-sm w-full aspect-square object-contain rounded'
          />
        </div>
        <h1 className='text-3xl font-bold mb-2 text-center'>{artwork.title}</h1>
        <p className='text-lg font-medium mb-1 text-center'>
          Автор: <span className='font-normal'>{artwork.author}</span>
        </p>
        <p className='text-sm mb-1 text-center'>
          Год создания: {artwork.yearCreated}
        </p>
        <p className='text-sm mb-4 text-center'>
          Категория: {artwork.category}
        </p>
        <p className='leading-relaxed text-center'>
          {artwork.description}
        </p>
      </div>
    </div>
  );
}

