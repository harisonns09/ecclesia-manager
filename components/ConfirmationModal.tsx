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
  colorClass: 'emerald' | 'orange' | 'blue' | 'red';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, description, confirmText, isProcessing, colorClass 
}) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (colorClass) {
        case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200';
        case 'orange': return 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200';
        case 'red': return 'bg-red-600 hover:bg-red-700 text-white shadow-red-200';
        case 'blue': default: return 'btn-primary';
    }
  };

  const getHeaderStyles = () => {
    switch (colorClass) {
        case 'emerald': return 'bg-emerald-50 border-emerald-100 text-emerald-800';
        case 'orange': return 'bg-orange-50 border-orange-100 text-orange-800';
        case 'red': return 'bg-red-50 border-red-100 text-red-800';
        case 'blue': default: return 'bg-gray-50 border-gray-100 text-[#1e3a8a]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="premium-card w-full max-w-md !p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-0">
        
        <div className={`p-6 border-b flex justify-between items-start ${getHeaderStyles()}`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/5"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8">
          <div className="text-gray-600 text-lg leading-relaxed">
            {description}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-4">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="btn-secondary flex-1 justify-center !text-gray-600 !border-gray-300 hover:!bg-gray-50"
          >
            Cancelar
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${getButtonStyles()}`}
          >
            {isProcessing ? <Loader className="animate-spin" size={20} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;