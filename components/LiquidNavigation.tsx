import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './ui/Icons';

interface LiquidNavigationProps {
    onOpenAdd: () => void;
}

export const LiquidNavigation: React.FC<LiquidNavigationProps> = ({ onOpenAdd }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    
    // Drag State
    const navRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const [offsetY, setOffsetY] = useState(0);

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
        navigate(path);
    };

    // --- DRAG HANDLERS ---
    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        isDragging.current = true;
        
        if (navRef.current) {
            navRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - startY.current;

        // Allow pulling UP (negative delta)
        if (deltaY < 0) {
            // Add resistance
            const resistance = 0.4;
            setOffsetY(deltaY * resistance);
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        
        // Threshold to trigger modal (High effort: > 120px visual, which is ~300px actual drag with resistance)
        if (offsetY < -80) {
            triggerHaptic();
            onOpenAdd();
        }

        // Reset
        setOffsetY(0);
        if (navRef.current) {
            navRef.current.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
        }
    };

    const NavItem = ({ path, icon, label }: { path: string, icon: string, label: string }) => {
        const isActive = currentPath === path;

        return (
            <button
                onClick={() => handleNavigate(path)}
                className="flex-1 flex flex-col items-center justify-center h-full relative group pt-2 pb-1"
                style={{ WebkitTapHighlightColor: 'transparent' }}
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
            {/* The Panel Container */}
            <div
                ref={navRef}
                className="w-full pointer-events-auto relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.85)', // Slightly more opaque for drag feel
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.1)',
                    borderBottom: 'none',
                    borderTopLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', 
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    height: 'calc(84px + env(safe-area-inset-bottom))',
                    transform: `translateY(${offsetY}px)`,
                    willChange: 'transform'
                }}
            >
                {/* iOS Handle Bar */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />

                <div className="flex items-center justify-around h-[84px] px-2 pt-2">
                    <NavItem path="/" icon="dashboard" label="Главная" />
                    <NavItem path="/transactions" icon="list" label="История" />
                    <NavItem path="/analytics" icon="chart" label="Отчеты" />
                    <NavItem path="/settings" icon="settings" label="Меню" />
                </div>
            </div>
        </div>
    );
};