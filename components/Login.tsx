import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import api from '../services/api';

interface LoginProps {
  onLogin: (status: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      // Faz a chamada real ao Backend
      const response = await api.post('/api/auth/login', {
        login: email,    // Ajuste conforme seu DTO no Java (AuthenticationDTO)
        password: password
      });

      // O backend deve retornar o token (ex: response.data.token)
      const token = response.data.token;

      if (token) {
        localStorage.setItem('church_token', token); // Salva o token
        onLogin(true); // Atualiza o estado da App para "logado"
      }
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Área Administrativa</h2>
          <p className="text-blue-100 mt-2">Acesso restrito à liderança</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Entrar no Sistema
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Este sistema é protegido e monitorado. O acesso não autorizado é proibido.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;