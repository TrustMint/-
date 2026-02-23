import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Icon } from '../components/ui/Icons';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { SwipeableTransactionItem } from './Transactions'; // We need to export this from Transactions.tsx
import { AddTransactionModal } from '../components/AddTransactionModal';
import { useModal } from '../components/ModalProvider';

export const Dashboard: React.FC = () => {
  const { transactions, categories, user, updateProfile, deleteTransaction } = useStore();
  const navigate = useNavigate();
  const { showModal } = useModal();

  // --- Monthly Limit Logic ---
  const limit = user?.monthly_limit || 50000;
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(limit.toString());

  // Update tempLimit when limit changes from store
  useEffect(() => {
      setTempLimit(limit.toString());
  }, [limit]);

  // Calculate expenses for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = transactions
    .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const remaining = limit - monthlyExpenses;
  const progress = Math.min(100, Math.max(0, (monthlyExpenses / limit) * 100));

  const saveLimit = async () => {
      const val = parseFloat(tempLimit);
      if (!isNaN(val) && val > 0) {
          await updateProfile({ monthly_limit: val });
      }
      setIsEditingLimit(false);
  };

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Chart data (Last 14 days)
  const chartData = transactions.slice(0, 14).reverse().map((t, i) => ({
    name: i,
    amount: t.type === 'income' ? t.amount : -t.amount,
    date: new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }));

  const handleDelete = (id: string) => {
    if(window.confirm('Удалить операцию?')) {
        deleteTransaction(id);
    }
  };

  const handleEdit = (id: string) => {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
          showModal(<AddTransactionModal transaction={transaction} />);
      }
  };

  return (
    <div className="space-y-3">
      {/* Header: Date Only - Integrated into flow */}
      <div className="px-1">
        <p className="text-secondary/60 text-[13px] font-bold uppercase tracking-widest leading-none">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Main Balance Card - iOS Style (Grey Block) */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-6 relative overflow-hidden">
         {/* Balance */}
         <div className="relative z-10 flex flex-col items-center py-4">
             <span className="text-secondary/60 text-[13px] font-medium uppercase tracking-wider mb-2">Общий баланс</span>
             <div className="flex items-baseline gap-1.5">
                <h2 className="text-4xl font-bold tracking-tight text-white">
                  {totalBalance.toLocaleString('ru-RU')}
                </h2>
                <span className="text-xl text-secondary/60 font-medium">₽</span>
             </div>
         </div>
      </div>

      {/* Income/Expense Row - Moved Out */}
      <div className="grid grid-cols-2 gap-3 mt-2 relative z-10">
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center text-[#30D158] shrink-0">
                <Icon name="trending-down" size={20} className="rotate-180" />
            </div>
            <div className="overflow-hidden min-w-0">
                <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wide mb-0.5">Доход</p>
                <p className="text-[13px] font-bold text-secondary truncate">+{income.toLocaleString('ru-RU')}</p>
            </div>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF453A]/10 flex items-center justify-center text-[#FF453A] shrink-0">
                <Icon name="trending-down" size={20} />
            </div>
             <div className="overflow-hidden min-w-0">
                <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wide mb-0.5">Расход</p>
                <p className="text-[13px] font-bold text-secondary truncate">-{expense.toLocaleString('ru-RU')}</p>
            </div>
        </div>
      </div>

      {/* Monthly Limit Widget - iOS Style */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
              <h3 className="text-[15px] font-bold text-secondary ml-1">Лимит на месяц</h3>
              <button 
                onClick={() => setIsEditingLimit(!isEditingLimit)}
                className="text-[#0A84FF] text-[13px] font-medium active:opacity-60"
              >
                  {isEditingLimit ? 'Готово' : 'Изменить'}
              </button>
          </div>

          {isEditingLimit ? (
              <div className="flex gap-2 mb-2">
                  <input 
                    type="number" 
                    value={tempLimit}
                    onChange={(e) => setTempLimit(e.target.value)}
                    className="flex-1 bg-[#2C2C2E] rounded-full px-4 py-2 text-white text-[15px] focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
                    autoFocus
                  />
                  <button onClick={saveLimit} className="bg-[#0A84FF] text-white px-5 rounded-full text-[15px] font-medium active:scale-95 transition-transform">OK</button>
              </div>
          ) : (
            <>
                {/* Progress Bar Track */}
                <div className="h-4 w-full bg-[#2C2C2E] rounded-full overflow-hidden mb-2 relative">
                    {/* Progress Fill */}
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${remaining < 0 ? 'bg-[#FF453A]' : 'bg-[#0A84FF]'}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                    />
                </div>
                
                <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-secondary/50 font-medium uppercase tracking-wide">Осталось</span>
                        <span className={`text-[15px] font-bold ${remaining < 0 ? 'text-[#FF453A]' : 'text-secondary'}`}>
                            {remaining.toLocaleString('ru-RU')} ₽
                        </span>
                    </div>
                    <div className="text-right flex flex-col">
                        <span className="text-[11px] text-secondary/50 font-medium uppercase tracking-wide">Траты / Лимит</span>
                        <span className="text-[13px] font-medium text-secondary/80">
                            {monthlyExpenses.toLocaleString('ru-RU')} / {limit.toLocaleString('ru-RU')}
                        </span>
                    </div>
                </div>
            </>
          )}
      </div>

      {/* Recent Transactions Header - Styled like Date */}
      <div className="flex justify-between items-end px-1 pt-2">
        <h3 className="text-[13px] text-secondary/50 font-semibold uppercase tracking-widest">Последние</h3>
        <button 
            onClick={() => navigate('/transactions', { replace: true })} 
            className="text-[#0A84FF] text-[15px] font-medium active:opacity-60 transition-opacity"
        >
            Все
        </button>
      </div>

      {/* Recent Transactions List - Grey Blocks */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
            <div className="text-center py-8 text-secondary/40 bg-[#1C1C1E] rounded-[24px]">
                <p className="text-sm">Нет операций</p>
            </div>
        ) : (
            transactions.slice(0, 5).map(t => {
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
            })
        )}
      </div>
    </div>
  );
};