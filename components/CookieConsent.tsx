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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 text-white p-6 z-50 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm md:text-base">
          <h4 className="font-bold mb-1">Sua privacidade é importante (LGPD)</h4>
          <p className="text-gray-300">
            Utilizamos cookies e tecnologias similares para melhorar a experiência e segurança do usuário. 
            Ao continuar navegando, você concorda com nossa política de privacidade e proteção de dados.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleAccept}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;