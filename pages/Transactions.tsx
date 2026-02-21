import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Icon } from '../components/ui/Icons';
import { Transaction, Category } from '../types';

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

    // Сброс состояния при клике в другом месте (можно расширить через контекст, но пока локально)
    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
                setOffsetX(0);
            }
        };
        document.addEventListener('touchstart', handleClickOutside);
        return () => document.removeEventListener('touchstart', handleClickOutside);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        isDragging.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // Разрешаем тянуть только влево (отрицательный diff)
        if (diff < 0) {
            // Ограничиваем сдвиг до -140px (ширина кнопок) с небольшим "резиновым" эффектом
            if (diff > -160) {
                setOffsetX(diff);
            }
        } else if (offsetX < 0) {
            // Если уже открыто, позволяем закрывать свайпом вправо
             setOffsetX(Math.min(0, offsetX + diff));
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
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
                    onClick={() => { setOffsetX(0); onEdit(t.id); }}
                    className="w-12 h-12 rounded-full bg-[#0A84FF] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                    <Icon name="file-text" size={20} />
                </button>
                <button 
                    onClick={() => { setOffsetX(0); onDelete(t.id); }}
                    className="w-12 h-12 rounded-full bg-[#FF453A] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                    <Icon name="trash" size={20} />
                </button>
            </div>

            {/* Foreground Content */}
            <div 
                className="relative z-10 bg-[#1C1C1E] rounded-[24px] overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
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
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            categories.find(c => c.id === t.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

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
  }, [transactions, filterType, searchTerm]);

  const handleDelete = (id: string) => {
    if(window.confirm('Удалить операцию?')) {
        deleteTransaction(id);
    }
  };

  const handleEdit = (id: string) => {
      // Placeholder: В реальном проекте здесь открытие модалки с данными
      alert(`Редактирование: ${id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-full">
      {/* Header - Integrated into flow (not sticky) */}
      <div className="flex justify-between items-center py-4 px-1">
        {/* Styled Title as requested (matching date headers) */}
        <h1 className="text-[13px] text-secondary/50 font-semibold uppercase tracking-widest pl-1">
            История
        </h1>
        
        <div className="flex gap-3 relative">
            <div className={`relative transition-all duration-300 ${searchTerm ? 'w-48' : 'w-10'}`}>
                 <input 
                    type="text" 
                    placeholder="Поиск" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`
                        bg-[#1C1C1E] rounded-full h-10 text-sm focus:outline-none transition-all duration-300 text-white placeholder-secondary/30
                        ${searchTerm ? 'w-full pl-10 pr-4' : 'w-10 pl-10 cursor-pointer bg-transparent'}
                    `}
                    // Hack to make it expandable on focus if needed, or just relying on state
                 />
                 {/* Search Icon / Circle */}
                 <div className={`absolute left-0 top-0 w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center pointer-events-none transition-colors ${searchTerm ? 'text-white' : 'text-secondary/60'}`}>
                    <Icon name="search" size={18} />
                 </div>
            </div>

            {/* Filter Button */}
            <div className="relative">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${showFilters ? 'bg-white text-black' : 'bg-[#1C1C1E] text-secondary/60 hover:text-white'}`}
                >
                    <Icon name="filter" size={18}/>
                </button>

                {/* Oil-like Filter Menu */}
                <div 
                    className={`
                        absolute right-0 top-12 min-w-[160px] bg-[#1C1C1E] rounded-[20px] p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 origin-top-right z-50
                        transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)
                        ${showFilters ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-4 pointer-events-none'}
                    `}
                >
                    <div className="space-y-1">
                        {(['all', 'expense', 'income'] as const).map(ft => (
                            <button
                                key={ft}
                                onClick={() => { setFilterType(ft); setShowFilters(false); }}
                                className={`w-full text-left px-4 py-3 rounded-[14px] text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-between ${filterType === ft ? 'bg-white text-black' : 'text-secondary/60 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span>{ft === 'all' ? 'Все' : ft === 'expense' ? 'Расходы' : 'Доходы'}</span>
                                {filterType === ft && <Icon name="check" size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* List - Separate Blocks with Swipe */}
      <div className="space-y-8">
        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            <h3 className="text-[13px] text-secondary/50 font-semibold uppercase tracking-widest mb-3 ml-2 py-2">{date}</h3>
            
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