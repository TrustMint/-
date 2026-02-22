import React, { useState } from 'react';
import { useModal } from './ModalProvider';
import { Icon } from './ui/Icons';
import { Category } from '../types';

export interface FilterOptions {
    type: 'all' | 'income' | 'expense';
    sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
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

    const handleApply = () => {
        onApply(filters);
        hideModal();
    };

    const handleReset = () => {
        setFilters({ type: 'all', sortBy: 'date_desc', categoryId: null });
    };

    return (
        <div className="px-4 pt-2 pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={handleReset} className="text-[15px] text-secondary/60 font-medium active:text-white transition-colors">Сбросить</button>
                <h2 className="text-[17px] font-bold text-white">Фильтры</h2>
                <button onClick={handleApply} className="text-[15px] text-[#0A84FF] font-bold active:opacity-70 transition-opacity">Готово</button>
            </div>

            <div className="space-y-6">
                {/* Sort */}
                <div className="space-y-3">
                    <h3 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest ml-1">Сортировка</h3>
                    <div className="bg-[#1C1C1E] rounded-[14px] overflow-hidden">
                        {[
                            { id: 'date_desc', label: 'Сначала новые', icon: 'calendar' },
                            { id: 'date_asc', label: 'Сначала старые', icon: 'calendar' },
                            { id: 'amount_desc', label: 'По убыванию суммы', icon: 'trending-down' },
                            { id: 'amount_asc', label: 'По возрастанию суммы', icon: 'trending-up' },
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

                {/* Type */}
                <div className="space-y-3">
                    <h3 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest ml-1">Тип операции</h3>
                    <div className="bg-[#1C1C1E] p-1 rounded-[14px] flex">
                        {[
                            { id: 'all', label: 'Все' },
                            { id: 'expense', label: 'Расход' },
                            { id: 'income', label: 'Доход' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setFilters({ ...filters, type: item.id as any })}
                                className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition-all ${filters.type === item.id ? 'bg-[#636366] text-white shadow-md' : 'text-secondary/60'}`}
                            >
                                {item.label}
                            </button>
                        ))}
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
        </div>
    );
};
