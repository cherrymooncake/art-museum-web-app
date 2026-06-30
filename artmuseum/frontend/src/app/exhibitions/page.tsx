'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rangeStartDate, setRangeStartDate] = useState<Date | null>(null);
  const [rangeEndDate, setRangeEndDate] = useState<Date | null>(null);
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'd MMMM yyyy', { locale: ru });

  const formatDateForAPI = (date: Date) =>
    format(date, 'yyyy-MM-dd');

  const fetchFiltered = async () => {
    setLoading(true);

    const start = rangeStartDate ? formatDateForAPI(rangeStartDate) : '';
    const end = rangeEndDate ? formatDateForAPI(rangeEndDate) : '';
    const single = singleDate ? formatDateForAPI(singleDate) : '';
    let url = 'http://localhost:4000/artmuseum/exhibitions';

    if (start && end) {
      url = `http://localhost:4000/artmuseum/exhibitions/filter/by-dates?start=${start}&end=${end}`;
    } else if (single) {
      url = `http://localhost:4000/artmuseum/exhibitions/filter/by-date?date=${single}`;
    } else if (searchQuery) {
      url = `http://localhost:4000/artmuseum/exhibitions/search?title=${encodeURIComponent(searchQuery)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        setExhibitions(data);
      } else {
        // tslint:disable-next-line:no-console
        console.error('Получены некорректные данные:', data);
        setExhibitions([]);
      }
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('Ошибка загрузки выставок', err);
      setExhibitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltered();
  }, [searchQuery, rangeStartDate, rangeEndDate, singleDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rangeStartDate, rangeEndDate, singleDate]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setRangeStartDate(null);
    setRangeEndDate(null);
    setSingleDate(null);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentExhibitions = exhibitions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(Math.ceil(exhibitions.length / itemsPerPage), 1);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Выставки</h1>

      <div className='flex flex-wrap gap-4 mb-4 items-center'>
        <input
          type='text'
          placeholder='Поиск по названию...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='p-2 border rounded'
        />


        <div className='flex items-center gap-2'>
          <span>На дату:</span>
          <DatePicker
            selected={singleDate}
            onChange={(date) => setSingleDate(date)}
            dateFormat='yyyy-MM-dd'
            placeholderText='Одна дата'
            className='p-2 border rounded'
            locale={ru}
          />
        </div>

        <button
          onClick={handleResetFilters}
          className='p-2 border rounded hover:bg-gray-300'
        >
          Сбросить фильтры
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : exhibitions.length === 0 ? (
        <p>Нет выставок, соответствующих фильтрам.</p>
      ) : (
        <>
          <ul className='space-y-2'>
            {currentExhibitions.map((exh) => (
              <li
                key={exh.id}
                className='border p-4 rounded shadow flex gap-4 items-start'
              >
                <img
                  src={
                    exh.imagePath
                      ? `http://localhost:4000/${exh.imagePath.replace(/\\/g, '/')}`
                      : '/default.jpg'
                  }
                  alt={exh.title}
                  className='w-32 h-32 object-cover rounded'
                />
                <div>
                  <Link
                    href={`/exhibitions/${exh.id}`}
                    className='text-xl font-semibold block hover:underline'
                  >
                    {exh.title}
                  </Link>
                  <p>{exh.description}</p>
                  <p className='text-sm'>
                    {formatDate(exh.startDate)} – {formatDate(exh.endDate)}
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
