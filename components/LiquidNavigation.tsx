import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './ui/Icons';
import { useSinglePop } from '../hooks/usePopAnimation';

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

    const [activeRect, setActiveRect] = React.useState({ left: 0, width: 0 });
    const navRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (navRef.current) {
            const index = ['/', '/transactions', '/analytics', '/settings'].indexOf(currentPath);
            if (index !== -1) {
                const width = navRef.current.offsetWidth / 4;
                setActiveRect({ left: index * width, width });
            }
        }
    }, [currentPath]);

    const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
        const isActive = currentPath === path;

        return (
            <button
                onClick={() => handleNavigate(path)}
                className="flex-1 flex flex-col items-center justify-center h-full relative group z-10"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
                {/* Icon Container */}
                <div 
                    className={`transition-all duration-300 ease-out mb-0.5 ${
                        isActive ? 'text-white scale-110' : 'text-white/40'
                    }`}
                >
                    <Icon name={icon} size={22} />
                </div>
                
                {/* Label */}
                <span 
                    className={`text-[9px] font-bold tracking-wide transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/40'
                    }`}
                >
                    {label}
                </span>
            </button>
        )
    }

    const { isPopping, trigger: triggerPop } = useSinglePop();
    const handleAddClick = () => {
        triggerPop();
        triggerHaptic();
        onOpenAdd();
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pb-[calc(env(safe-area-inset-bottom)+16px)]">
            
            {/* Floating Add Button - Positioned above nav */}
            <div className="absolute bottom-[calc(88px+env(safe-area-inset-bottom)+24px)] right-4 pointer-events-auto z-[101]">
                <button
                    onClick={handleAddClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 backdrop-blur-xl ${isPopping ? 'animate-pop-150' : 'active:scale-90'}`}
                    style={{
                        background: 'rgba(28, 28, 30, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                >
                    <Icon name="plus" size={28} color="#0A84FF" strokeWidth={2.5} />
                </button>
            </div>

            {/* Floating Capsule Container - Restored Glass Style & Increased Size */}
            <div
                ref={navRef}
                className="w-[92%] max-w-[400px] pointer-events-auto relative overflow-hidden"
                style={{
                    height: '96px', // Increased size
                    borderRadius: '48px', // Increased radius
                    backgroundColor: 'rgba(20, 20, 20, 0.4)', // Restored previous glass
                    backdropFilter: 'blur(5px)', // Restored previous blur
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)', // Restored previous border
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', // Restored previous shadow
                }}
            >
                {/* Active Pill Indicator */}
                <div 
                    className="absolute top-1 bottom-1 bg-[#636366] rounded-[44px] shadow-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{
                        left: activeRect.left + 4,
                        width: activeRect.width - 8,
                    }}
                />

                <div className="flex items-center justify-around h-full px-1 relative z-10">
                    <NavItem path="/" icon="dashboard" label="Главная" />
                    <NavItem path="/transactions" icon="list" label="История" />
                    <NavItem path="/analytics" icon="chart" label="Отчеты" />
                    <NavItem path="/settings" icon="settings" label="Меню" />
                </div>
            </div>
        </div>
    );
};