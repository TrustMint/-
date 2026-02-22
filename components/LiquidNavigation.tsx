import React, { useRef, useState, useEffect } from 'react';
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
        if (currentPath === path) {
             const scrollContainer = document.getElementById('main-scroll-container');
             if (scrollContainer && scrollContainer.scrollTop > 0) {
                 scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                 return;
             }
        }

        triggerHaptic();
        navigate(path, { replace: true });
    };

    const navRef = useRef<HTMLDivElement>(null);
    const scaleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    const tabs = [
        { path: '/', icon: 'dashboard', label: 'Главная' },
        { path: '/transactions', icon: 'list', label: 'История' },
        { path: '/analytics', icon: 'chart', label: 'Отчеты' },
        { path: '/settings', icon: 'settings', label: 'Меню' }
    ];

    useEffect(() => {
        const updatePillPosition = () => {
            if (!navRef.current) return;
            const index = tabs.findIndex(t => t.path === currentPath);
            if (index === -1) {
                setIndicatorStyle({ opacity: 0 });
                return;
            }

            const buttons = navRef.current.querySelectorAll('.nav-tab-btn');
            const activeButton = buttons[index] as HTMLElement;
            
            if (activeButton) {
                // We want the pill to be slightly smaller than the full tab width (e.g. 88px max)
                // But centered within the tab.
                const tabWidth = activeButton.offsetWidth;
                const pillWidth = Math.min(tabWidth * 0.85, 88);
                const offsetWithinTab = (tabWidth - pillWidth) / 2;
                
                if (scaleTimeoutRef.current) clearTimeout(scaleTimeoutRef.current);

                // First, set the new position and scale up
                setIndicatorStyle(prev => ({
                    ...prev,
                    width: pillWidth,
                    transform: `translateX(${activeButton.offsetLeft + offsetWithinTab}px) scale(1.15)`,
                    opacity: 1,
                }));

                // Then, scale back down after the slide animation is mostly complete
                scaleTimeoutRef.current = setTimeout(() => {
                    setIndicatorStyle({
                        width: pillWidth,
                        transform: `translateX(${activeButton.offsetLeft + offsetWithinTab}px) scale(1)`,
                        opacity: 1,
                    });
                }, 150);
            }
        };

        // Small timeout to ensure DOM is fully rendered before calculating widths
        setTimeout(updatePillPosition, 10);
        window.addEventListener('resize', updatePillPosition);
        return () => window.removeEventListener('resize', updatePillPosition);
    }, [currentPath, tabs]);

    const { isPopping, trigger: triggerPop } = useSinglePop();
    const handleAddClick = () => {
        triggerPop();
        triggerHaptic();
        onOpenAdd();
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pb-[calc(env(safe-area-inset-bottom)+8px)]">
            
            {/* Floating Add Button - Positioned above nav */}
            <div className="absolute bottom-[calc(76px+env(safe-area-inset-bottom)+16px)] right-4 pointer-events-auto z-[101]">
                <button
                    onClick={handleAddClick}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 backdrop-blur-xl ${isPopping ? 'animate-pop-150' : 'active:scale-90'}`}
                    style={{
                        background: 'rgba(28, 28, 30, 0.6)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                >
                    <Icon name="plus" size={24} color="#0A84FF" strokeWidth={2.5} />
                </button>
            </div>

            {/* Floating Capsule Container */}
            <div
                ref={navRef}
                className="w-[90%] max-w-[380px] pointer-events-auto relative overflow-hidden"
                style={{
                    height: '76px',
                    borderRadius: '38px',
                    backgroundColor: 'rgba(20, 20, 20, 0.4)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
                }}
            >
                {/* Active Pill Indicator (Matte Glass) */}
                <div 
                    className="absolute top-2 bottom-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{
                        ...indicatorStyle,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                />

                <div className="flex items-center justify-around h-full px-1 relative z-10">
                    {tabs.map((tab) => {
                        const isActive = currentPath === tab.path;
                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigate(tab.path)}
                                className="nav-tab-btn flex-1 flex flex-col items-center justify-center h-full relative group z-10"
                                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                            >
                                {/* Icon Container */}
                                <div 
                                    className={`transition-all duration-300 ease-out flex items-center justify-center ${
                                        isActive ? 'text-[#0A84FF] scale-110' : 'text-white/40'
                                    }`}
                                >
                                    <Icon name={tab.icon} size={22} />
                                </div>
                                
                                {/* Label */}
                                <span 
                                    className={`text-[10px] font-bold tracking-wide transition-colors duration-300 mt-1 ${
                                        isActive ? 'text-[#0A84FF]' : 'text-white/40'
                                    }`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};