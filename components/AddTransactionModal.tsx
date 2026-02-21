import React, { useState } from 'react';
import { useStore } from '../store';
import { Icon } from './ui/Icons';
import { TransactionType } from '../types';
import { useModal } from './ModalProvider';

export const AddTransactionModal: React.FC = () => {
  const { categories, addTransaction } = useStore();
  const { hideModal } = useModal();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setSaving(true);
    
    // Construct date with current time if it's today, otherwise use the selected date at noon to avoid timezone shifts
    const selectedDate = new Date(date);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    let finalDate = selectedDate;
    if (isToday) {
        finalDate = now;
    } else {
        // Set to current time but on the selected date to preserve relative ordering if multiple added for past date?
        // Or just set to noon. The prompt asks for "sort by time of addition".
        // If I add for yesterday, it should be "newer" than one added for yesterday 5 mins ago?
        // Actually, usually "time of addition" implies the created_at timestamp.
        // But we are sorting by `date` field in store.tsx.
        // Let's just use the current time component for the selected date to ensure stable sort order for "just added" items.
        finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    await addTransaction({
      amount: parseFloat(amount),
      currency: 'RUB',
      category_id: categoryId,
      date: finalDate.toISOString(),
      type,
      title,
      description
    });
    setSaving(false);
    hideModal();
  };

  return (
    <div className="px-5 pt-1">
        <h2 className="text-lg font-bold tracking-tight mb-4 text-center text-white/90">Новая операция</h2>

        {/* Type Switcher - Compact Liquid */}
        <div className="flex bg-black/20 p-1 rounded-[16px] mb-5 backdrop-blur-md">
          <button 
            className={`flex-1 py-2 rounded-[12px] text-[13px] font-bold transition-all duration-300 ${type === 'expense' ? 'bg-[#FF453A] text-white scale-[1.02]' : 'text-secondary/60 hover:text-white'}`}
            onClick={() => setType('expense')}
          >
            Расход
          </button>
          <button 
            className={`flex-1 py-2 rounded-[12px] text-[13px] font-bold transition-all duration-300 ${type === 'income' ? 'bg-[#30D158] text-white scale-[1.02]' : 'text-secondary/60 hover:text-white'}`}
            onClick={() => setType('income')}
          >
            Доход
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount - Floating Glass */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-[28px] p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="flex items-center justify-center gap-1 relative z-10">
                <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="bg-transparent border-none text-[40px] font-extrabold text-white placeholder-white/10 focus:outline-none focus:ring-0 text-center w-full max-w-[200px]"
                    step="0.01"
                />
                <span className="text-2xl font-bold text-secondary/50 absolute -right-6 top-1/2 -translate-y-1/2">₽</span>
            </div>
            <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-1">Сумма</p>
          </div>

          {/* Category Selector - Colorful Chips */}
          <div className="py-1">
            <div className="flex justify-between items-center mb-2 px-1">
               <label className="text-[11px] text-secondary/60 uppercase tracking-wider font-bold">Категория</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.type === 'both' || c.type === type).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-[16px] border transition-all duration-200 active:scale-95
                    ${categoryId === cat.id 
                        ? 'brightness-110 shadow-lg scale-[1.02]' 
                        : 'opacity-60 hover:opacity-100 grayscale-[0.3] hover:grayscale-0'}
                  `}
                  style={{ 
                      backgroundColor: `${cat.color}20`, 
                      borderColor: categoryId === cat.id ? cat.color : 'transparent',
                      boxShadow: categoryId === cat.id ? `0 4px 12px ${cat.color}30` : 'none'
                  }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                    <Icon name={cat.icon} size={14} />
                  </div>
                  <span className="text-[12px] font-bold text-white leading-none">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-[20px] px-4 py-3 border border-white/5 flex flex-col justify-center transition-colors focus-within:bg-black/30">
                <label className="text-[9px] text-secondary/50 uppercase font-bold mb-0.5">Дата</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-transparent text-white focus:outline-none text-[13px] font-semibold font-mono" 
                />
            </div>
             <button type="button" className="bg-black/20 rounded-[20px] px-3 py-3 border border-white/5 flex items-center justify-center gap-2 hover:bg-black/30 transition-all active:scale-95">
                <Icon name="camera" size={16} className="text-[#0A84FF]"/>
                <span className="text-[13px] font-semibold text-white/90">Скан чека</span>
            </button>
          </div>

          {/* Title */}
          <div className="bg-black/20 rounded-[20px] px-4 py-3 border border-white/5">
             <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название..."
              className="w-full bg-transparent border-none text-white placeholder-white/20 focus:outline-none text-[14px] font-medium"
            />
          </div>

          {/* Description */}
          <div className="bg-black/20 rounded-[20px] px-4 py-3 border border-white/5">
             <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Комментарий..."
              className="w-full bg-transparent border-none text-white placeholder-white/20 focus:outline-none text-[14px] font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-4">
            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#0A84FF] text-white py-3.5 rounded-[24px] font-bold text-[16px] active:scale-[0.98] transition-all hover:bg-[#007AFF] disabled:opacity-50 flex items-center justify-center gap-2 border-t border-white/10"
            >
                {saving ? '...' : (
                    <>
                        <span>Сохранить</span>
                    </>
                )}
            </button>
          </div>
        </form>
    </div>
  );
};