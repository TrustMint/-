import React from 'react';
import { useModal } from './ModalProvider';
import { Icon } from './ui/Icons';

interface ExportModalProps {
    fileUrl: string;
    fileName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ fileUrl, fileName }) => {
    const { hideModal } = useModal();

    return (
        <div className="p-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#1C1C1E] rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
                <Icon name="file-text" size={40} className="text-[#30D158]" />
            </div>
            
            <h2 className="text-[22px] font-bold mb-2 text-center text-white">Экспорт завершен</h2>
            
            <p className="text-[15px] text-[#8E8E93] text-center mb-6">
                Файл успешно сформирован и готов к загрузке.
            </p>

            <div className="w-full bg-[#1C1C1E] rounded-2xl p-4 mb-8 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 bg-[#30D158]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="list" size={20} className="text-[#30D158]" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[15px] font-medium text-white truncate">{fileName}</p>
                    <p className="text-[13px] text-[#8E8E93]">Таблица Excel (.xlsx)</p>
                </div>
            </div>

            <div className="w-full flex flex-col gap-3">
                <a
                    href={fileUrl}
                    download={fileName}
                    onClick={hideModal}
                    className="w-full bg-[#30D158] text-white font-bold text-[17px] py-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-500/20"
                >
                    <Icon name="download" size={20} />
                    <span>Скачать файл</span>
                </a>
                <button
                    onClick={hideModal}
                    className="w-full bg-[#2C2C2E] text-white font-bold text-[17px] py-4 rounded-full active:scale-[0.98] transition-transform"
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
};
