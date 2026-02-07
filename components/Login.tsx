import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Loader, Church } from 'lucide-react';
import { authApi } from '../services/api';

interface LoginProps {
  onLogin: (user: any) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authApi.login(login, password);
      const token = data.token;

      if (token) {
        localStorage.setItem('church_token', token);
        const userData = {
            name: data.nome || login.split('@')[0],
            login: login,
            role: 'ADMIN'
        };
        onLogin(userData); 
      } else {
        setError('Token inválido recebido do servidor.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#1e3a8a]"></div>
         <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white opacity-5 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-[#1e3a8a]/20 border border-white/20 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors flex items-center text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </button>

          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
             <Church size={32} className="text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Área Administrativa</h2>
          <p className="text-blue-100 opacity-80 text-sm">Acesso restrito à liderança</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Usuário / Email</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e3a8a] transition-colors" size={20} />
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input-field !pl-12 !py-3.5 bg-gray-50 focus:bg-white"
                placeholder="admin@ecclesia.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e3a8a] transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field !pl-12 !py-3.5 bg-gray-50 focus:bg-white"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-[#172554] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader className="animate-spin" size={24} /> : 'Entrar no Sistema'}
          </button>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
                Este sistema é monitorado.<br/>
                O acesso não autorizado é proibido.
            </p>
          </div>
        </form>
      </div>
      
      <p className="absolute bottom-6 text-gray-400 text-xs opacity-60">
        © 2024 Ecclesia Manager System
      </p>
    </div>
  );
};

export default Login;