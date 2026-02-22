import React, { useState } from 'react';
import { useStore } from '../store';
import { useModal } from './ModalProvider';
import { Icon } from './ui/Icons';

export const LimitModal: React.FC = () => {
    const { user, updateProfile } = useStore();
    const { hideModal } = useModal();
    const [limit, setLimit] = useState(user?.monthly_limit?.toString() || '50000');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ monthly_limit: Number(limit) });
            hideModal();
        } catch (error) {
            console.error('Failed to update limit', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Icon name="dollar" size={32} className="text-[#30D158]" />
            </div>
            <h2 className="text-[22px] font-bold mb-2 text-center">Лимит на месяц</h2>
            <p className="text-[15px] text-[#8E8E93] text-center mb-8">
                Установите сумму, которую вы планируете потратить в этом месяце.
            </p>

            <div className="w-full bg-[#1C1C1E] rounded-2xl p-4 mb-8 flex items-center justify-center">
                <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="bg-transparent text-center text-[32px] font-bold text-white focus:outline-none w-full"
                    placeholder="0"
                    autoFocus
                />
                <span className="text-[24px] text-[#8E8E93] ml-2">₽</span>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#0A84FF] text-white font-bold text-[17px] py-4 rounded-full active:scale-[0.98] active:opacity-80 transition-all disabled:opacity-50"
            >
                {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
        </div>
    );
};
