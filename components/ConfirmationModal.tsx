import React from 'react';
import { Loader, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  isProcessing: boolean;
  colorClass: 'emerald' | 'orange' | 'blue' | 'red'; // Adicionei mais cores para ficar flexível
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, description, confirmText, isProcessing, colorClass 
}) => {
  if (!isOpen) return null;

  // Mapa de cores expandido para uso geral
  const colors = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700', icon: 'text-emerald-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', btn: 'bg-orange-600 hover:bg-orange-700', icon: 'text-orange-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', btn: 'bg-blue-600 hover:bg-blue-700', icon: 'text-blue-600' },
    red: { bg: 'bg-red-50', border: 'border-red-100', btn: 'bg-red-600 hover:bg-red-700', icon: 'text-red-600' }
  }[colorClass] || { bg: 'bg-gray-50', border: 'border-gray-100', btn: 'bg-gray-600', icon: 'text-gray-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className={`p-6 border-b ${colors.border} ${colors.bg}`}>
          <div className="flex justify-between items-start">
            <h3 className={`text-xl font-bold ${colors.icon}`}>{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-gray-600 text-lg leading-relaxed">
            {description}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${colors.btn}`}
          >
            {isProcessing ? <Loader className="animate-spin" size={20} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;