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
    <div className="min-h-screen bg-black text-white flex flex-col px-6 pt-24 pb-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="w-16 h-16 bg-[#1C1C1E] rounded-[18px] flex items-center justify-center mb-6 shadow-lg">
            <Icon name="dollar" size={32} className="text-[#0A84FF]" />
        </div>
        <h1 className="text-[34px] font-bold tracking-tight mb-2 leading-tight">
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
      <form onSubmit={viewState === 'otp' ? handleVerifyOtp : handleAuth} className="flex-1 flex flex-col">
          
          {/* Input Group - iOS Style */}
          <div className="bg-[#1C1C1E] rounded-[12px] overflow-hidden mb-6">
              {viewState !== 'otp' ? (
                  <>
                      <div className="relative">
                          <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="Email"
                              className="w-full bg-transparent p-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none"
                              required
                              autoComplete="email"
                          />
                          {/* Divider */}
                          <div className="absolute bottom-0 left-4 right-0 h-[0.5px] bg-[#38383A]"></div>
                      </div>
                      <div>
                          <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Пароль"
                              className="w-full bg-transparent p-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none"
                              required
                              minLength={6}
                              autoComplete="current-password"
                          />
                      </div>
                  </>
              ) : (
                  <div>
                       <input
                          type="text"
                          value={otp}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val.length <= 6) setOtp(val);
                          }}
                          placeholder="Код из письма"
                          className="w-full bg-transparent p-4 text-[17px] text-white placeholder-[#8E8E93] focus:outline-none text-center tracking-[0.2em] font-mono"
                          required
                          maxLength={6}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          autoFocus
                      />
                  </div>
              )}
          </div>

          {/* Error/Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-2">
                <Icon name="alert-circle" size={20} className="text-[#FF453A] shrink-0 mt-0.5" />
                <p className="text-[#FF453A] text-[15px] leading-snug">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-6 flex items-start gap-3 px-2">
                <Icon name="check-circle" size={20} className="text-[#30D158] shrink-0 mt-0.5" />
                <p className="text-[#30D158] text-[15px] leading-snug">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A84FF] text-white font-bold text-[17px] py-4 rounded-[14px] active:scale-[0.98] active:opacity-80 transition-all disabled:opacity-50 disabled:scale-100 mb-6 shadow-lg shadow-blue-500/20"
          >
              {loading ? 'Загрузка...' : (viewState === 'login' ? 'Войти' : viewState === 'signup' ? 'Продолжить' : 'Подтвердить')}
          </button>

          {/* Switch Mode Link */}
          <div className="mt-auto text-center space-y-4">
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
  );
};