import React from 'react';
import { Calendar, Heart, MapPin, Clock, Instagram } from 'lucide-react';
import { Event, Church } from '../types'; // Importe Church

interface PublicHomeProps {
  events: Event[];
  church: Church; // Nova prop obrigatória
  onNavigateToEvents: () => void;
  onNavigateToRegistration: (event: Event) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ events, church, onNavigateToEvents, onNavigateToRegistration }) => {
  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section Dinâmico */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bem-vindo à {church.name}</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
            Uma comunidade de fé em {church.city}. Conecte-se conosco, participe de nossos eventos e faça parte desta família.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onNavigateToEvents}
              className="bg-white text-blue-800 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Ver Programação
            </button>
            
            {/* Botão do Instagram (Só aparece se a igreja tiver instagram) */}
            {church.instagram && (
              <a 
                href={`https://instagram.com/${church.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-pink-600 bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors"
              >
                <Instagram size={20} />
                Seguir no Instagram
              </a>
            )}
          </div>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Endereço Dinâmico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Onde Estamos</h3>
          <p className="text-gray-600">
            {church.address}<br />
            {church.city} - {church.state}
          </p>
        </div>

        {/* Card de Cultos (Ainda estático pois o Backend não tem tabela de horários de cultos) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nossos Cultos</h3>
          <ul className="text-gray-600 space-y-1">
            <li>Domingo: 10h e 19h</li>
            <li>Quarta-feira: 20h</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Contribua</h3>
          <p className="text-gray-600 mb-2">
            Faça parte desta obra.
          </p>
          <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 text-gray-500">
            {church.cnpj || 'PIX indisponível'}
          </div>
        </div>
      </div>

      {nextEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          <div className="bg-gray-100 md:w-1/3 flex flex-col items-center justify-center p-8 text-center border-b md:border-b-0 md:border-r border-gray-200">
            <Calendar size={48} className="text-blue-600 mb-2" />
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Próximo Evento</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">
               {new Date(nextEvent.dataEvento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </div>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{nextEvent.nomeEvento}</h3>
            <p className="text-gray-600 mb-4">{nextEvent.descricao}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
               <span className="flex items-center"><Clock size={16} className="mr-1" /> {nextEvent.horario}</span>
               <span className="flex items-center"><MapPin size={16} className="mr-1" /> {nextEvent.local}</span>
               {(nextEvent.preco || 0) > 0 && <span className="font-bold text-emerald-600">R$ {nextEvent.preco?.toFixed(2)}</span>}
            </div>
            <button 
              onClick={() => onNavigateToRegistration(nextEvent)}
              className="mt-6 w-fit text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center"
            >
              Inscrever-se agora &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHome;