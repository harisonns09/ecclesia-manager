import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Loader } from 'lucide-react';
import { authApi } from '../services/api'; // Usando o serviço padronizado

interface LoginProps {
  onLogin: (user: any) => void; // Alterado para aceitar objeto de usuário
  onBack: () => void;           // Adicionado onBack
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
      // Chama a API de login
      const data = await authApi.login(login, password);

      // O backend retorna o token
      const token = data.token;

      if (token) {
        localStorage.setItem('church_token', token);
        
        // Se o backend retornar dados do usuário, use-os. 
        // Caso contrário, montamos um objeto básico com o email digitado
        // para que a Sidebar não quebre ao tentar ler o nome.
        const userData = {
            name: data.nome || login.split('@')[0], // Tenta usar nome do backend ou parte do username
            login: login,
            role: 'ADMIN' // Assume admin por enquanto
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Botão de Voltar para Home Pública */}
      <div className="w-full max-w-md mb-6 flex items-center">
        <button 
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
        >
            <ArrowLeft size={20} className="mr-2" />
            Voltar para Início
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Área Administrativa</h2>
          <p className="text-blue-100 opacity-90">Acesso restrito à liderança</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Usuário / Email</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@ecclesia.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="animate-spin" size={24} /> : 'Entrar no Sistema'}
          </button>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">
                Este sistema é protegido e monitorado.<br/>
                O acesso não autorizado é proibido.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;