import React, { useState, useRef, useEffect } from 'react';
import { useModal } from './ModalProvider';
import { Icon } from './ui/Icons';
import { Category } from '../types';

export interface FilterOptions {
    type: 'all' | 'income' | 'expense';
    sortBy: 'date_desc' | 'date_asc';
    categoryId: string | null; // null for all
}

interface FilterModalProps {
    categories: Category[];
    currentFilters: FilterOptions;
    onApply: (filters: FilterOptions) => void;
}

export const FilterTransactionModal: React.FC<FilterModalProps> = ({ categories, currentFilters, onApply }) => {
    const { hideModal } = useModal();
    const [filters, setFilters] = useState<FilterOptions>(currentFilters);
    const [activeTypeIndex, setActiveTypeIndex] = useState(0);
    const typeRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    const typeOptions = [
        { id: 'all', label: 'Все' },
        { id: 'expense', label: 'Расход' },
        { id: 'income', label: 'Доход' },
    ];

    useEffect(() => {
        const index = typeOptions.findIndex(opt => opt.id === filters.type);
        setActiveTypeIndex(index !== -1 ? index : 0);
    }, [filters.type]);

    useEffect(() => {
        if (typeRef.current) {
            const buttons = typeRef.current.querySelectorAll('button');
            const activeButton = buttons[activeTypeIndex];
            if (activeButton) {
                setIndicatorStyle({
                    width: activeButton.offsetWidth,
                    transform: `translateX(${activeButton.offsetLeft}px)`,
                });
            }
        }
    }, [activeTypeIndex]);

    const handleApply = () => {
        onApply(filters);
        hideModal();
    };

    const handleReset = () => {
        setFilters({ type: 'all', sortBy: 'date_desc', categoryId: null });
    };

    return (
        <div className="px-4 pt-2 pb-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={handleReset} className="text-[15px] text-secondary/60 font-medium active:text-white transition-colors">Сбросить</button>
                <h2 className="text-[17px] font-bold text-white">Фильтры</h2>
                <div className="w-[70px]"></div> {/* Spacer for alignment since 'Done' is removed */}
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-20">
                {/* Sort */}
                <div className="space-y-3">
                    <h3 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest ml-1">Сортировка</h3>
                    <div className="bg-[#1C1C1E] rounded-[24px] overflow-hidden">
                        {[
                            { id: 'date_desc', label: 'Сначала новые', icon: 'calendar' },
                            { id: 'date_asc', label: 'Сначала старые', icon: 'calendar' },
                        ].map((item, i, arr) => (
                            <button
                                key={item.id}
                                onClick={() => setFilters({ ...filters, sortBy: item.id as any })}
                                className={`w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon name={item.icon} size={18} className="text-secondary" />
                                    <span className="text-[15px] text-white">{item.label}</span>
                                </div>
                                {filters.sortBy === item.id && <Icon name="check" size={18} className="text-[#0A84FF]" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type - Liquid Glass Switcher */}
                <div className="space-y-3">
                    <h3 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest ml-1">Тип операции</h3>
                    <div className="bg-[#1C1C1E] p-1 rounded-[24px] relative" ref={typeRef}>
                        {/* Liquid Indicator */}
                        <div 
                            className="absolute top-1 bottom-1 bg-[#636366] rounded-[20px] shadow-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            style={indicatorStyle}
                        />
                        
                        <div className="flex relative z-10">
                            {typeOptions.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilters({ ...filters, type: item.id as any })}
                                    className={`flex-1 py-3 rounded-[20px] text-[13px] font-bold transition-colors duration-200 ${filters.type === item.id ? 'text-white' : 'text-secondary/60'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                    <h3 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest ml-1">Категория</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, categoryId: null })}
                            className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all ${filters.categoryId === null ? 'bg-white text-black border-white' : 'bg-[#1C1C1E] text-secondary border-transparent active:bg-white/10'}`}
                        >
                            Все
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilters({ ...filters, categoryId: cat.id })}
                                className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all flex items-center gap-2 ${filters.categoryId === cat.id ? 'bg-white text-black border-white' : 'bg-[#1C1C1E] text-secondary border-transparent active:bg-white/10'}`}
                            >
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Apply Button - Fixed at bottom */}
            <div className="pt-4 mt-auto">
                <button 
                    onClick={handleApply}
                    className="w-full bg-[#0A84FF] text-white py-4 rounded-[24px] font-bold text-[17px] active:scale-[0.98] transition-all hover:bg-[#007AFF] shadow-lg shadow-blue-500/30"
                >
                    Применить
                </button>
            </div>
        </div>
    );
};
