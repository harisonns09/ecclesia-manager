import axios from 'axios';
import { Member, Transaction, Event, Ministry, Scale, SmallGroup, PrayerRequest, Church, CheckoutResponse } from '../types';

const api = axios.create({
  // O endereço onde seu Spring Boot está rodando
  //baseURL: 'http://localhost:8080', 
  //baseURL: 'https://gen-lang-client-0788356664.rj.r.appspot.com',
baseURL: 'https://ecclesiamanager-1098108839645.us-central1.run.app'
});

// Interceptador para adicionar o Token automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('church_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // Se der sucesso, só retorna
  (error) => {
    // Verifica se o erro é 401 (Não autorizado) ou 403 (Proibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // Evita loop infinito se o erro for na própria rota de login
      if (!window.location.pathname.includes('/login')) {
          console.warn('Sessão expirada. Redirecionando para login...');
          
          // Remove o token inválido
          localStorage.removeItem('church_token');
          
          // Força o redirecionamento para a tela de login
          // Usamos window.location.href para garantir um refresh limpo do estado
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
 
export default api;

// ===== AUTHENTICATION ENDPOINTS =====
export const authApi = {
  login: async (login: string, password: string) => {
    const response = await api.post('/api/auth/login', { login, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

// ===== CHURCH ENDPOINTS =====
export const churchApi = {
  getAll: async () => {
    const response = await api.get<Church[]>('/api/igrejas');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Church>(`/api/igrejas/${id}`);
    return response.data;
  },
  create: async (church: Omit<Church, 'id'>) => {
    const response = await api.post<Church>('/api/igrejas', church);
    return response.data;
  },
  update: async (id: string, church: Partial<Church>) => {
    const response = await api.put<Church>(`/api/igrejas/${id}`, church);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/igrejas/${id}`);
  },
};

// ===== MEMBER ENDPOINTS =====
export const memberApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Member[]>(`/api/igrejas/${churchId}/membros`);
    return response.data;
  },
  getById: async (churchId: string, memberId: string) => {
    const response = await api.get<Member>(`/api/igrejas/${churchId}/membros/${memberId}`);
    return response.data;
  },
  create: async (churchId: string, member: Omit<Member, 'id'>) => {
    const response = await api.post<Member>(`/api/igrejas/${churchId}/membros`, member);
    return response.data;
  },
  update: async (churchId: string, memberId: string, member: Partial<Member>) => {
    const response = await api.put<Member>(`/api/igrejas/${churchId}/membros/${memberId}`, member);
    return response.data;
  },
  delete: async (churchId: string, memberId: string) => {
    await api.delete(`/api/igrejas/${churchId}/membros/${memberId}`);
  },
};

// ===== TRANSACTION ENDPOINTS =====
export const transactionApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Transaction[]>(`/api/igrejas/${churchId}/transactions`);
    return response.data;
  },
  getById: async (churchId: string, transactionId: string) => {
    const response = await api.get<Transaction>(`/api/igrejas/${churchId}/transactions/${transactionId}`);
    return response.data;
  },
  create: async (churchId: string, transaction: Omit<Transaction, 'id'>) => {
    const response = await api.post<Transaction>(`/api/igrejas/${churchId}/transactions`, transaction);
    return response.data;
  },
  update: async (churchId: string, transactionId: string, transaction: Partial<Transaction>) => {
    const response = await api.put<Transaction>(`/api/igrejas/${churchId}/transactions/${transactionId}`, transaction);
    return response.data;
  },
  delete: async (churchId: string, transactionId: string) => {
    await api.delete(`/api/igrejas/${churchId}/transactions/${transactionId}`);
  },
};

// ===== EVENT ENDPOINTS =====
export const eventApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Event[]>(`/api/igrejas/${churchId}/eventos`);
    return response.data;
  },
  getById: async (churchId: string, eventId: string) => {
    const response = await api.get<Event>(`/api/eventos/${eventId}`);
    return response.data;
  },
  create: async (churchId: string, event: Partial<Event>) => {
    const payload = {
        ...event,
        igrejaId: Number(churchId)
    };
    const response = await api.post<Event>(`/api/igrejas/${churchId}/eventos`, payload);
    return response.data;
  },
  update: async (churchId: string, eventId: string, event: Partial<Event>) => {
    const response = await api.put<Event>(`/api/igrejas/${churchId}/eventos/${eventId}`, event);
    return response.data;
  },
  delete: async (churchId: string, eventId: string) => {
    await api.delete(`/api/igrejas/${churchId}/eventos/${eventId}`);
  },
  
  register: async (eventId: string, data: { nome: string, email: string, telefone: string, cpf?: string }) => {
     const response = await api.post(`/api/eventos/${eventId}/inscricao`, data);
     return response.data;
  },

  // Solicita ao Backend que crie um link de checkout na InfinitePay
  createPaymentCheckout: async (churchId: string, eventId: string, data: { nome: string, email: string, telefone: string, cpf?: string, amount: number, numeroInscricao: string }) => {
    // POST para o seu backend Java
    const response = await api.post<CheckoutResponse>(`/api/eventos/${eventId}/checkout`, data);
    return response.data;
  },

  updatePaymentMethod: async (churchId: string, eventId: string, registrationId: string, method: 'ONLINE' | 'DINHEIRO') => {
    const response = await api.put(`/api/igrejas/${churchId}/eventos/${eventId}/inscricoes/${registrationId}/pagamento`, { 
        formaPagamento: method 
    });
    return response.data;
  },

  confirmPayment: async ( eventId: string, registrationId: string) => {
    await api.put(`/api/inscricoes/confirmarPagamento/${eventId}/${registrationId}`);
  },
};

// ===== MINISTRY ENDPOINTS =====
export const ministryApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Ministry[]>(`/api/igrejas/${churchId}/ministerios`);
    return response.data;
  },
  getById: async (churchId: string, ministryId: string) => {
    const response = await api.get<Ministry>(`/api/igrejas/${churchId}/ministerio/${ministryId}`);
    return response.data;
  },
  create: async (churchId: string, ministry: Omit<Ministry, 'id'>) => {
    const response = await api.post<Ministry>(`/api/igrejas/${churchId}/ministerios`, ministry);
    return response.data;
  },
  update: async (churchId: string, ministryId: string, ministry: Partial<Ministry>) => {
    const response = await api.put<Ministry>(`/api/igrejas/${churchId}/ministerios/${ministryId}`, ministry);
    return response.data;
  },
  delete: async (churchId: string, ministryId: string) => {
    await api.delete(`/api/igrejas/${churchId}/ministerio/${ministryId}`);
  },
};

// ===== SCALE ENDPOINTS =====
export const scaleApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Scale[]>(`/api/igrejas/${churchId}/scales`);
    return response.data;
  },
  getById: async (churchId: string, scaleId: string) => {
    const response = await api.get<Scale>(`/api/igrejas/${churchId}/scales/${scaleId}`);
    return response.data;
  },
  create: async (churchId: string, scale: Omit<Scale, 'id'>) => {
    const response = await api.post<Scale>(`/api/igrejas/${churchId}/scales`, scale);
    return response.data;
  },
  update: async (churchId: string, scaleId: string, scale: Partial<Scale>) => {
    const response = await api.put<Scale>(`/api/igrejas/${churchId}/scales/${scaleId}`, scale);
    return response.data;
  },
  delete: async (churchId: string, scaleId: string) => {
    await api.delete(`/api/igrejas/${churchId}/scales/${scaleId}`);
  },
};

// ===== SMALL GROUP ENDPOINTS =====
export const smallGroupApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<SmallGroup[]>(`/api/igrejas/${churchId}/celulas`);
    return response.data;
  },
  getById: async (churchId: string, groupId: string) => {
    const response = await api.get<SmallGroup>(`/api/igrejas/${churchId}/celula/${groupId}`);
    return response.data;
  },
  create: async (churchId: string, group: Partial<SmallGroup>) => {
    const payload = { ...group, igrejaId: Number(churchId) };
    const response = await api.post<SmallGroup>(`/api/igrejas/${churchId}/celulas`, payload);
    return response.data;
  },
  update: async (churchId: string, groupId: string, group: Partial<SmallGroup>) => {
    const payload = { ...group, igrejaId: Number(churchId) };
    const response = await api.put<SmallGroup>(`/api/igrejas/${churchId}/celula/${groupId}`, payload);
    return response.data;
  },
  delete: async (churchId: string, groupId: string) => {
    await api.delete(`/api/igrejas/${churchId}/celula/${groupId}`);
  },
};

// ===== PRAYER REQUEST ENDPOINTS =====
export const prayerRequestApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<PrayerRequest[]>(`/api/igrejas/${churchId}/prayer-requests`);
    return response.data;
  },
  getById: async (churchId: string, requestId: string) => {
    const response = await api.get<PrayerRequest>(`/api/igrejas/${churchId}/prayer-requests/${requestId}`);
    return response.data;
  },
  create: async (churchId: string, request: Omit<PrayerRequest, 'id'>) => {
    const response = await api.post<PrayerRequest>(`/api/igrejas/${churchId}/prayer-requests`, request);
    return response.data;
  },
  update: async (churchId: string, requestId: string, request: Partial<PrayerRequest>) => {
    const response = await api.put<PrayerRequest>(`/api/igrejas/${churchId}/prayer-requests/${requestId}`, request);
    return response.data;
  },
  delete: async (churchId: string, requestId: string) => {
    await api.delete(`/api/igrejas/${churchId}/prayer-requests/${requestId}`);
  },
};

export const inscricaoApi = {
  getRegistrationStatus: async (id: string) => {
    const response = await api.get(`/api/inscricoes/${id}`);
    return response.data;
  }
};

export const financialApi = {
  // Buscar todas as transações de uma igreja
  getByChurch: async (churchId: string) => {
    const response = await api.get<Transaction[]>(`/api/igrejas/${churchId}/transacoes`);
    return response.data;
  },

  // Criar uma nova transação
  create: async (churchId: string, transaction: Partial<Transaction>) => {
    const response = await api.post<Transaction>(`/api/igrejas/${churchId}/transacoes`, transaction);
    return response.data;
  }
};

export const visitorApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Member[]>(`/api/igrejas/${churchId}/visitantes`);
    return response.data;
    
    // MOCK TEMPORÁRIO PARA VOCÊ TESTAR VISUALMENTE
    return [
      { id: '1', churchId, name: 'Carlos Eduardo', phone: '(11) 99999-9999', visitDate: '2023-10-25', status: 'Visitante', observation: 'Veio convidado pelo Pedro.' },
      { id: '2', churchId, name: 'Ana Clara', phone: '(11) 98888-8888', visitDate: '2023-10-20', status: 'Em Acompanhamento', observation: 'Gostou muito do louvor.' },
    ] as any[]; 
  },

  create: async (churchId: string, visitor: any) => {
    const response = await api.post(`/api/public/visitantes`, {
        ...visitor,
        igrejaId: churchId
    });
    return response.data;
  },

  update: async (churchId: string, visitorId: string, visitor: Partial<any>) => {
    const response = await api.put<any>(`/api/igrejas/${churchId}/visitantes/${visitorId}`, visitor);
    return response.data;
  },

  delete: async (churchId: string, visitorId: string) => {
    await api.delete(`/api/igrejas/${churchId}/visitantes/${visitorId}`);
  }
};