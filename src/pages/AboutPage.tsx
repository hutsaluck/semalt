import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Database, Info, Radar, Search, Users } from 'lucide-react';

export function AboutPage() {
  return <>
    <section className="page-intro about-intro"><div className="eyebrow"><Radar size={15} aria-hidden="true" />ПРО ПРОЄКТ</div><h1>Трохи ясності <span>у світі AI</span></h1><p>AI Radar допомагає знайти сервіс під конкретну задачу та зберегти власну добірку без реєстрації.</p></section>
    <div className="about-grid">
      <section className="about-card"><span className="about-icon"><Users size={23} aria-hidden="true" /></span><h2>Для тих, хто створює</h2><p>Розробників, дизайнерів, авторів контенту й усіх, хто хоче автоматизувати щоденну роботу. Шукайте інструменти для коду, зображень, відео та інших задач.</p></section>
      <section className="about-card"><span className="about-icon"><Search size={23} aria-hidden="true" /></span><h2>Від задачі до інструмента</h2><ol><li>Введіть задачу або виберіть категорію.</li><li>Уточніть результати фільтром DR і сортуванням.</li><li>Прочитайте деталі, збережіть сервіс або відкрийте його сайт.</li></ol></section>
      <section className="about-card"><span className="about-icon"><Database size={23} aria-hidden="true" /></span><h2>Дані з FreeSerp</h2><p>Каталог отримує профілі головних сторінок через публічний API FreeSerp, у ніші AI-продуктів. Пошук, фільтри та пагінацію виконує джерело даних.</p><a className="text-link" href="https://freeserp.ai/docs.php" target="_blank" rel="noopener noreferrer">Документація джерела<ArrowRight size={15} aria-hidden="true" /></a></section>
      <section className="about-card"><span className="about-icon"><Bookmark size={23} aria-hidden="true" /></span><h2>Ваша локальна добірка</h2><p>Обране зберігається в localStorage цього браузера, без акаунта й синхронізації. Очищення даних браузера видалить добірку. За недоступного сховища зміни можуть не пережити перезавантаження.</p></section>
    </div>
    <section className="about-method"><div><Info size={22} aria-hidden="true" /><h2>Що означають дані в картках</h2></div><dl><dt>Domain Rating (DR)</dt><dd>Показник авторитетності домену від 0 до 100 за даними FreeSerp. Це не користувацький рейтинг і не оцінка якості сервісу. Якщо джерело не має DR, ми показуємо «Немає даних».</dd><dt>Виявлено онлайн</dt><dd>Дата, коли FreeSerp уперше підтвердив доступність сайту. Вона може відрізнятися від офіційної дати запуску продукту.</dd><dt>Описи та категорії</dt><dd>Інформація надана FreeSerp і може бути неповною або неточною. Належність до AI-ніші не гарантує певних можливостей. Перевіряйте функції й умови на сайті продукту.</dd></dl></section>
    <div className="about-bottom"><p>AI Radar — тестовий проєкт для Semalt. Проєкт не заявляє офіційного партнерства з FreeSerp чи представленими сервісами.</p><Link to="/" className="button button-primary">Перейти до каталогу<ArrowRight size={17} aria-hidden="true" /></Link></div>
  </>;
}
