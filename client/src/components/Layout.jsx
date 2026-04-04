import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-mono-950 overflow-x-hidden">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
