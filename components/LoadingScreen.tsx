import { Loader } from 'lucide-react';

const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50/50">
    <Loader className="animate-spin text-blue-600 mb-4" size={48} />
    <p className="text-gray-500 font-medium animate-pulse">Carregando módulo...</p>
  </div>
);

export default LoadingScreen;