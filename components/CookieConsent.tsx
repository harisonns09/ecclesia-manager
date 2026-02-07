import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lgpd-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md text-white p-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-500 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm md:text-base opacity-90">
          <h4 className="font-bold text-white mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
            Sua privacidade é prioridade
          </h4>
          <p className="text-slate-300 leading-relaxed max-w-3xl">
            Utilizamos cookies e tecnologias similares para melhorar a segurança e a sua experiência no sistema 
            <strong className="text-white ml-1">Ecclesia Manager</strong>. Ao continuar navegando, você concorda com nossa política de proteção de dados.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="w-full md:w-auto px-8 py-3 bg-white text-[#0f172a] font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;