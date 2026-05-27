import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import AnnouncementCarousel from '../../components/AnnouncementCarousel';
import Footer from '../../components/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnnouncementCarousel />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
