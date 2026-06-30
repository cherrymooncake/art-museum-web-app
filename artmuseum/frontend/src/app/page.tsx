import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Welcome Block */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">Добро пожаловать в Художественный Музей!</h1>

        <Image
          src="/welcome.jpg"
          alt="Museum Welcome"
          width={800}
          height={400}
          className="rounded-lg shadow-xl mb-8"
          priority
        />

        <section className="mb-10 px-4 text-lg leading-relaxed max-w-3xl">
          <p>
            Наш Художественный Музей – это место, где история искусства оживает через века.
            Мы гордимся богатой коллекцией, включающей произведения от классических мастеров до современных художников.
          </p>
          <p className="mt-4">
            Основанный более 100 лет назад, музей стал центром культурной жизни города,
            где посетители могут не только насладиться шедеврами, но и узнать больше об истории искусства и его влиянии на современность.
          </p>
          <p className="mt-4">
            Приглашаем вас открыть для себя уникальные выставки и принять участие в наших образовательных программах.
          </p>
        </section>

        <Link href="/exhibitions" className="inline-block bg-[#5D2510] hover:bg-[#806044] text-white font-semibold px-6 py-3 rounded-lg transition">
          Смотреть выставки
        </Link>

      </main>

    </div>
  );
}
