import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Icon } from './ui/Icons';
import { AddTransactionModal } from './AddTransactionModal';
import { useModal } from './ModalProvider';
import { LiquidNavigation } from './LiquidNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { showModal } = useModal();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => (
    <Link 
      to={path} 
      className={`
        group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 md:flex-row
        ${isActive(path) 
          ? 'text-[#0A84FF] bg-[#0A84FF]/10 shadow-[0_0_15px_rgba(10,132,255,0.2)]' 
          : 'text-secondary/60 hover:text-white hover:bg-white/5'}
      `}
    >
      <Icon name={icon} size={24} className={isActive(path) ? 'fill-current' : ''} />
      <span className="text-[15px] font-medium hidden md:block">{label}</span>
    </Link>
  );

  const handleOpenAdd = () => {
    showModal(<AddTransactionModal />);
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col md:flex-row overflow-hidden relative selection:bg-[#0A84FF]/30">
      
      {/* --- DESKTOP/TABLET SIDEBAR (Left) --- */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 fixed h-full left-0 top-0 bg-[#1C1C1E]/40 backdrop-blur-2xl border-r border-white/5 z-40 pt-8 px-4 transition-all duration-300">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0A84FF] to-[#5E5CE6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Icon name="dollar" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden lg:block">FinTrack</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem path="/" icon="dashboard" label="Главная" />
          <NavItem path="/transactions" icon="list" label="Транзакции" />
          <NavItem path="/analytics" icon="chart" label="Аналитика" />
          <NavItem path="/categories" icon="tag" label="Категории" />
          <NavItem path="/settings" icon="settings" label="Настройки" />
        </nav>

        <button
          onClick={handleOpenAdd}
          className="mb-8 w-full bg-[#0A84FF] hover:bg-[#007AFF] text-white p-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Icon name="plus" size={24} />
          <span className="font-semibold hidden lg:block">Новая операция</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT (SCROLLABLE AREA) --- */}
      {/* Reduced top padding (pt-2 instead of p-4 top) to reduce gap */}
      <main 
        className="flex-1 w-full md:ml-20 lg:ml-64 h-full relative overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-y-contain"
        id="main-scroll-container"
      >
        <div className="max-w-[1200px] mx-auto px-4 pt-2 pb-32 md:p-8 md:pb-8 min-h-full">
          {children}
        </div>
      </main>

      {/* --- MOBILE LIQUID NAVIGATION (Bottom) --- */}
      <LiquidNavigation onOpenAdd={handleOpenAdd} />
    </div>
  );
};