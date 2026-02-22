import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Icon } from './ui/Icons';
import { TransactionType } from '../types';
import { useModal } from './ModalProvider';

export const AddTransactionModal: React.FC = () => {
  const { categories, addTransaction, addCategory, deleteCategory } = useStore();
  const { hideModal } = useModal();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [poppingCategory, setPoppingCategory] = useState<string | null>(null);

  // Add Category State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#0A84FF');
  const [newCategoryIcon, setNewCategoryIcon] = useState('tag');
  
  // Delete Category State
  const [isDeletingCategories, setIsDeletingCategories] = useState(false);

  // Scrubber Logic Refs
  const scrubStartX = useRef<number>(0);
  const scrubStartVal = useRef<number>(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const handleCategoryClick = (id: string) => {
      if (isDeletingCategories) return;
      setCategoryId(id);
      setPoppingCategory(id);
      setTimeout(() => setPoppingCategory(null), 300);
  };

  const handleAddCategory = async () => {
      if (!newCategoryName) return;
      try {
          const newCat = await addCategory({
              name: newCategoryName,
              color: newCategoryColor,
              icon: newCategoryIcon,
              type: type // 'income' or 'expense' based on current tab
          });
          if (newCat) {
              setCategoryId(newCat.id);
              setShowAddCategory(false);
              setNewCategoryName('');
              setNewCategoryIcon('tag');
              setNewCategoryColor('#0A84FF');
          }
      } catch (error) {
          console.error('Failed to add category', error);
      }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('Удалить эту категорию?')) {
          await deleteCategory(id);
          if (categoryId === id) setCategoryId('');
      }
  };

  // --- SCRUBBER LOGIC ---
  const handleScrubStart = (e: React.TouchEvent | React.MouseEvent) => {
      // e.stopPropagation(); // Removed to allow modal scroll if needed, but usually scrubber captures it
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      scrubStartX.current = clientX;
      const currentAmount = parseFloat(amount || '0');
      scrubStartVal.current = currentAmount;
      setIsScrubbing(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  const handleScrubMove = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isScrubbing) return;
      // e.stopPropagation();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const delta = clientX - scrubStartX.current;
      
      const stepValue = 10; // Adjust step value as needed
      const pxPerStep = 2;
      
      const steps = Math.floor(delta / pxPerStep);
      let newAmount = scrubStartVal.current + (steps * stepValue);
      
      if (newAmount < 0) newAmount = 0;
      // Round to nearest 10 or keep decimal? The prompt example rounds to 10.
      // Let's keep it somewhat flexible but clean.
      newAmount = Math.round(newAmount / 10) * 10;

      const currentAmount = parseFloat(amount || '0');
      if (newAmount !== currentAmount) {
          setAmount(newAmount.toString());
          if (typeof navigator !== 'undefined' && navigator.vibrate && Math.abs(steps) % 5 === 0) {
               navigator.vibrate(5);
          }
      }
  };

  const handleScrubEnd = (e: React.TouchEvent | React.MouseEvent) => {
      // e.stopPropagation();
      setIsScrubbing(false);
  };

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

        <style>{`
            @keyframes pop-150 {
                0% { transform: scale(1); }
                50% { transform: scale(1.5); }
                100% { transform: scale(1); }
            }
            .animate-pop-150 {
                animation: pop-150 0.3s ease-in-out;
            }
            /* Custom Range Slider Styling */
            input[type=range] {
                -webkit-appearance: none;
                width: 100%;
                background: transparent;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 28px;
                width: 28px;
                border-radius: 50%;
                background: #ffffff;
                cursor: pointer;
                margin-top: -12px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 4px;
                cursor: pointer;
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
            }
        `}</style>

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
          {/* Amount - Floating Glass with Scrubber */}
          <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-[32px] p-6 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="flex items-center justify-center gap-1 relative z-10 mb-6">
                <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="bg-transparent border-none text-[64px] font-extrabold text-white placeholder-white/10 focus:outline-none focus:ring-0 text-center w-full max-w-[280px] leading-none tracking-tighter"
                    step="0.01"
                />
                <span className="text-3xl font-bold text-secondary/50 absolute -right-6 top-1/2 -translate-y-1/2">₽</span>
            </div>
            
            {/* iOS Style Scrubber */}
            <div className="w-full px-2 relative z-10">
                <div 
                    className="relative w-full h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none transition-transform active:scale-95 overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, rgba(10, 132, 255, 0.15) 0%, rgba(191, 90, 242, 0.15) 100%)',
                        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 20px rgba(10, 132, 255, 0.1)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onTouchStart={handleScrubStart}
                    onTouchMove={handleScrubMove}
                    onTouchEnd={handleScrubEnd}
                    onMouseDown={handleScrubStart}
                    onMouseMove={handleScrubMove}
                    onMouseUp={handleScrubEnd}
                    onMouseLeave={handleScrubEnd}
                >
                    <div className="absolute left-4 text-[#0A84FF]"><Icon name="chevron-left" size={20} /></div>
                    
                    {/* Colorful Ticks */}
                    <div className="flex gap-1.5 items-center">
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#0A84FF] to-[#BF5AF2] opacity-60"></div>
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0A84FF] to-[#BF5AF2]"></div>
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#0A84FF] to-[#BF5AF2] opacity-60"></div>
                    </div>

                    <div className="absolute right-4 text-[#BF5AF2]"><Icon name="chevron-right" size={20} /></div>
                    
                    {isScrubbing && (
                        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse pointer-events-none border border-white/20"></div>
                    )}
                </div>
                <p className="text-center text-[11px] text-secondary/40 mt-3 font-medium">Свайп для точной настройки</p>
            </div>
          </div>

          {/* Category Selector - Colorful Chips */}
          <div className="py-2">
            <div className="flex justify-between items-center mb-3 px-2">
               <label className="text-[11px] text-secondary/60 uppercase tracking-wider font-bold">Категория</label>
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
              {categories.filter(c => c.type === 'both' || c.type === type).map(cat => {
                const isSelected = categoryId === cat.id;
                const isPopping = poppingCategory === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`
                      relative flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200
                      ${isSelected ? 'brightness-110 shadow-lg border-white/20' : 'opacity-60 hover:opacity-80 border-transparent bg-white/5'}
                      ${isPopping ? 'animate-pop-150' : 'active:scale-95'}
                      ${isDeletingCategories ? 'animate-shake' : ''}
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

                    {/* Delete Badge */}
                    {isDeletingCategories && (
                        <div 
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF453A] rounded-full flex items-center justify-center shadow-sm z-10 border border-[#1C1C1E]"
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                        >
                            <svg width="8" height="8" viewBox="0 0 14 14" fill="none" className="text-white">
                                <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}
                  </button>
                );
              })}
              
              {/* Add Category Button */}
              <button
                type="button"
                onClick={() => { setShowAddCategory(true); setIsDeletingCategories(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 opacity-60 hover:opacity-100 active:scale-95 transition-all"
              >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-white">
                      <Icon name="plus" size={12} />
                  </div>
                  <span className="text-[11px] font-bold text-secondary">Добавить</span>
              </button>

              {/* Delete Category Toggle */}
              <button
                type="button"
                onClick={() => setIsDeletingCategories(!isDeletingCategories)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:opacity-100 active:scale-95 transition-all ${isDeletingCategories ? 'opacity-100 bg-red-500/20 border-red-500/50' : 'opacity-60'}`}
              >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDeletingCategories ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                      <Icon name={isDeletingCategories ? "check" : "trash"} size={10} />
                  </div>
                  <span className={`text-[11px] font-bold ${isDeletingCategories ? 'text-red-400' : 'text-secondary'}`}>
                      {isDeletingCategories ? 'Готово' : 'Удалить'}
                  </span>
              </button>
            </div>
          </div>

          {/* Add Category Form (Inline) */}
          {showAddCategory && (
              <div className="bg-[#1C1C1E] rounded-[32px] p-5 border border-white/10 space-y-5 animate-fade-in relative">
                  <div className="flex justify-between items-center px-1">
                      <h3 className="text-[17px] font-bold text-white">Новая категория</h3>
                      {/* Custom Close Button (SVG Style) */}
                      <button 
                        type="button" 
                        onClick={() => setShowAddCategory(false)} 
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-full bg-white/10 transition-transform active:scale-90 hover:bg-white/20 backdrop-blur-md"
                      >
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="text-white/60">
                              <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      </button>
                  </div>
                  
                  <div className="space-y-5">
                      {/* Name Input */}
                      <input 
                          type="text" 
                          placeholder="Название категории" 
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          className="w-full bg-black/20 rounded-full px-5 py-4 text-white placeholder-white/20 text-[15px] focus:outline-none border border-white/5 focus:border-white/20 transition-colors"
                      />
                      
                      {/* Color Picker */}
                      <div className="space-y-2">
                        <label className="text-[11px] text-secondary/60 uppercase tracking-wider font-bold ml-2">Выберите цвет</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-1">
                            {['#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#64D2FF', '#0A84FF', '#5E5CE6', '#BF5AF2', '#FF375F', '#8E8E93'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewCategoryColor(color)}
                                    className={`w-10 h-10 rounded-full shrink-0 transition-transform flex items-center justify-center ${newCategoryColor === color ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {newCategoryColor === color && <Icon name="check" size={16} className="text-white mix-blend-difference" />}
                                </button>
                            ))}
                        </div>
                      </div>

                      {/* Icon Picker */}
                      <div className="space-y-2">
                        <label className="text-[11px] text-secondary/60 uppercase tracking-wider font-bold ml-2">Выберите значок</label>
                        <div className="grid grid-cols-6 gap-2">
                            {['tag', 'shopping-cart', 'car', 'home', 'coffee', 'briefcase', 'laptop', 'gift', 'smartphone', 'music', 'shopping-bag', 'user', 'star', 'map', 'credit-card', 'bell', 'camera', 'file-text'].map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewCategoryIcon(icon)}
                                    className={`aspect-square rounded-full flex items-center justify-center transition-all ${newCategoryIcon === icon ? 'bg-white text-black' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
                                >
                                    <Icon name={icon} size={18} />
                                </button>
                            ))}
                        </div>
                      </div>

                      <button 
                          type="button"
                          onClick={handleAddCategory}
                          disabled={!newCategoryName}
                          className="w-full bg-[#0A84FF] text-white py-4 rounded-full font-bold text-[17px] disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                      >
                          Создать категорию
                      </button>
                  </div>
              </div>
          )}

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