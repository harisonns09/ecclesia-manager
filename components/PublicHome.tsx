import React, { useState, useEffect } from 'react';
import { Calendar, Heart, MapPin, Clock, Instagram, ArrowRight } from 'lucide-react';
import { Event } from '../types';
import { eventApi } from '../services/api';
import { useApp } from '../contexts/AppContext'; // Contexto
import { useNavigate } from 'react-router-dom';

// Sem props!
const PublicHome: React.FC = () => {
  const navigate = useNavigate();
  const { currentChurch: church } = useApp();
  const [events, setEvents] = useState<Event[]>([]);

  // Carrega eventos (apenas os futuros)
  useEffect(() => {
    if (church) {
      loadEvents();
    }
  }, [church]);

  const loadEvents = async () => {
    if (!church) return;
    try {
      const data = await eventApi.getByChurch(church.id);
      // Filtra apenas eventos futuros e ordena
      const upcoming = data
        .filter(e => new Date(e.dataEvento) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a: any, b: any) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
      
      setEvents(upcoming);
    } catch (err) {
      console.error("Erro ao carregar eventos da home:", err);
    }
  };

  const nextEvent = events.length > 0 ? events[0] : null;

  if (!church) return null;

  return (
    <div className="space-y-12 pb-12 fade-in-up">
      
      {/* --- HERO SECTION --- */}
      <div className="hero-gradient p-8 md:p-16 mx-4 lg:mx-0">
        <div className="hero-overlay"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="badge badge-outline-white mb-6">
              Bem-vindo
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {church.name}
          </h1>
          
          <p className="text-lg md:text-xl text-indigo-100 mb-10 leading-relaxed">
              Uma comunidade de fé em <strong>{church.city}</strong>. Conecte-se conosco, participe de nossos eventos e faça parte desta família.
          </p>
          
          <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/eventos')} className="btn-secondary text-indigo-900 shadow-lg">
                Ver Programação <ArrowRight size={18} />
              </button>
              
              {church.instagram && (
                <a 
                  href={`https://instagram.com/${church.instagram.replace('@', '')}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: 'linear-gradient(to right, #ec4899, #8b5cf6)' }}
                >
                   <Instagram size={20} className="mr-2" />
                   Seguir no Instagram
                </a>
              )}
          </div>
        </div>
      </div>

      {/* --- GRID DE INFORMAÇÕES --- */}
      <div className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card: Onde Estamos */}
            <div className="premium-card p-8">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                    <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Onde Estamos</h3>
                <p className="text-gray-500">
                    {church.address}<br />
                    {church.city} - {church.state}
                </p>
            </div>

            {/* Card: Cultos */}
            <div className="premium-card p-8">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nossos Cultos</h3>
                <ul className="text-gray-500 space-y-2">
                    <li>Domingo: 10h e 19h</li>
                    <li>Quarta-feira: 20h</li>
                </ul>
            </div>

            {/* Card: Contribua */}
            <div className="premium-card p-8 relative">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mb-6">
                    <Heart size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contribua</h3>
                <p className="text-gray-500 mb-4 text-sm">Faça parte desta obra.</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono text-gray-600">
                    {church.cnpj || 'PIX indisponível'}
                </div>
            </div>
        </div>
      </div>

      {/* --- PRÓXIMO EVENTO --- */}
      {nextEvent && (
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pl-2 border-l-4 border-indigo-600">
                Em Destaque
            </h2>

            <div className="premium-card flex flex-col md:flex-row">
                {/* Data Lateral */}
                <div className="bg-indigo-600 md:w-1/4 p-10 flex flex-col items-center justify-center text-white text-center">
                    <Calendar size={40} className="mb-4 opacity-80" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Próximo</span>
                    <div className="text-5xl font-extrabold">
                        {new Date(nextEvent.dataEvento).getDate()}
                    </div>
                    <div className="text-lg font-medium opacity-90">
                        {new Date(nextEvent.dataEvento).toLocaleDateString('pt-BR', { month: 'long' })}
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="mb-3">
                          <span className="badge badge-indigo">
                            {nextEvent.ministerioResponsavel || 'Geral'}
                          </span>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {nextEvent.nomeEvento}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                        {nextEvent.descricao}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                        <span className="flex items-center"><Clock size={18} className="mr-2 text-indigo-500"/> {nextEvent.horario}</span>
                        <span className="flex items-center"><MapPin size={18} className="mr-2 text-indigo-500"/> {nextEvent.local}</span>
                    </div>

                    <div>
                        <button 
                            onClick={() => navigate(`/evento/${nextEvent.id}/inscricao`)}
                            className="btn-primary"
                        >
                            Inscrever-se Agora <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PublicHome;