import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bookmark, CircleAlert } from 'lucide-react';
import { useFavorites } from '../hooks/favorites-context';
import { Brand } from './Brand';

export function Layout() {
  const { items, warning } = useFavorites();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (pathname !== previousPath.current) {
      mainRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousPath.current = pathname;
    }
    document.title = `${pathname === '/saved' ? 'Обране' : pathname === '/about' ? 'Про проєкт' : 'Каталог AI-інструментів'} — AI Radar`;
  }, [pathname]);

  return <>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); }}>Перейти до вмісту</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand-link" aria-label="AI Radar — каталог"><Brand /></Link>
        <nav aria-label="Основна навігація">
          <NavLink to="/" end>Каталог</NavLink>
          <NavLink to="/saved"><Bookmark size={16} aria-hidden="true" />Обране<span className="nav-count" aria-label={`${items.length} збережених сервісів`}>{items.length}</span></NavLink>
          <NavLink to="/about">Про проєкт</NavLink>
        </nav>
        <span className="header-note">Ваш навігатор у світі AI</span>
      </div>
    </header>
    <main id="main-content" className="container main-content" tabIndex={-1} ref={mainRef}>
      {warning && <div className="storage-warning" role="status"><CircleAlert size={19} aria-hidden="true" /><span>{warning}</span></div>}
      <Outlet />
    </main>
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><Brand compact /><p>Знайдіть інструмент. Збережіть ідею. Почніть створювати.</p></div>
        <div className="footer-links"><a href="https://freeserp.ai/docs.php" target="_blank" rel="noopener noreferrer">Дані FreeSerp <ArrowUpRight size={14} aria-hidden="true" /></a><span>Тестовий проєкт для Semalt</span></div>
      </div>
    </footer>
  </>;
}
