import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './ui/Icons';

interface LiquidNavigationProps {
    onOpenAdd: () => void;
}

export const LiquidNavigation: React.FC<LiquidNavigationProps> = ({ onOpenAdd }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const triggerHaptic = () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
            }
        } catch (e) {}
    };

    const handleNavigate = (path: string) => {
        // Если мы уже на этой вкладке, скроллим вверх
        if (currentPath === path) {
             const scrollContainer = document.getElementById('main-scroll-container');
             if (scrollContainer && scrollContainer.scrollTop > 0) {
                 scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                 return;
             }
        }

        triggerHaptic();
        // Use replace: true to prevent history stack buildup for main tabs
        navigate(path, { replace: true });
    };

    const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
        const isActive = currentPath === path;

        return (
            <button
                onClick={() => handleNavigate(path)}
                className="flex-1 flex flex-col items-center justify-center h-full relative group pt-2 pb-1"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
                {/* Icon Container */}
                <div 
                    className={`transition-all duration-300 ease-out mb-1 ${
                        isActive ? 'text-[#0A84FF] -translate-y-0.5' : 'text-white/40 translate-y-0.5'
                    }`}
                >
                    <Icon name={icon} size={24} />
                </div>
                
                {/* Label - Always Visible */}
                <span 
                    className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${
                        isActive ? 'text-[#0A84FF]' : 'text-white/40'
                    }`}
                >
                    {label}
                </span>
            </button>
        )
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
            
            {/* Floating Add Button - Positioned above nav */}
            <div className="absolute bottom-[calc(84px+env(safe-area-inset-bottom)+16px)] right-4 pointer-events-auto z-[101]">
                <button
                    onClick={() => { triggerHaptic(); onOpenAdd(); }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] active:scale-90 transition-transform duration-300 backdrop-blur-xl"
                    style={{
                        background: 'rgba(20, 20, 20, 0.4)', // Matching nav panel glass
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        border: 'none', // No border as requested
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                >
                    <Icon name="plus" size={28} color="#0A84FF" strokeWidth={2.5} />
                </button>
            </div>

            {/* The Panel Container - MATCHING REQUESTED STYLE EXACTLY */}
            <div
                className="w-full pointer-events-auto"
                style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.4)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    borderBottom: 'none', // Remove bottom border since it touches the edge
                    borderTopLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', 
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    height: 'calc(84px + env(safe-area-inset-bottom))'
                }}
            >
                <div className="flex items-center justify-around h-[84px] px-6">
                    <NavItem path="/" icon="dashboard" label="Главная" />
                    <NavItem path="/transactions" icon="list" label="История" />
                    <NavItem path="/analytics" icon="chart" label="Отчеты" />
                    <NavItem path="/settings" icon="settings" label="Меню" />
                </div>
            </div>
        </div>
    );
};