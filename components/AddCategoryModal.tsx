import React, { useState } from 'react';
import { useStore } from '../store';
import { Icon } from './ui/Icons';
import { useModal } from './ModalProvider';

export const AddCategoryModal: React.FC = () => {
  const { addCategory } = useStore();
  const { hideModal } = useModal();
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [newCatColor, setNewCatColor] = useState('#0A84FF');
  const [newCatType, setNewCatType] = useState<'expense'|'income'>('expense');

  const icons = ['shopping-cart', 'car', 'home', 'coffee', 'briefcase', 'laptop', 'gift', 'smartphone', 'music', 'shopping-bag', 'star', 'heart', 'smile'];
  const colors = ['#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#64D2FF', '#0A84FF', '#5E5CE6', '#BF5AF2', '#8E8E93'];

  const handleAdd = async () => {
      await addCategory({
          name: newCatName,
          icon: newCatIcon,
          color: newCatColor,
          type: newCatType
      });
      hideModal();
  };

  return (
      <div className="px-5 pt-1">
          <h2 className="text-lg font-bold mb-4 px-1 text-center text-white/90">Новая категория</h2>
          
          <div className="space-y-5">
              
              {/* Name Input */}
              <div className="bg-black/20 rounded-[20px] p-1 border border-white/5">
                  <input 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full bg-transparent p-3 text-white font-medium focus:outline-none text-[15px] placeholder-white/20 text-center"
                    placeholder="Название категории"
                    autoFocus
                  />
              </div>

              {/* Type Toggle */}
              <div>
                  <div className="flex bg-black/20 p-1 rounded-[16px] backdrop-blur-md">
                      <button onClick={() => setNewCatType('expense')} className={`flex-1 py-2 rounded-[12px] text-xs font-bold transition-all ${newCatType === 'expense' ? 'bg-[#FF453A] text-white shadow-md' : 'text-secondary/60 hover:text-white'}`}>Расход</button>
                      <button onClick={() => setNewCatType('income')} className={`flex-1 py-2 rounded-[12px] text-xs font-bold transition-all ${newCatType === 'income' ? 'bg-[#30D158] text-white shadow-md' : 'text-secondary/60 hover:text-white'}`}>Доход</button>
                  </div>
              </div>

              {/* Icon Selector */}
              <div>
                  <label className="text-[10px] text-secondary/50 font-bold uppercase mb-2 block ml-2">Иконка</label>
                  <div className="flex flex-wrap gap-2.5 justify-center bg-black/10 p-3 rounded-[24px] border border-white/5">
                      {icons.map(icon => (
                          <button 
                            key={icon} 
                            onClick={() => setNewCatIcon(icon)} 
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${newCatIcon === icon ? 'bg-[#0A84FF] border-[#0A84FF] text-white scale-110 shadow-lg' : 'border-transparent bg-white/5 text-secondary/50 hover:bg-white/10'}`}
                          >
                              <Icon name={icon} size={18} />
                          </button>
                      ))}
                  </div>
              </div>

              {/* Color Selector */}
              <div>
                  <label className="text-[10px] text-secondary/50 font-bold uppercase mb-2 block ml-2">Цвет</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 px-1 no-scrollbar justify-between bg-black/10 p-3 rounded-[24px] border border-white/5">
                      {colors.map(color => (
                          <button 
                            key={color} 
                            onClick={() => setNewCatColor(color)} 
                            className={`flex-shrink-0 w-8 h-8 rounded-full transition-all ${newCatColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-80'}`} 
                            style={{
                                backgroundColor: color,
                                boxShadow: newCatColor === color ? `0 0 10px ${color}` : 'none'
                            }} 
                          />
                      ))}
                  </div>
              </div>

              <div className="pt-2 pb-4">
                  <button 
                    onClick={handleAdd} 
                    disabled={!newCatName}
                    className="w-full py-3.5 bg-[#0A84FF] rounded-[24px] font-bold text-[16px] text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all hover:bg-[#007AFF] disabled:opacity-50 disabled:scale-100 border-t border-white/10"
                   >
                    Создать
                   </button>
              </div>
          </div>
      </div>
  );
};