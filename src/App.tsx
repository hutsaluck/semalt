import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FavoritesProvider } from './components/FavoritesProvider';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { CatalogPage } from './pages/CatalogPage';
import { SavedPage } from './pages/SavedPage';

export default function App() {
  return <HashRouter><FavoritesProvider><Routes><Route element={<Layout />}><Route index element={<CatalogPage />} /><Route path="saved" element={<SavedPage />} /><Route path="about" element={<AboutPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></FavoritesProvider></HashRouter>;
}
