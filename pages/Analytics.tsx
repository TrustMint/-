import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { Icon } from '../components/ui/Icons';
import * as XLSX from 'xlsx';
import { usePopAnimation, useSinglePop } from '../hooks/usePopAnimation';
import { useModal } from '../components/ModalProvider';
import { ExportModal } from '../components/ExportModal';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 15}
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
  const { showModal } = useModal();
  const [period, setPeriod] = useState<'week'|'month'|'year'>('month');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animations
  const { poppingId: poppingPeriod, triggerPop: triggerPeriodPop } = usePopAnimation();
  const { isPopping: isPoppingExport, trigger: triggerExportPop } = useSinglePop();
  
  // Export State
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter Transactions by Period
  const filteredTransactions = useMemo(() => {
      const now = new Date();
      let start = new Date();
      
      if (period === 'week') {
          start.setDate(now.getDate() - 7);
      } else if (period === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
          start = new Date(now.getFullYear(), 0, 1);
      }
      
      return transactions.filter(t => new Date(t.date) >= start);
  }, [transactions, period]);

  // KPI Calculations
  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const saved = income - expense;

  // Pie Data
  const expenseByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category_id] = (acc[t.category_id] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  
  const pieData = Object.entries(expenseByCategory)
    .map(([id, val]) => ({ 
        name: categories.find(c => c.id === id)?.name || 'Прочее', 
        value: val, 
        color: categories.find(c => c.id === id)?.color || '#888' 
    }))
    .sort((a,b) => b.value - a.value);

  // Trend Data
  const trendData = useMemo(() => {
      const data: Record<string, number> = {};
      const now = new Date();
      let start = new Date();

      if (period === 'week') {
          start.setDate(now.getDate() - 6);
          for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
              data[d.toLocaleDateString('ru-RU', { weekday: 'short' })] = 0;
          }
      } else if (period === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
              data[i.toString()] = 0;
          }
      } else if (period === 'year') {
          start = new Date(now.getFullYear(), 0, 1);
          for (let i = 0; i < 12; i++) {
              const d = new Date(now.getFullYear(), i, 1);
              data[d.toLocaleDateString('ru-RU', { month: 'short' })] = 0;
          }
      }

      filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
          const d = new Date(t.date);
          let key = '';
          if (period === 'week') key = d.toLocaleDateString('ru-RU', { weekday: 'short' });
          else if (period === 'month') key = d.getDate().toString();
          else if (period === 'year') key = d.toLocaleDateString('ru-RU', { month: 'short' });

          if (data[key] !== undefined) {
              data[key] += t.amount;
          }
      });

      return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions, period]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleExport = () => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filtered = transactions.filter(t => {
          const d = new Date(t.date);
          return d >= start && d <= end;
      });

      const data = filtered.map(t => ({
          'Дата': new Date(t.date).toLocaleDateString('ru-RU'),
          'Время': new Date(t.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          'Тип': t.type === 'income' ? 'Доход' : 'Расход',
          'Категория': categories.find(c => c.id === t.category_id)?.name || 'Без категории',
          'Название': (t as any).title || '',
          'Сумма': t.amount,
          'Валюта': t.currency,
          'Описание': t.description || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Отчет");
      
      const wscols = [
          {wch: 12}, {wch: 8}, {wch: 10}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 10}, {wch: 30}
      ];
      ws['!cols'] = wscols;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const fileName = `fintrack_export_${startDate}_${endDate}.xlsx`;

      showModal(<ExportModal fileUrl={url} fileName={fileName} />);
  };

  return (
    <div className="space-y-6">
      {/* Period Filter - iOS Segmented Control Style */}
      <div className="flex justify-center mb-4">
        <div className="bg-[#1C1C1E] p-1 rounded-[12px] flex relative w-full max-w-[340px] shadow-sm">
            <div 
                className="absolute top-1 bottom-1 bg-[#636366] rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-md"
                style={{
                    width: 'calc(33.33% - 2.66px)',
                    transform: `translateX(${period === 'week' ? '0' : period === 'month' ? '100%' : '200%'})`,
                    marginLeft: period === 'week' ? '0' : period === 'month' ? '4px' : '8px'
                }}
            />
            {['week', 'month', 'year'].map((p) => (
                <button 
                    key={p}
                    onClick={() => { setPeriod(p as any); triggerPeriodPop(p); }}
                    className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[10px] relative z-10 transition-colors duration-200 ${period === p ? 'text-white' : 'text-secondary/60'} ${poppingPeriod === p ? 'animate-pop-150' : ''}`}
                >
                    {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
                </button>
            ))}
        </div>
      </div>

      {/* KPI Cards - Clean iOS Style */}
      <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C1C1E] rounded-[24px] p-4 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)]"></div>
                    <p className="text-[11px] text-secondary/60 font-bold uppercase tracking-wider">Доходы</p>
                </div>
                <p className="text-[20px] font-bold text-white truncate">{income.toLocaleString()} ₽</p>
            </div>
            <div className="bg-[#1C1C1E] rounded-[24px] p-4 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.5)]"></div>
                    <p className="text-[11px] text-secondary/60 font-bold uppercase tracking-wider">Расходы</p>
                </div>
                <p className="text-[20px] font-bold text-white truncate">{expense.toLocaleString()} ₽</p>
            </div>
          </div>
          
          <div className="bg-[#1C1C1E] rounded-[24px] p-4 flex items-center justify-between relative overflow-hidden">
             <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.5)]"></div>
                    <p className="text-[11px] text-secondary/60 font-bold uppercase tracking-wider">Накоплено</p>
                </div>
                <p className="text-[24px] font-bold text-white truncate">{saved.toLocaleString()} ₽</p>
             </div>
          </div>
      </div>

      {/* Combined Chart & Categories Block */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-6 flex flex-col gap-8">
         <div className="flex justify-between items-center">
             <h3 className="font-bold text-lg text-white">Структура расходов</h3>
         </div>
         
         {/* 3D-like Donut Chart */}
         <div className="w-full h-[280px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.3" />
                        </filter>
                    </defs>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={115}
                        paddingAngle={4}
                        dataKey="value"
                        onClick={onPieEnter}
                        onMouseEnter={onPieEnter}
                        stroke="none"
                        cornerRadius={10}
                    >
                        {pieData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                style={{ 
                                    filter: 'url(#shadow)',
                                    transformOrigin: 'center center',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-secondary/50 font-bold uppercase tracking-widest mb-1">Всего</span>
                <span className="text-2xl font-bold text-white">{expense.toLocaleString()} ₽</span>
            </div>
         </div>

         {/* Trend Chart */}
         <div className="mt-4">
             <h4 className="text-[13px] text-secondary/50 font-bold uppercase tracking-widest mb-4">Динамика расходов</h4>
             <div className="h-[160px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                            dy={10}
                         />
                         <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                            tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'}
                         />
                         <RechartsTooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#2C2C2E] p-2 rounded-xl border border-white/10 shadow-xl">
                                            <p className="text-white font-bold text-sm">{payload[0].value?.toLocaleString()} ₽</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                         />
                         <Bar dataKey="value" fill="#FF453A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                     </BarChart>
                 </ResponsiveContainer>
             </div>
         </div>

         {/* Categories List */}
         <div className="space-y-4 mt-2">
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
                                <p className="font-medium text-sm text-white">{p.name}</p>
                                <div className="w-24 h-1 bg-[#2C2C2E] rounded-full mt-1.5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((p.value / expense) * 100)}%`, backgroundColor: p.color }} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-white">{p.value.toLocaleString()} ₽</p>
                            <p className="text-[11px] text-secondary/50">{Math.round((p.value / expense) * 100)}%</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Export Block */}
      <div className="bg-[#1C1C1E] rounded-[24px] p-5">
          <h3 className="text-[15px] font-bold text-white mb-4 ml-1">Экспорт данных</h3>
          <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-full px-4 py-3 border border-white/5 flex items-center justify-between">
                      <label className="text-[11px] text-secondary/50 font-bold uppercase mr-2 shrink-0">С</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-white text-[13px] font-medium focus:outline-none w-full text-right"
                      />
                  </div>
                  <div className="bg-black/20 rounded-full px-4 py-3 border border-white/5 flex items-center justify-between">
                      <label className="text-[11px] text-secondary/50 font-bold uppercase mr-2 shrink-0">По</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-white text-[13px] font-medium focus:outline-none w-full text-right"
                      />
                  </div>
              </div>
              
              <button 
                onClick={() => { triggerExportPop(); handleExport(); }}
                className={`w-full bg-[#32D74B] text-white py-3.5 rounded-full font-bold text-[15px] active:scale-[0.98] transition-all hover:bg-[#28C840] flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mt-2 ${isPoppingExport ? 'animate-pop-150' : ''}`}
              >
                  <Icon name="download" size={18} />
                  <span>Выгрузить</span>
              </button>
          </div>
      </div>
    </div>
  );
};