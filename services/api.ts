import axios from 'axios';
import { Member, Transaction, Event, Ministry, Scale, SmallGroup, PrayerRequest, Church, CheckoutResponse, CheckInKids, CheckInKidsRequest } from '../types';

export const api = axios.create({
  //baseURL: 'http://localhost:8080', 
  baseURL: 'https://ecclesiamanager-1098108839645.us-central1.run.app'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('church_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('church_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

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

  getPublicById: async (id: string) => {
    // Importante: certifique-se de que essa rota no seu Spring Boot 
    // está liberada no SecurityConfigurations (ex: /api/public/igrejas/{id})
    const response = await api.get<Church>(`/api/public/igrejas/${id}`);
    return response.data;
  },
};

export const memberApi = {
  getByChurchPaged: async (churchId: string, params: any) => {
    const response = await api.get(`/api/igrejas/${churchId}/membros/paginado`, {
      params: {
        page: params.page,
        size: params.size,
        nome: params.searchTerm,
        mesAniversario: params.month,
        genero: params.gender,
      }
    });
    return response.data;
  },

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

  createPublic: async (churchId: string, memberData: any) => {
    const response = await api.post(`/api/public/${churchId}/membros`, {
      ...memberData,
      igrejaId: churchId
    });
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

export const eventApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Event[]>(`/api/igrejas/${churchId}/eventos`);
    return response.data;
  },
  getById: async (churchId: string, eventId: string) => {
    const response = await api.get<Event>(`/api/igrejas/${churchId}/eventos/${eventId}`);
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

  createPaymentCheckout: async (churchId: string, eventId: string, data: { nome: string, email: string, telefone: string, cpf?: string, amount: number, numeroInscricao: string }) => {
    const response = await api.post<CheckoutResponse>(`/api/eventos/${eventId}/checkout`, data);
    return response.data;
  },

  updatePaymentMethod: async (churchId: string, eventId: string, registrationId: string, method: 'ONLINE' | 'DINHEIRO') => {
    const response = await api.put(`/api/igrejas/${churchId}/eventos/${eventId}/inscricoes/${registrationId}/pagamento`, {
      formaPagamento: method
    });
    return response.data;
  },

  confirmPayment: async (
    eventId: string,
    registrationId: string,
    data: { tipoValor: 'INTEGRAL' | 'PROMOCIONAL' }
  ) => {
    await api.put(`/api/inscricoes/confirmarPagamento/${eventId}/${registrationId}`, data);
  },
};

export const ministryApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Ministry[]>(`/api/igrejas/${churchId}/ministerios`);
    return response.data;
  },
  getById: async (churchId: string, ministryId: string) => {
    const response = await api.get<Ministry>(`/api/igrejas/${churchId}/ministerios/${ministryId}`);
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
    await api.delete(`/api/igrejas/${churchId}/ministerios/${ministryId}`);
  },
};

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
  getByChurch: async (churchId: string) => {
    const response = await api.get<Transaction[]>(`/api/igrejas/${churchId}/transacoes`);
    return response.data;
  },

  create: async (churchId: string, transaction: Partial<Transaction>) => {
    const response = await api.post<Transaction>(`/api/igrejas/${churchId}/transacoes`, transaction);
    return response.data;
  }
};

export const visitorApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Member[]>(`/api/igrejas/${churchId}/visitantes`);
    return response.data;
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
  },

  updateTrilha: async (churchId: string, id: string, data: any) => {
    const response = await api.put(`/api/igrejas/${churchId}/membros/${id}/trilha`, data);
    return response.data;
  },
};

export const kidsApi = {
  checkIn: async (churchId: string, data: CheckInKidsRequest) => {
    const response = await api.post(`/api/igrejas/${churchId}/kids/checkin`, data);
    return response.data;
  },

  listActive: async (churchId: string) => {
    const response = await api.get(`/api/igrejas/${churchId}/kids/ativos`);
    return response.data as CheckInKids[];
  },

  checkOut: async (churchId: string, checkInId: number) => {
    await api.post(`/api/igrejas/${churchId}/kids/checkout/${checkInId}`);
  }
};

export const userApi = {
  create: async (churchId: string, userData: any) => {
    const payload = { ...userData, igrejaId: churchId };
    const response = await api.post(`/api/igrejas/${churchId}/usuarios`, payload);
    return response.data;
  },
  getByChurch: async (churchId: string) => {
    const response = await api.get(`/api/igrejas/${churchId}/usuarios`);
    return response.data;
  },

  delete: async (churchId: string, userId: string) => {
    const response = await api.delete(`/api/igrejas/${churchId}/usuarios/${userId}`);
    return response.data;
  },

  update: async (churchId: string, userId: string, userData: any) => {
    const payload = { ...userData, igrejaId: churchId };
    const response = await api.put(`/api/igrejas/${churchId}/usuarios/${userId}`, payload);
    return response.data;
  },

  getRoles: async (churchId: string) => {
    const response = await api.get<string[]>(`/api/igrejas/${churchId}/usuarios/roles`); 
    return response.data;
  },
};

// ===== REPORT/EXPORT ENDPOINTS =====
export const reportApi = {
  // Exportar inscritos de um evento
  exportEventAttendees: async (eventId: string) => {
    // Importante: responseType 'blob' para arquivos binários
    const response = await api.get(`/api/relatorios/eventos/${eventId}/excel`, {
      responseType: 'blob'
    });
    return response;
  },

  // Futuramente:
  // exportFinancials: async (churchId: string, filters: any) => { ... }
};

export const auditApi = {
  getLogs: async (churchId: string, page: number = 0) => {
    const response = await api.get<any>(`/api/audit/${churchId}?page=${page}&size=20`);
    return response.data; // Retorna o objeto Page do Spring (content, totalPages, etc)
  }
};

export const dashboardApi = {
  getResumo: async (churchId: string) => {
    const response = await api.get(`/api/igrejas/${churchId}/dashboard`);
    return response.data;
  }
};

