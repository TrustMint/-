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
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return; // Require category selection

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
        <div className="flex bg-black/20 p-1 rounded-full mb-5 backdrop-blur-md">
          <button 
            className={`flex-1 py-3 rounded-full text-[13px] font-bold transition-all duration-300 ${type === 'expense' ? 'bg-[#FF453A] text-white scale-[1.02] shadow-lg' : 'text-secondary/60 hover:text-white'}`}
            onClick={() => setType('expense')}
          >
            Расход
          </button>
          <button 
            className={`flex-1 py-3 rounded-full text-[13px] font-bold transition-all duration-300 ${type === 'income' ? 'bg-[#30D158] text-white scale-[1.02] shadow-lg' : 'text-secondary/60 hover:text-white'}`}
            onClick={() => setType('income')}
          >
            Доход
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount - Floating Glass */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-[32px] p-6 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="flex items-center justify-center gap-1 relative z-10">
                <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="bg-transparent border-none text-[48px] font-extrabold text-white placeholder-white/10 focus:outline-none focus:ring-0 text-center w-full max-w-[240px]"
                    step="0.01"
                />
                <span className="text-3xl font-bold text-secondary/50 absolute -right-8 top-1/2 -translate-y-1/2">₽</span>
            </div>
            <p className="text-[11px] text-secondary/40 font-bold uppercase tracking-widest mt-2">Сумма</p>
          </div>

          {/* Category Selector - Colorful Chips */}
          <div className="py-2">
            <div className="flex justify-between items-center mb-3 px-2">
               <label className="text-[11px] text-secondary/60 uppercase tracking-wider font-bold">Категория</label>
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
              {categories.filter(c => c.type === 'both' || c.type === type).map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 active:scale-95
                      ${isSelected ? 'brightness-110 shadow-lg scale-[1.02] border-white/20' : 'opacity-60 hover:opacity-80 border-transparent bg-white/5'}
                    `}
                    style={{
                        // Only apply color when selected, otherwise use neutral dim style
                        backgroundColor: isSelected ? cat.color : undefined, 
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm shrink-0" 
                         style={{ 
                             backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                             color: 'white'
                         }}>
                      <Icon name={cat.icon} size={12} />
                    </div>
                    <span 
                        className={`text-[11px] font-bold leading-none whitespace-nowrap ${isSelected ? 'text-white' : 'text-secondary'}`}
                    >
                        {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-[24px] px-5 py-4 border border-white/5 flex flex-col justify-center transition-colors focus-within:bg-black/30">
                <label className="text-[9px] text-secondary/50 uppercase font-bold mb-1">Дата</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-transparent text-white focus:outline-none text-[14px] font-bold font-mono" 
                />
            </div>
             <button type="button" className="bg-black/20 rounded-[24px] px-4 py-4 border border-white/5 flex items-center justify-center gap-2 hover:bg-black/30 transition-all active:scale-95">
                <Icon name="camera" size={18} className="text-[#0A84FF]"/>
                <span className="text-[13px] font-bold text-white/90">Скан чека</span>
            </button>
          </div>

          {/* Title */}
          <div className="bg-black/20 rounded-[24px] px-5 py-4 border border-white/5">
             <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название..."
              className="w-full bg-transparent border-none text-white placeholder-white/20 focus:outline-none text-[15px] font-medium"
            />
          </div>

          {/* Description */}
          <div className="bg-black/20 rounded-[24px] px-5 py-4 border border-white/5">
             <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Комментарий..."
              className="w-full bg-transparent border-none text-white placeholder-white/20 focus:outline-none text-[15px] font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-6">
            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#0A84FF] text-white py-4 rounded-full font-bold text-[17px] active:scale-[0.98] transition-all hover:bg-[#007AFF] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
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