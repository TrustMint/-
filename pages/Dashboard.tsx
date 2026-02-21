import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Icon } from '../components/ui/Icons';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { transactions, categories } = useStore();
  const navigate = useNavigate();

  // --- Monthly Limit Logic ---
  const [limit, setLimit] = useState(() => Number(localStorage.getItem('monthly_limit')) || 50000);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(limit.toString());

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

  const saveLimit = () => {
      const val = parseFloat(tempLimit);
      if (!isNaN(val) && val > 0) {
          setLimit(val);
          localStorage.setItem('monthly_limit', val.toString());
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

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      {/* Header: Date Only - Integrated into flow */}
      <div className="px-1">
        <p className="text-secondary/60 text-[13px] font-semibold uppercase tracking-widest">
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

         {/* Income/Expense Row */}
         <div className="grid grid-cols-2 gap-3 mt-2 relative z-10">
            <div className="bg-[#2C2C2E]/50 rounded-[18px] p-3 flex items-center gap-3 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#30D158]/10 flex items-center justify-center text-[#30D158]">
                    <Icon name="trending-down" size={20} className="rotate-180" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wide mb-0.5">Доход</p>
                    <p className="text-[15px] font-bold text-secondary truncate">+{income.toLocaleString('ru-RU')}</p>
                </div>
            </div>
            <div className="bg-[#2C2C2E]/50 rounded-[18px] p-3 flex items-center gap-3 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#FF453A]/10 flex items-center justify-center text-[#FF453A]">
                    <Icon name="trending-down" size={20} />
                </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wide mb-0.5">Расход</p>
                    <p className="text-[15px] font-bold text-secondary truncate">-{expense.toLocaleString('ru-RU')}</p>
                </div>
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
                    className="flex-1 bg-[#2C2C2E] rounded-[12px] px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
                    autoFocus
                  />
                  <button onClick={saveLimit} className="bg-[#0A84FF] text-white px-4 rounded-[12px] text-sm font-medium">OK</button>
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

      {/* Chart Section - Grey Block */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-5 h-[240px] flex flex-col">
         <h3 className="text-[15px] font-bold text-secondary mb-4 ml-1">Динамика</h3>
         <div className="flex-1 w-full min-h-0 relative -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{ 
                      backgroundColor: 'rgba(28, 28, 30, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      padding: '8px 12px',
                      fontSize: '13px'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                />
                <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0A84FF" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Recent Transactions Header - Styled like Date */}
      <div className="flex justify-between items-end px-1 pt-2">
        <h3 className="text-[13px] text-secondary/50 font-semibold uppercase tracking-widest">Последние</h3>
        <button 
            onClick={() => navigate('/transactions')} 
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
                    <div 
                        key={t.id} 
                        // Optional: Navigate to transactions or show details
                        onClick={() => navigate('/transactions')}
                        className="bg-[#1C1C1E] rounded-[24px] p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0 relative overflow-hidden bg-[#171717] border border-white/5">
                                 <div className="absolute inset-0 rounded-[14px] pointer-events-none z-10 shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.08)]"></div>
                                <Icon name={cat?.icon || 'dollar'} size={20} color={cat?.color} />
                            </div>
                            <div>
                                <p className="font-semibold text-[15px] text-white leading-snug">{(t as any).title || cat?.name}</p>
                                {t.description && (
                                    <p className="text-[13px] text-secondary/50 font-medium truncate max-w-[140px]">
                                        {t.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className={`font-bold text-[16px] tracking-tight ${t.type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                            {t.type === 'income' ? '+' : '−'}{Math.abs(t.amount).toLocaleString('ru-RU')} ₽
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};