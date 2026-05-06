import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import CartDrawer from '../components/common/CartDrawer';
import ChatWidget from '../components/chat/ChatWidget';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Sticky top navbar */}
      <Navbar />

      {/* Page content — grows to fill remaining space */}
      {/* pb-[72px] on mobile to prevent content hiding behind bottom nav */}
      <main className="flex-1 pb-[72px] md:pb-0">
        <Outlet />
      </main>

      {/* Footer — hidden on mobile or shown above bottom nav */}
      <Footer />

      {/* Cart drawer (global, controlled by cartStore) */}
      <CartDrawer />

      {/* AI Chatbot Widget */}
      <ChatWidget />

      {/* Mobile bottom navigation bar */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
