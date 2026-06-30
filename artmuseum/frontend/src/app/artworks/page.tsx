'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ArtworksPage() {
  const [allArtworks, setAllArtworks] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<Array<{ id: number; title: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const artworksPerPage = 6;

  useEffect(() => {
    fetchArtworks();
    fetchCategories();
    fetchExhibitions();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/artmuseum/artworks');
      const data = await res.json();
      setAllArtworks(Array.isArray(data) ? data : []);
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('Ошибка загрузки экспонатов', err);
      setAllArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:4000/artmuseum/artworks/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('Ошибка загрузки категорий', err);
      setCategories([]);
    }
  };

  const fetchExhibitions = async () => {
    try {
      const res = await fetch('http://localhost:4000/artmuseum/exhibitions');
      const data = await res.json();
      setExhibitions(Array.isArray(data) ? data : []);
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('Ошибка загрузки выставок', err);
      setExhibitions([]);
    }
  };

  const getExhibitionTitle = (id: number): string => {
    const ex = exhibitions.find((e) => e.id === id);
    return ex ? ex.title : `ID: ${id}`;
  };

  const filteredArtworks = allArtworks.filter((art) => {
    const matchesTitle = art.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category ? art.category === category : true;
    const matchesExhibition = selectedExhibition
      ? art.exhibitionId === Number(selectedExhibition)
      : true;
    return matchesTitle && matchesCategory && matchesExhibition;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, selectedExhibition]);

  const indexOfLast = currentPage * artworksPerPage;
  const indexOfFirst = indexOfLast - artworksPerPage;
  const currentArtworks = filteredArtworks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(Math.ceil(filteredArtworks.length / artworksPerPage), 1);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setSelectedExhibition('');
    setCurrentPage(1);
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Экспонаты</h1>

      <div className='flex flex-wrap gap-4 mb-4 items-center'>
        <input
          type='text'
          placeholder='Поиск по названию...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='p-2 border rounded'
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='p-2 border rounded'
        >
          <option value=''>Все категории</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat} className='text-[#5D2510]'>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedExhibition}
          onChange={(e) => setSelectedExhibition(e.target.value)}
          className='p-2 border rounded'
        >
          <option value=''>Все выставки</option>
          {exhibitions.map((ex) => (
            <option key={ex.id} value={ex.id} className='text-[#5D2510]'>
              {ex.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className='p-2 border rounded hover:bg-gray-300'
        >
          Сбросить фильтры
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : filteredArtworks.length === 0 ? (
        <p>Нет экспонатов, соответствующих фильтрам.</p>
      ) : (
        <>
          <ul className='space-y-4'>
            {currentArtworks.map((art) => (
              <li
                key={art.id}
                className='flex items-start border p-4 rounded shadow gap-4'
              >
                <img
                  src={
                    art.imagePath
                      ? `http://localhost:4000/${art.imagePath.replace(/\\/g, '/')}`
                      : '/default.jpg'
                  }
                  alt={art.title}
                  className='w-32 h-32 object-cover rounded'
                />
                <div>
                  <Link
                    href={`/artworks/${art.id}`}
                    className='text-xl font-semibold hover:underline'
                  >
                    {art.title}
                  </Link>
                  <p>Автор: {art.author}</p>
                  <p>{art.description}</p>
                  <p className='text-sm'>Год создания: {art.yearCreated}</p>
                  <p className='text-sm'>Категория: {art.category}</p>
                  <p className='text-sm'>
                    Выставка: {getExhibitionTitle(art.exhibitionId)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className='flex justify-center items-center mt-6 gap-4'>
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className='px-4 py-2 border rounded disabled:opacity-50'
            >
              Назад
            </button>
            <span>
              Страница {currentPage} из {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className='px-4 py-2 border rounded disabled:opacity-50'
            >
              Вперёд
            </button>
          </div>
        </>
      )}
    </div>
  );
}
