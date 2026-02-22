import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { Icon } from '../components/ui/Icons';
import { ProfileBlock, MenuRow, ProfileActionButton } from '../components/ui/SettingsUI';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/ModalProvider';
import { LimitModal } from '../components/LimitModal';

export const Settings: React.FC = () => {
  const { user, signOut, uploadAvatar } = useStore();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsUploading(true);
      try {
          await uploadAvatar(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
          alert('Фото профиля обновлено');
      } catch (error) {
          console.error('Avatar upload failed', error);
          alert('Ошибка загрузки фото');
      } finally {
          setIsUploading(false);
      }
  };

  // Generate avatar initial or placeholder image
  const avatarUrl = user?.avatar_url || (user?.full_name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0A84FF&color=fff&size=256` 
    : 'https://ui-avatars.com/api/?name=User&background=random&size=256');

  return (
    <div className="space-y-6 relative">
      <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
      />

      <div className="space-y-6">
          
          {/* AVATAR HEADER - CLEAN (No Text) */}
          <div className="flex flex-col items-center pt-4 pb-4 relative">
              <div 
                  className="relative mb-4 group cursor-pointer active:scale-95 transition-transform"
                  onClick={handleAvatarClick}
              >
                  <div className="w-32 h-32 rounded-full overflow-hidden relative z-10 bg-black/20 border-2 border-white/10 shadow-2xl">
                      {isUploading ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
                              <Icon name="camera" color="white" />
                          </div>
                      )}
                      <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                  </div>
              </div>
              {/* Name and Email removed as requested */}
          </div>

          {/* MAIN SETTINGS */}
          <div>
              <ProfileBlock>
                  <MenuRow 
                    color="#0A84FF" 
                    icon="user" 
                    label="Личные данные" 
                    subLabel="Изменить"
                    onClick={() => {}} 
                  />
                  <MenuRow 
                    color="#BF5AF2" 
                    icon="file-text" 
                    label="Экспорт данных" 
                    subLabel="PDF" 
                    isLast 
                    onClick={() => {}} 
                  />
              </ProfileBlock>
          </div>

          {/* FINANCE SETTINGS */}
          <div>
              <ProfileBlock>
                  <MenuRow 
                    color="#30D158" 
                    icon="dollar" 
                    label="Валюта" 
                    subLabel="RUB (₽)" 
                    onClick={() => {}} 
                  />
                  <MenuRow 
                    color="#FF9F0A" 
                    icon="calendar" 
                    label="Начало месяца" 
                    subLabel="1-е число" 
                    onClick={() => {}} 
                  />
                  <MenuRow 
                    color="#FF453A" 
                    icon="trending-down" 
                    label="Лимит на месяц" 
                    subLabel={`${user?.monthly_limit?.toLocaleString('ru-RU') || 0} ₽`} 
                    isLast
                    onClick={() => showModal(<LimitModal />)} 
                  />
              </ProfileBlock>
          </div>

          {/* APP SETTINGS */}
          <div>
              <ProfileBlock>
                  <MenuRow 
                    color="#0A84FF" 
                    icon="smartphone" 
                    label="Тема оформления" 
                    subLabel="Dark iOS" 
                    onClick={() => {}} 
                  />
                  <MenuRow 
                    color="#FF375F" 
                    icon="bell" 
                    label="Уведомления" 
                    subLabel="Вкл" 
                    isLast 
                    onClick={() => {}} 
                  />
              </ProfileBlock>
          </div>

          {/* SECURITY & LOGOUT */}
          <div className="pt-2 space-y-4 pb-8">
              <ProfileBlock>
                <MenuRow 
                    color="#30D158" 
                    icon="shield" 
                    label="Безопасность" 
                    subLabel="Пароль"
                    onClick={() => {}} 
                />
                <MenuRow 
                    color="#FFD60A" 
                    icon="message" 
                    label="Поддержка" 
                    isLast 
                    onClick={() => {}} 
                />
              </ProfileBlock>

              <ProfileActionButton
                  onClick={signOut}
                  label="Выйти из аккаунта"
                  color="#FF3B30"
              />
          </div>

          <div className="text-center pb-4">
            <p className="text-xs text-neutral-500/40">FinTrack PWA v1.0.3</p>
          </div>
      </div>
    </div>
  );
};