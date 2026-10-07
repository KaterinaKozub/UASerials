import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Favorites from './pages/Favorites';
import SeriesDetails from './pages/SeriesDetails';
import Auth from './pages/Auth';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <>
      <div className="bg-anim" aria-hidden="true" />
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/series/:id" element={<SeriesDetails />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer muted">UASerials · дані: FreeSerp API (index=sites) · API key не потрібен</footer>
    </>
  );
}
