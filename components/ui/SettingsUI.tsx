import React from 'react';
import { Icon } from './Icons';

// Special container for the profile section - iOS Settings Style with 24px radius
// Updated background to lighter gray (#1C1C1E)
export const ProfileBlock: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }> = ({ children, className = '', onClick, style }) => (
    <div 
        onClick={onClick}
        style={style}
        className={`relative rounded-[24px] bg-[#1C1C1E] overflow-hidden ${className} ${onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}`}
    >
        {children}
    </div>
);

// Updated MenuRow: Larger container (34px), Larger icon (scale 0.59), Taller row (56px), Radius 10px
export const MenuRow: React.FC<{ 
    icon: React.ReactNode | string; 
    label: string; 
    subLabel?: string; 
    onClick?: () => void; 
    isLast?: boolean; 
    destructive?: boolean;
    color?: string; // New prop for icon color
    to?: string; // For compatibility if passed, though we mostly use onClick
}> = ({ icon, label, subLabel, onClick, isLast, destructive, color = '#FFFFFF' }) => {
    
    const handleClick = () => {
        onClick?.();
    };

    // Helper to render icon whether it's a string name or ReactNode
    const renderIcon = () => {
        if (typeof icon === 'string') {
            return <Icon name={icon} size={24} />; // Size 24 is handled by scaling parent
        }
        return icon;
    };

    return (
        <button 
            onClick={handleClick}
            className={`w-full flex items-center justify-between py-3 pr-4 pl-4 active:bg-[#2C2C2E] transition-colors group relative h-[56px]`}
        >
            <div className="flex items-center gap-3.5">
                {/* Lighter Black Square Icon Container with Glass Glare - Updated to #171717 */}
                <div 
                    className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 relative overflow-hidden bg-[#171717]"
                >
                    {/* Top-Left Glare */}
                    <div 
                        className="absolute inset-0 rounded-[10px] pointer-events-none z-10"
                        style={{
                            boxShadow: 'inset 1px 1px 0 0 rgba(255,255,255,0.2)',
                            maskImage: 'linear-gradient(135deg, black 0%, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 60%)'
                        }}
                    ></div>
                    
                    {/* Bottom-Right Glare */}
                    <div 
                        className="absolute inset-0 rounded-[10px] pointer-events-none z-10"
                        style={{
                            boxShadow: 'inset -1px -1px 0 0 rgba(255,255,255,0.2)',
                            maskImage: 'linear-gradient(315deg, black 0%, transparent 60%)',
                            WebkitMaskImage: 'linear-gradient(315deg, black 0%, transparent 60%)'
                        }}
                    ></div>

                    {/* Icon: Increased scale to 0.59 */}
                    <div 
                        className={`scale-[0.59] flex justify-center transition-colors relative z-20 ${destructive ? 'text-[#FF3B30]' : ''}`}
                        style={{ color: destructive ? undefined : color }}
                    >
                        {renderIcon()}
                    </div>
                </div>
                <span className={`text-[17px] font-medium leading-snug ${destructive ? 'text-[#FF3B30]' : 'text-white'}`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {subLabel && <span className="text-[17px] text-neutral-500">{subLabel}</span>}
                <div className="text-neutral-500/50 group-active:text-neutral-500">
                    <Icon name="chevron-right" size={20} />
                </div>
            </div>
            {!isLast && (
                // Separator adjusted for larger icon gap
                <div className="absolute bottom-0 left-[62px] right-4 h-[0.5px] bg-[#2C2C2E]"></div>
            )}
        </button>
    );
};

// New button component matching the StartScreen style
export const ProfileActionButton: React.FC<{
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    color: string;
}> = ({ onClick, label, icon, color }) => {
    
    const handleClick = () => {
        onClick();
    };

    const glassButtonStyle = {
        backgroundColor: `${color}33`,
        boxShadow: `0 20px 40px -10px ${color}33`,
    };

    return (
        <div
            onClick={handleClick}
            className={`relative rounded-[24px] p-3.5 transition-transform duration-200 overflow-hidden cursor-pointer active:scale-[0.98] backdrop-blur-[40px]`}
            style={glassButtonStyle}
        >
            {/* Top-Left Glare */}
            <div
                className="absolute inset-0 rounded-[24px] pointer-events-none z-0"
                style={{
                    boxShadow: 'inset 1px 1px 0 0 rgba(255,255,255,0.4)',
                    maskImage: 'linear-gradient(135deg, black 0%, transparent 75%)',
                    WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 75%)'
                }}
            ></div>
            {/* Bottom-Right Glare */}
            <div
                className="absolute inset-0 rounded-[24px] pointer-events-none z-0"
                style={{
                    boxShadow: 'inset -1px -1px 0 0 rgba(255,255,255,0.4)',
                    maskImage: 'linear-gradient(315deg, black 0%, transparent 75%)',
                    WebkitMaskImage: 'linear-gradient(315deg, black 0%, transparent 75%)'
                }}
            ></div>
            <div className="flex items-center gap-3 relative z-10 justify-center h-[36px]">
                {icon && <div className="text-white">{icon}</div>}
                <h3 className="text-[17px] font-bold text-white">{label}</h3>
            </div>
        </div>
    );
};
