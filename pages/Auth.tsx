import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/GlassCard';
import { Icon } from '../components/ui/Icons';
import { useSwipeBack, SwipeBackShadow } from '../hooks/useSwipeBack';

export const Auth: React.FC = () => {
  const [viewState, setViewState] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Интеграция свайп-хука для возврата с OTP на регистрацию
  const { dragHandlers, pushedStyle, isDragging, dragProgress } = useSwipeBack({
    enabled: viewState === 'otp',
    onSwipeBack: () => {
        setViewState('signup');
        setError('');
        setMessage('');
    },
    backgroundSelector: '#auth-background' // ID для параллакса
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (viewState === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Регистрация
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { 
                data: { full_name: email.split('@')[0] } 
            }
        });
        
        if (error) throw error;
        
        setViewState('otp');
        setMessage(`Код подтверждения отправлен на ${email}`);
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login')) {
          setError('Неверный логин или пароль');
      } else if (err.message.includes('already registered')) {
          setError('Пользователь уже зарегистрирован. Попробуйте войти.');
          setViewState('login');
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError('Неверный код или срок действия истек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Живые фоновые пятна (Параллакс ID) */}
      <div id="auth-background" className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div 
        ref={dragHandlers.ref}
        onTouchStart={dragHandlers.onTouchStart}
        onTouchMove={dragHandlers.onTouchMove}
        onTouchEnd={dragHandlers.onTouchEnd}
        className="w-full max-w-sm relative z-10"
        style={viewState === 'otp' ? pushedStyle : {}}
      >
        <GlassCard className="w-full p-8 border border-white/10 shadow-2xl relative bg-[#1C1C1E]/80 backdrop-blur-xl rounded-[40px]">
            {/* Тень свайпа */}
            {isDragging && <SwipeBackShadow progress={dragProgress} />}

            <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[30px] flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/30 transform rotate-3">
                    <Icon name="dollar" size={48} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">FinTrack</h1>
                <p className="text-secondary/60 text-sm font-medium">Ваш личный бухгалтер</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-[24px] text-sm mb-6 text-center backdrop-blur-md animate-fade-in font-medium">
                    {error}
                </div>
            )}
            
            {message && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-[24px] text-sm mb-6 text-center backdrop-blur-md animate-fade-in font-medium">
                    {message}
                </div>
            )}

            {viewState === 'otp' ? (
                /* ФОРМА ВВОДА КОДА */
                <form onSubmit={handleVerifyOtp} className="space-y-8 animate-slide-up">
                    <div className="space-y-4 text-center">
                        <label className="text-sm text-secondary/80 block">
                            Код отправлен на <br/> <span className="text-white font-bold">{email}</span>
                        </label>
                        
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 6) setOtp(val);
                                }}
                                className="w-full bg-[#2C2C2E] border border-white/10 rounded-[32px] p-5 text-white text-center text-4xl font-bold tracking-[0.4em] focus:outline-none focus:border-blue-500/50 focus:bg-[#3A3A3C] transition-all placeholder:text-white/5 font-mono shadow-inner"
                                placeholder="000000"
                                maxLength={6}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                autoFocus
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-[0.43em] pointer-events-none opacity-20 px-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`h-1 w-full rounded-full ${otp.length > i ? 'bg-blue-500' : 'bg-white'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full bg-[#30D158] hover:bg-[#28CD41] text-white py-4 rounded-[32px] font-bold text-[17px] transition-all shadow-lg shadow-green-500/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? 'Проверка...' : 'Подтвердить'}
                    </button>

                    <div className="text-center">
                        <button 
                            type="button"
                            onClick={() => {
                                setViewState('signup');
                                setError('');
                                setMessage('');
                            }}
                            className="text-secondary/40 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto py-2"
                        >
                            <Icon name="chevron-right" size={14} className="rotate-180"/>
                            <span>Свайпните вправо чтобы вернуться</span>
                        </button>
                    </div>
                </form>
            ) : (
                /* ФОРМА ВХОДА / РЕГИСТРАЦИИ */
                <form onSubmit={handleAuth} className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#2C2C2E]/80 border border-white/5 rounded-[28px] px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-[#3A3A3C] transition-all placeholder:text-white/20 font-medium"
                    placeholder="Email"
                    autoComplete="email"
                    />
                </div>
                <div className="space-y-1">
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#2C2C2E]/80 border border-white/5 rounded-[28px] px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-[#3A3A3C] transition-all placeholder:text-white/20 font-medium"
                    placeholder="Пароль"
                    minLength={6}
                    autoComplete="current-password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0A84FF] hover:bg-[#007AFF] text-white py-4 rounded-[32px] font-bold text-[17px] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            Загрузка...
                        </span>
                    ) : (viewState === 'login' ? 'Войти' : 'Получить код')}
                </button>
                </form>
            )}

            {viewState !== 'otp' && (
                <div className="mt-8 text-center animate-fade-in">
                    <p className="text-secondary/60 text-xs mb-3 font-medium">
                        {viewState === 'login' ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
                    </p>
                    <button 
                        onClick={() => {
                            setViewState(viewState === 'login' ? 'signup' : 'login');
                            setError('');
                            setMessage('');
                        }}
                        className="text-[#0A84FF] font-bold text-sm hover:text-blue-400 transition-colors bg-[#0A84FF]/10 px-6 py-2 rounded-full"
                    >
                        {viewState === 'login' ? 'Создать аккаунт' : 'Войти в систему'}
                    </button>
                </div>
            )}
        </GlassCard>
      </div>
    </div>
  );
};