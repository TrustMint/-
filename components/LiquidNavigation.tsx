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
        if (currentPath === path) {
             const scrollContainer = document.getElementById('main-scroll-container');
             if (scrollContainer) {
                 scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
             } else {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             }
             return;
        }
        triggerHaptic();
        navigate(path);
    };

    const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
        const isActive = currentPath === path;

        return (
            <button
                onClick={() => handleNavigate(path)}
                className="flex-1 flex flex-col items-center justify-center h-full relative group pt-2 pb-1"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <div 
                    className={`transition-all duration-300 ease-out mb-1 ${
                        isActive ? 'text-[#0A84FF] -translate-y-0.5' : 'text-white/40 translate-y-0.5'
                    }`}
                >
                    <Icon name={icon} size={24} />
                </div>
                
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

    const glassStyle: React.CSSProperties = {
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
    };

    return (
        <div className="md:hidden">
            {/* Floating Add Button - Pinned to Bottom Right */}
            <div className="fixed bottom-[calc(84px+env(safe-area-inset-bottom)+16px)] right-4 z-[101]">
                <button
                    onClick={() => { triggerHaptic(); onOpenAdd(); }}
                    className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-200 bg-[#0A84FF] text-white shadow-lg shadow-blue-500/40"
                    style={{
                        boxShadow: '0 8px 32px rgba(10, 132, 255, 0.4)', 
                    }}
                >
                    <Icon name="plus" size={28} strokeWidth={3} />
                </button>
            </div>

            {/* Navigation Panel */}
            <div 
                className="fixed left-0 right-0 z-[100] pointer-events-none"
                style={{ bottom: 'env(safe-area-inset-bottom)' }}
            >
                <div
                    className="w-full pointer-events-auto"
                    style={{
                        ...glassStyle,
                        height: '84px',
                        borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px' 
                    }}
                >
                    <div className="flex items-center justify-between h-[84px] px-6">
                        <NavItem path="/" icon="dashboard" label="Главная" />
                        <NavItem path="/transactions" icon="list" label="История" />
                        <NavItem path="/analytics" icon="chart" label="Отчеты" />
                        <NavItem path="/settings" icon="settings" label="Меню" />
                    </div>
                </div>
            </div>
        </div>
    );
};