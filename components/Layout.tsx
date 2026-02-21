import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Icon } from './ui/Icons';
import { AddTransactionModal } from './AddTransactionModal';
import { useModal } from './ModalProvider';
import { LiquidNavigation } from './LiquidNavigation';
import { useSwipeBack, SwipeBackShadow } from '../hooks/useSwipeBack';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showModal } = useModal();

  // Scroll Isolation: Reset scroll position when route changes
  React.useEffect(() => {
      const scrollContainer = document.getElementById('main-scroll-container');
      if (scrollContainer) {
          scrollContainer.scrollTo(0, 0);
      }
  }, [location.pathname]);

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

  // --- SWIPE BACK INTEGRATION ---
  // Enable swipe back only if we are NOT on the root dashboard (or customize as needed)
  // For a tab app, usually you don't swipe back between tabs, but if the user requested it:
  // We'll enable it for all pages except maybe the very first one if it's the entry point.
  // But let's just enable it generally. If on Dashboard, maybe it shouldn't swipe back to nothing.
  // Let's assume history stack exists.
  const { dragHandlers, pushedStyle, isDragging, dragProgress } = useSwipeBack({
      onSwipeBack: () => navigate(-1),
      enabled: true // Always enabled as per request "apply this hook for our application"
  });

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
      {/* 
          Applied swipe back handlers to this container.
          Also adjusted padding as requested: 
          - Removed top padding (pt-2) to let content flow naturally? 
            User said "remove headers... content in one container". 
            I will keep pt-2 for status bar spacing if needed, or remove it if user wants full bleed.
            User said "remove extra margins from bottom... identical indentation about half a centimeter".
            0.5cm ~ 20px.
            So padding-bottom should be nav_height + safe_area + 20px.
            Nav height is 84px.
      */}
      <main 
        className="flex-1 w-full md:ml-20 lg:ml-64 h-full relative overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-y-contain bg-black"
        id="main-scroll-container"
        {...dragHandlers}
        style={{
            ...dragHandlers.style,
            ...(isDragging ? pushedStyle : {})
        }}
      >
        {isDragging && <SwipeBackShadow progress={dragProgress} />}
        
        <div className="max-w-[1200px] mx-auto px-4 pt-2 pb-[calc(84px+env(safe-area-inset-bottom)+20px)] md:p-8 md:pb-8 min-h-full">
          {children}
        </div>
      </main>

      {/* --- MOBILE LIQUID NAVIGATION (Bottom) --- */}
      <LiquidNavigation onOpenAdd={handleOpenAdd} />
    </div>
  );
};