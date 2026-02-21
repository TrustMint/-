import React from 'react';
import { useStore } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Icon } from '../components/ui/Icons';
import { useModal } from '../components/ModalProvider';
import { AddCategoryModal } from '../components/AddCategoryModal';

export const Categories: React.FC = () => {
  const { categories, deleteCategory } = useStore();
  const { showModal } = useModal();

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-fade-in relative">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-bold">Категории</h1>
        <button 
            onClick={() => showModal(<AddCategoryModal />)}
            className="w-10 h-10 rounded-full bg-[#0A84FF] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
            <Icon name="plus" color="white" size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {categories.map(cat => (
             <GlassCard key={cat.id} className="p-4 flex flex-col items-center gap-3 relative group hover:bg-white/5 active:scale-95 cursor-pointer">
                 <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white mb-1" 
                      style={{ backgroundColor: `${cat.color}` }}>
                     <Icon name={cat.icon} size={28} />
                 </div>
                 <div className="text-center">
                     <p className="font-bold text-sm">{cat.name}</p>
                     <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wide mt-1">
                         {cat.type === 'expense' ? 'Расход' : 'Доход'}
                     </p>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Удалить?')) deleteCategory(cat.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-[#FF453A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                     <Icon name="trash" size={14} color="white"/>
                 </button>
             </GlassCard>
         ))}
      </div>
    </div>
  );
};
