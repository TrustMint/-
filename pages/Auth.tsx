import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from '../components/ui/Icons';

export const Auth: React.FC = () => {
  const [viewState, setViewState] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Icon name="dollar" size={36} className="text-[#0A84FF]" />
          </div>
          <h1 className="text-[34px] font-bold tracking-tight mb-3 leading-tight">
              {viewState === 'login' ? 'Вход' : viewState === 'signup' ? 'Регистрация' : 'Подтверждение'}
          </h1>
          <p className="text-[17px] text-[#8E8E93] leading-snug">
              {viewState === 'login' 
                  ? 'Войдите в свой аккаунт, чтобы продолжить работу.' 
                  : viewState === 'signup' 
                      ? 'Создайте аккаунт, чтобы начать вести учет финансов.' 
                      : `Мы отправили код подтверждения на ${email}`}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={viewState === 'otp' ? handleVerifyOtp : handleAuth} className="w-full flex flex-col items-center">
            
            {/* Input Group - Fully Rounded */}
            <div className="w-full space-y-4 mb-6">
                {viewState !== 'otp' ? (
                    <>
                        <div className="relative flex items-center">
                            <div className="absolute left-5 text-[#8E8E93]">
                                <Icon name="mail" size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full bg-[#1C1C1E] rounded-full pl-12 pr-12 py-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none text-left"
                                required
                                autoComplete="email"
                            />
                            {email && (
                                <button
                                    type="button"
                                    onClick={() => setEmail('')}
                                    className="absolute right-4 w-[20px] h-[20px] flex items-center justify-center rounded-full bg-white/10 transition-transform active:scale-90 hover:bg-white/20"
                                >
                                    <svg width="8" height="8" viewBox="0 0 14 14" fill="none" className="text-white/60">
                                        <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <div className="absolute left-5 text-[#8E8E93]">
                                <Icon name="lock" size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Пароль"
                                className="w-full bg-[#1C1C1E] rounded-full pl-12 pr-20 py-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none text-left"
                                required
                                minLength={6}
                                autoComplete="current-password"
                            />
                            <div className="absolute right-4 flex items-center gap-2">
                                {password && (
                                    <button
                                        type="button"
                                        onClick={() => setPassword('')}
                                        className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-white/10 transition-transform active:scale-90 hover:bg-white/20"
                                    >
                                        <svg width="8" height="8" viewBox="0 0 14 14" fill="none" className="text-white/60">
                                            <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[#8E8E93] hover:text-white transition-colors active:scale-90"
                                >
                                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <input
                        type="text"
                        value={otp}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 6) setOtp(val);
                        }}
                        placeholder="Код из письма"
                        className="w-full bg-[#1C1C1E] rounded-full px-6 py-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none text-center tracking-[0.2em] font-mono"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                    />
                )}
            </div>

            {/* Error/Message */}
            {error && (
              <div className="mb-6 flex items-center justify-center gap-2 px-4 w-full">
                  <Icon name="alert-circle" size={20} className="text-[#FF453A] shrink-0" />
                  <p className="text-[#FF453A] text-[15px] leading-snug text-center">{error}</p>
              </div>
            )}
            {message && (
              <div className="mb-6 flex items-center justify-center gap-2 px-4 w-full">
                  <Icon name="check-circle" size={20} className="text-[#30D158] shrink-0" />
                  <p className="text-[#30D158] text-[15px] leading-snug text-center">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A84FF] text-white font-bold text-[17px] py-4 rounded-full active:scale-[0.98] active:opacity-80 transition-all disabled:opacity-50 disabled:scale-100 mb-8 shadow-lg shadow-blue-500/20"
            >
                {loading ? 'Загрузка...' : (viewState === 'login' ? 'Войти' : viewState === 'signup' ? 'Продолжить' : 'Подтвердить')}
            </button>

            {/* Switch Mode Link */}
            <div className="text-center space-y-4">
                {viewState !== 'otp' && (
                    <button
                        type="button"
                        onClick={() => {
                            setViewState(viewState === 'login' ? 'signup' : 'login');
                            setError('');
                            setMessage('');
                        }}
                        className="text-[#0A84FF] text-[17px] font-medium active:opacity-60 transition-opacity"
                    >
                        {viewState === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </button>
                )}
                
                {viewState === 'otp' && (
                    <button
                        type="button"
                        onClick={() => {
                            setViewState('signup');
                            setError('');
                            setMessage('');
                        }}
                        className="text-[#0A84FF] text-[17px] font-medium active:opacity-60 transition-opacity"
                    >
                        Вернуться к регистрации
                    </button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
};