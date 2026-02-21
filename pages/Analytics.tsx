import React, { useState } from 'react';
import { useStore } from '../store';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import { Icon } from '../components/ui/Icons';

export const Analytics: React.FC = () => {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<'week'|'month'|'year'>('month');

  // KPI Calculations
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const saved = income - expense;

  // Pie Data
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category_id] = (acc[t.category_id] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  
  const pieData = Object.entries(expenseByCategory)
    .map(([id, val]) => ({ 
        name: categories.find(c => c.id === id)?.name || 'Прочее', 
        value: val, 
        color: categories.find(c => c.id === id)?.color || '#888' 
    }))
    .sort((a,b) => b.value - a.value);

  // Line Chart Data (Simulated)
  const chartData = transactions.slice(0, 10).reverse().map((t, i) => ({
      name: i,
      income: t.type === 'income' ? t.amount : 0,
      expense: t.type === 'expense' ? t.amount : 0,
  }));

  const handleExport = () => {
      // CSV Export Logic
      const headers = ['Дата', 'Тип', 'Категория', 'Сумма', 'Описание'];
      const rows = transactions.map(t => {
          const cat = categories.find(c => c.id === t.category_id)?.name || 'Без категории';
          const type = t.type === 'income' ? 'Доход' : 'Расход';
          const date = new Date(t.date).toLocaleDateString('ru-RU');
          // Escape quotes in description
          const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '';
          return [date, type, cat, t.amount, desc].join(',');
      });

      const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // Add BOM for Excel
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "fintrack_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-24 md:pb-0 animate-fade-in">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Отчет</h1>
        <div className="flex gap-3">
             <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#0A84FF]/10 text-[#0A84FF] px-4 py-2 rounded-full font-bold text-xs hover:bg-[#0A84FF]/20 transition-colors"
            >
                <Icon name="download" size={16} />
                <span>Excel</span>
            </button>
            <div className="flex bg-[#1C1C1E] p-1 rounded-full">
                {['week', 'month', 'year'].map(p => (
                    <button 
                        key={p}
                        onClick={() => setPeriod(p as any)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase transition-all ${period === p ? 'bg-[#636366] text-white shadow-md' : 'text-secondary/60 hover:text-white'}`}
                    >
                        {p === 'week' ? 'Нед' : p === 'month' ? 'Мес' : 'Год'}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* KPI Cards - Solid Menu Style */}
      <div className="grid grid-cols-3 gap-3 overflow-x-auto no-scrollbar">
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#30D158]">
            <p className="text-[10px] text-secondary/60 font-bold uppercase">Доходы</p>
            <p className="text-lg md:text-xl font-bold mt-1 truncate">{income.toLocaleString()} ₽</p>
            <span className="text-[10px] text-[#30D158] font-medium bg-[#30D158]/10 px-2 py-0.5 rounded-full">+5%</span>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#FF453A]">
            <p className="text-[10px] text-secondary/60 font-bold uppercase">Расходы</p>
            <p className="text-lg md:text-xl font-bold mt-1 truncate">{expense.toLocaleString()} ₽</p>
            <span className="text-[10px] text-[#FF453A] font-medium bg-[#FF453A]/10 px-2 py-0.5 rounded-full">-2%</span>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#0A84FF]">
            <p className="text-[10px] text-secondary/60 font-bold uppercase">Накоплено</p>
            <p className="text-lg md:text-xl font-bold mt-1 truncate">{saved.toLocaleString()} ₽</p>
            <span className="text-[10px] text-[#0A84FF] font-medium bg-[#0A84FF]/10 px-2 py-0.5 rounded-full">+12%</span>
        </div>
      </div>

      {/* Main Chart - Solid Menu Style */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-6 h-[320px] flex flex-col">
         <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Движение средств</h3>
             <div className="flex gap-3 text-xs">
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#30D158]"/> Доход</span>
                 <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF453A]"/> Расход</span>
             </div>
         </div>
         <div className="flex-1 w-full min-h-0 relative -ml-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#30D158" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF453A" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FF453A" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38383A" />
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                        cursor={{ stroke: '#555', strokeWidth: 1 }}
                        contentStyle={{ 
                            backgroundColor: '#2C2C2E', 
                            border: 'none', 
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            color: '#FFF'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#30D158" 
                        fillOpacity={1} 
                        fill="url(#colorInc)" 
                        strokeWidth={3} 
                    />
                    <Area 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#FF453A" 
                        fillOpacity={1} 
                        fill="url(#colorExp)" 
                        strokeWidth={3} 
                    />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Categories Pie & Table - Solid Menu Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#1C1C1E] rounded-[24px] p-6 h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="font-bold absolute top-6 left-6 text-lg z-10">По категориям</h3>
            
            {/* 3D Pie Chart Container */}
            <div className="w-full h-full min-h-0 relative flex items-center justify-center mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            cornerRadius={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{ 
                                backgroundColor: '#2C2C2E', 
                                border: 'none', 
                                borderRadius: '16px',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Label (Donut Hole) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center bg-[#2C2C2E] p-4 rounded-full shadow-xl z-20">
                         <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-wider">Всего</p>
                         <p className="text-xl font-bold text-white">{expense.toLocaleString()}</p>
                     </div>
                </div>
            </div>
         </div>

         <div className="bg-[#1C1C1E] rounded-[24px] p-6 h-[400px] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1C1C1E] py-2 z-10 border-b border-[#38383A]">
                <h3 className="font-bold text-lg">Топ расходов</h3>
            </div>
            <div className="space-y-5">
                {pieData.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center relative bg-[#171717]">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-white">{p.name}</p>
                                <div className="w-24 h-1.5 bg-[#2C2C2E] rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${Math.round((p.value / expense) * 100)}%`, backgroundColor: p.color }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-white">{p.value.toLocaleString()} ₽</p>
                            <p className="text-xs text-secondary/50">{Math.round((p.value / expense) * 100)}%</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};