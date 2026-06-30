export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-center">О Музее</h1>

      <section className="space-y-4 text-lg leading-relaxed">
        <p>
          Наш художественный музей посвящен сохранению, изучению и демонстрации произведений искусства со всего мира.
        </p>
        <p>
          Здесь вы найдете уникальные выставки, редкие экспонаты и глубокую историю, представленную через визуальное искусство.
        </p>
        <p>
          Посетите нас, чтобы вдохновиться и погрузиться в атмосферу творчества и красоты!
        </p>
      </section>

      <section className="rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Контакты</h2>
        <p><strong>Адрес:</strong> ул. Искусств, 12, Минск, Беларусь</p>
        <p><strong>Телефон:</strong> +375 (17) 123-45-67</p>
        <p><strong>Email:</strong> info@artmuseum.ru</p>
        <p><strong>Часы работы:</strong> Пн–Вс: 10:00 – 18:00</p>
      </section>
    </div>
  );
}

