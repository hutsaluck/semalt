import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, LockKeyhole } from 'lucide-react';
import { useFavorites } from '../hooks/favorites-context';
import { ServiceGrid } from '../components/ServiceGrid';

export function SavedPage() {
  const { items } = useFavorites();
  return <>
    <section className="page-intro"><div className="eyebrow"><Bookmark size={14} aria-hidden="true" />ВАША КОЛЕКЦІЯ</div><h1>Інструменти, <span>які варто зберегти</span></h1><p>Усі цікаві знахідки в одному місці. Повертайтеся до них, коли з’явиться нова задача.</p></section>
    <div className="saved-note"><LockKeyhole size={19} aria-hidden="true" /><p>Добірка зберігається лише в цьому браузері. Без акаунта та синхронізації — просто ваш власний список.</p></div>
    {items.length ? <section className="saved-results" aria-label="Збережені сервіси"><div className="results-heading"><h2>Збережено <span>{items.length}</span> сервісів</h2><Link to="/" className="text-link">До каталогу<ArrowRight size={15} aria-hidden="true" /></Link></div><ServiceGrid services={items} /></section> : <div className="empty-state saved-empty"><span className="state-icon"><Bookmark size={30} aria-hidden="true" /></span><h2>Ви ще не зберегли жодного сервісу</h2><p>Натисніть на закладку біля інструмента в каталозі.<br />Він з’явиться тут і залишиться після перезавантаження за доступного сховища.</p><Link className="button button-primary" to="/">Відкрити каталог<ArrowRight size={17} aria-hidden="true" /></Link></div>}
  </>;
}
