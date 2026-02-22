import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Icon } from '../components/ui/Icons';
import { Transaction, Category } from '../types';
import { useModal } from '../components/ModalProvider';
import { FilterTransactionModal, FilterOptions } from '../components/FilterTransactionModal';

// --- Компонент строки транзакции с поддержкой свайпа ---
const SwipeableTransactionItem: React.FC<{
    t: Transaction;
    cat: Category | undefined;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}> = ({ t, cat, onDelete, onEdit }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);
    const itemRef = useRef<HTMLDivElement>(null);

    const [isAnimating, setIsAnimating] = useState(false);

    // Сброс состояния при клике в другом месте
    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
                setOffsetX(0);
                setIsAnimating(true); // Enable animation for reset
            }
        };
        document.addEventListener('touchstart', handleClickOutside);
        return () => document.removeEventListener('touchstart', handleClickOutside);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        isDragging.current = true;
        setIsAnimating(false); // Disable animation during drag for instant response
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // Разрешаем тянуть только влево (отрицательный diff)
        if (diff < 0) {
            // Add resistance (0.6 factor)
            const resistedDiff = diff * 0.6;
            
            // Ограничиваем сдвиг
            if (resistedDiff > -160) {
                setOffsetX(resistedDiff);
            }
        } else if (offsetX < 0) {
            // Если уже открыто, позволяем закрывать
             setOffsetX(Math.min(0, offsetX + (diff * 0.6)));
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        setIsAnimating(true); // Re-enable animation for snap
        
        // Порог срабатывания открытия (60px)
        if (offsetX < -60) {
            setOffsetX(-130); // Фиксируем открытое состояние
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            setOffsetX(0); // Закрываем
        }
    };

    return (
        <div className="relative mb-3 group" ref={itemRef}>
            {/* Background Actions (Revealed on Swipe) */}
            <div className="absolute inset-y-0 right-0 flex items-center gap-3 pr-2 z-0">
                <button 
                    onClick={() => { setIsAnimating(true); setOffsetX(0); onEdit(t.id); }}
                    className="w-12 h-12 rounded-full bg-[#0A84FF] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                    <Icon name="file-text" size={20} />
                </button>
                <button 
                    onClick={() => { setIsAnimating(true); setOffsetX(0); onDelete(t.id); }}
                    className="w-12 h-12 rounded-full bg-[#FF453A] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                    <Icon name="trash" size={20} />
                </button>
            </div>

            {/* Foreground Content */}
            <div 
                className={`relative z-10 bg-[#1C1C1E] rounded-[24px] overflow-hidden touch-pan-y ${isAnimating ? 'transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]' : ''}`}
                style={{ transform: `translateX(${offsetX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-center justify-between p-4 active:bg-[#2C2C2E] transition-colors">
                    {/* Left: Icon & Text */}
                    <div className="flex items-center gap-4">
                        {/* Icon Container */}
                        <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0 relative overflow-hidden bg-[#171717] border border-white/5">
                             {/* Inner Glare */}
                            <div className="absolute inset-0 rounded-[14px] pointer-events-none z-10 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.08)]"></div>
                            <Icon name={cat?.icon || 'dollar'} size={20} color={cat?.color} />
                        </div>
                        
                        <div>
                            <p className="font-semibold text-[15px] text-secondary leading-snug">{(t as any).title || cat?.name}</p>
                            {t.description && (
                                <p className="text-[13px] text-secondary/50 font-medium truncate max-w-[140px]">
                                    {t.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Amount */}
                    <div className={`font-bold text-[16px] tracking-tight ${t.type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                        {t.type === 'income' ? '+' : '−'}{t.amount.toLocaleString('ru-RU')} ₽
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Transactions: React.FC = () => {
  const { transactions, categories, deleteTransaction } = useStore();
  const { showModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState<FilterOptions>({
      type: 'all',
      sortBy: 'date_desc',
      categoryId: null
  });

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // 1. Filter by Type
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // 2. Filter by Category
    if (filters.categoryId) {
        filtered = filtered.filter(t => t.category_id === filters.categoryId);
    }
    
    // 3. Search
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            categories.find(c => c.id === t.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // 4. Sort
    filtered.sort((a, b) => {
        if (filters.sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (filters.sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (filters.sortBy === 'amount_desc') return b.amount - a.amount;
        if (filters.sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
    });

    const groups: Record<string, Transaction[]> = {};
    const today = new Date().toLocaleDateString('ru-RU');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('ru-RU');

    filtered.forEach(t => {
      const txDate = new Date(t.date).toLocaleDateString('ru-RU');
      let dateKey = new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      
      if (txDate === today) dateKey = 'Сегодня';
      else if (txDate === yesterday) dateKey = 'Вчера';
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [transactions, filters, searchTerm, categories]);

  const handleDelete = (id: string) => {
    if(window.confirm('Удалить операцию?')) {
        deleteTransaction(id);
    }
  };

  const handleEdit = (id: string) => {
      // Placeholder: В реальном проекте здесь открытие модалки с данными
      alert(`Редактирование: ${id}`);
  };

  const openFilters = () => {
      showModal(
          <FilterTransactionModal 
              categories={categories} 
              currentFilters={filters} 
              onApply={setFilters} 
          />
      );
  };

  const activeFiltersCount = (filters.type !== 'all' ? 1 : 0) + (filters.categoryId ? 1 : 0) + (filters.sortBy !== 'date_desc' ? 1 : 0);

  return (
    <div className="space-y-6 relative min-h-full">
      {/* Header - Integrated into flow (not sticky) */}
      <div className="flex items-center gap-3 py-2 px-1">
        {/* Search Bar - Full Width */}
        <div className="relative flex-1 transition-all duration-300">
             <input 
                type="text" 
                placeholder="Поиск по истории" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1C1C1E] rounded-[14px] h-10 pl-10 pr-4 text-sm focus:outline-none text-white placeholder-secondary/30 transition-all focus:bg-[#2C2C2E]"
             />
             {/* Search Icon */}
             <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center pointer-events-none text-secondary/60">
                <Icon name="search" size={18} />
             </div>
        </div>

        {/* Filter Button */}
        <button 
            onClick={openFilters}
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300 active:scale-95 ${activeFiltersCount > 0 ? 'bg-white text-black' : 'bg-[#1C1C1E] text-secondary/60 hover:text-white'}`}
        >
            <Icon name="filter" size={18}/>
            {activeFiltersCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0A84FF] rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{activeFiltersCount}</span>
                </div>
            )}
        </button>
      </div>

      {/* List - Separate Blocks with Swipe */}
      <div className="space-y-4">
        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            <h3 className="text-[13px] text-secondary/50 font-semibold uppercase tracking-widest mb-1.5 ml-2 py-2">{date}</h3>
            
            <div className="space-y-3">
              {txs.map((t) => {
                const cat = categories.find(c => c.id === t.category_id) || categories[0];
                
                return (
                    <SwipeableTransactionItem 
                        key={t.id} 
                        t={t} 
                        cat={cat} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(groupedTransactions).length === 0 && (
            <div className="text-center py-20 opacity-50">
                <Icon name="search" size={48} className="mx-auto mb-4 text-secondary/20"/>
                <p className="text-secondary font-medium">Ничего не найдено</p>
            </div>
        )}
      </div>
    </div>
  );
};
