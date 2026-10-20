import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartNotice from './components/CartNotice.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import { Events, EventDetail, Tickets } from './pages/Events.jsx';
import Shows from './pages/Shows.jsx';
import SearchPage from './pages/SearchPage.jsx';
import { About, Contact, LegalPage, Music, NotFound, SocialPage } from './pages/Info.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/videos" element={<Shows />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/social-media" element={<SocialPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/music" element={<Music />} />
          <Route path="/privacy-policy" element={<LegalPage slug="privacy-policy" />} />
          <Route path="/terms-and-conditions" element={<LegalPage slug="terms-and-conditions" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartNotice />
    </CartProvider>
  );
}
