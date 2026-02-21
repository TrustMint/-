import React, { useState } from 'react';
import { useStore } from '../store';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import { Icon } from '../components/ui/Icons';
import * as XLSX from 'xlsx';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 20} // Grow by ~20px (simulating 50% visual impact/growth)
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
      />
      {/* Custom iOS-style Popup */}
      <foreignObject x={cx - 75} y={cy - 75} width={150} height={150}>
        <div className="flex flex-col items-center justify-center h-full text-center pointer-events-none">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-1 min-w-[120px]">
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">{payload.name}</span>
                <span className="text-lg font-bold text-white leading-tight">{value.toLocaleString()} ₽</span>
                <span className="text-[10px] text-white/40 font-medium">За период</span>
            </div>
        </div>
      </foreignObject>
    </g>
  );
};

export const Analytics: React.FC = () => {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<'week'|'month'|'year'>('month');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Export State
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

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

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleExport = () => {
      // Filter by date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filtered = transactions.filter(t => {
          const d = new Date(t.date);
          return d >= start && d <= end;
      });

      const data = filtered.map(t => ({
          'Дата': new Date(t.date).toLocaleDateString('ru-RU'),
          'Тип': t.type === 'income' ? 'Доход' : 'Расход',
          'Категория': categories.find(c => c.id === t.category_id)?.name || 'Без категории',
          'Сумма': t.amount,
          'Валюта': t.currency,
          'Описание': t.description || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Отчет");
      
      // Auto-width columns
      const wscols = [
          {wch: 12}, {wch: 10}, {wch: 20}, {wch: 15}, {wch: 10}, {wch: 30}
      ];
      ws['!cols'] = wscols;

      XLSX.writeFile(wb, `fintrack_export_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h1 className="text-[26px] text-secondary/50 font-bold uppercase tracking-widest pl-1 leading-none">Отчеты</h1>
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

      {/* KPI Cards - New Layout */}
      <div className="space-y-3">
          {/* Row 1: Income & Expense */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#30D158] overflow-hidden">
                <p className="text-[10px] text-secondary/60 font-bold uppercase">Доходы</p>
                <p className="text-[17px] font-bold mt-1 text-secondary truncate">{income.toLocaleString()} ₽</p>
            </div>
            <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#FF453A] overflow-hidden">
                <p className="text-[10px] text-secondary/60 font-bold uppercase">Расходы</p>
                <p className="text-[17px] font-bold mt-1 text-secondary truncate">{expense.toLocaleString()} ₽</p>
            </div>
          </div>
          
          {/* Row 2: Savings (Full Width) */}
          <div className="bg-[#1C1C1E] rounded-[24px] p-4 border-l-4 border-l-[#0A84FF] overflow-hidden flex items-center justify-between">
             <div>
                <p className="text-[10px] text-secondary/60 font-bold uppercase">Накоплено</p>
                <p className="text-xl font-bold mt-1 text-secondary truncate">{saved.toLocaleString()} ₽</p>
             </div>
             <div className="bg-[#0A84FF]/10 px-3 py-1 rounded-full">
                 <span className="text-xs text-[#0A84FF] font-bold">{(saved > 0 ? '+' : '') + Math.round((saved / (income || 1)) * 100)}%</span>
             </div>
          </div>
      </div>

      {/* Combined Chart & Categories Block */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-6 flex flex-col gap-8">
         <div className="flex justify-between items-center">
             <h3 className="font-bold text-lg text-secondary">Структура расходов</h3>
         </div>
         
         {/* 3D-like Pie Chart */}
         <div className="w-full h-[320px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        {pieData.map((entry, index) => (
                            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                            </linearGradient>
                        ))}
                        <filter id="shadow-3d" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.5"/>
                        </filter>
                    </defs>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80} // Increased for donut look
                        outerRadius={110} // Thicker ring
                        paddingAngle={6}
                        dataKey="value"
                        onClick={onPieEnter}
                        onMouseEnter={onPieEnter}
                        stroke="none"
                        filter="url(#shadow-3d)"
                    >
                        {pieData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#gradient-${index})`}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={1}
                                style={{ 
                                    transformOrigin: 'center center',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Info (Total) */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-secondary/40 text-xs font-bold uppercase tracking-widest mb-1">Всего</span>
                <span className="text-2xl font-bold text-white">{expense.toLocaleString()}</span>
                <span className="text-sm text-secondary/40 font-medium">RUB</span>
            </div>
         </div>

         {/* Categories List (Merged) */}
         <div className="space-y-4">
             <h4 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest">Детализация</h4>
             <div className="space-y-4">
                {pieData.slice(0, 10).map((p, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center justify-between group p-2 rounded-xl transition-colors cursor-pointer ${activeIndex === i ? 'bg-white/5' : ''}`}
                        onClick={() => setActiveIndex(i)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center relative bg-[#171717] shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-secondary">{p.name}</p>
                                <div className="w-24 h-1 bg-[#2C2C2E] rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((p.value / expense) * 100)}%`, backgroundColor: p.color }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-secondary">{p.value.toLocaleString()} ₽</p>
                            <p className="text-[11px] text-secondary/50">{Math.round((p.value / expense) * 100)}%</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Export Block */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-5">
          <h3 className="text-[15px] font-bold text-secondary mb-4 ml-1">Экспорт данных</h3>
          <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-[16px] px-3 py-2 border border-white/5">
                      <label className="text-[10px] text-secondary/50 font-bold uppercase block mb-1">С</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-white text-sm font-medium focus:outline-none w-full"
                      />
                  </div>
                  <div className="bg-black/20 rounded-[16px] px-3 py-2 border border-white/5">
                      <label className="text-[10px] text-secondary/50 font-bold uppercase block mb-1">По</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-white text-sm font-medium focus:outline-none w-full"
                      />
                  </div>
              </div>
              
              <button 
                onClick={handleExport}
                className="w-full bg-[#32D74B] text-white py-3.5 rounded-[20px] font-bold text-[15px] active:scale-[0.98] transition-all hover:bg-[#28C840] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                  <Icon name="download" size={18} />
                  <span>Выгрузить</span>
              </button>
          </div>
      </div>
    </div>
  );
};