import axios from 'axios';
import { Member, Transaction, Event, Ministry, Scale, SmallGroup, PrayerRequest, Church } from '../types';

const api = axios.create({
  // O endereço onde seu Spring Boot está rodando
  baseURL: 'http://localhost:8080', 
});

// Interceptador para adicionar o Token automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('church_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// ===== AUTHENTICATION ENDPOINTS =====
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
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
    const response = await api.get<Church>(`/api/igreja/${id}`);
    return response.data;
  },
  create: async (church: Omit<Church, 'id'>) => {
    const response = await api.post<Church>('/api/igrejas', church);
    return response.data;
  },
  update: async (id: string, church: Partial<Church>) => {
    const response = await api.put<Church>(`/api/igreja/${id}`, church);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/igreja/${id}`);
  },
};

// ===== MEMBER ENDPOINTS =====
export const memberApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Member[]>(`/api/churches/${churchId}/membros`);
    return response.data;
  },
  getById: async (churchId: string, memberId: string) => {
    const response = await api.get<Member>(`/api/churches/${churchId}/membro/${memberId}`);
    return response.data;
  },
  create: async (churchId: string, member: Omit<Member, 'id'>) => {
    const response = await api.post<Member>(`/api/churches/${churchId}/membros`, member);
    return response.data;
  },
  update: async (churchId: string, memberId: string, member: Partial<Member>) => {
    const response = await api.put<Member>(`/api/churches/${churchId}/membro/${memberId}`, member);
    return response.data;
  },
  delete: async (churchId: string, memberId: string) => {
    await api.delete(`/api/churches/${churchId}/membro/${memberId}`);
  },
};

// ===== TRANSACTION ENDPOINTS =====
export const transactionApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Transaction[]>(`/api/churches/${churchId}/transactions`);
    return response.data;
  },
  getById: async (churchId: string, transactionId: string) => {
    const response = await api.get<Transaction>(`/api/churches/${churchId}/transactions/${transactionId}`);
    return response.data;
  },
  create: async (churchId: string, transaction: Omit<Transaction, 'id'>) => {
    const response = await api.post<Transaction>(`/api/churches/${churchId}/transactions`, transaction);
    return response.data;
  },
  update: async (churchId: string, transactionId: string, transaction: Partial<Transaction>) => {
    const response = await api.put<Transaction>(`/api/churches/${churchId}/transactions/${transactionId}`, transaction);
    return response.data;
  },
  delete: async (churchId: string, transactionId: string) => {
    await api.delete(`/api/churches/${churchId}/transactions/${transactionId}`);
  },
};

// ===== EVENT ENDPOINTS =====
export const eventApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Event[]>(`/api/igreja/${churchId}/eventos`);
    return response.data;
  },
  getById: async (churchId: string, eventId: string) => {
    const response = await api.get<Event>(`/api/igreja/${churchId}/evento/${eventId}`);
    return response.data;
  },
  create: async (churchId: string, event: Partial<Event>) => {
    const payload = {
        ...event,
        igrejaId: Number(churchId)
    };
    const response = await api.post<Event>(`/api/igreja/${churchId}/eventos`, payload);
    return response.data;
  },
  update: async (churchId: string, eventId: string, event: Partial<Event>) => {
    const response = await api.put<Event>(`/api/igreja/${churchId}/evento/${eventId}`, event);
    return response.data;
  },
  delete: async (churchId: string, eventId: string) => {
    await api.delete(`/api/igreja/${churchId}/evento/${eventId}`);
  },
  
  register: async (churchId: string, eventId: string, data: { name: string, email: string, phone: string }) => {
     const response = await api.post(`/api/igreja/${churchId}/evento/${eventId}/inscricao`, data);
     return response.data;
  }
};

// ===== MINISTRY ENDPOINTS =====
export const ministryApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Ministry[]>(`/api/churches/${churchId}/ministerios`);
    return response.data;
  },
  getById: async (churchId: string, ministryId: string) => {
    const response = await api.get<Ministry>(`/api/churches/${churchId}/ministerio/${ministryId}`);
    return response.data;
  },
  create: async (churchId: string, ministry: Omit<Ministry, 'id'>) => {
    const response = await api.post<Ministry>(`/api/churches/${churchId}/ministerios`, ministry);
    return response.data;
  },
  update: async (churchId: string, ministryId: string, ministry: Partial<Ministry>) => {
    const response = await api.put<Ministry>(`/api/churches/${churchId}/ministerio/${ministryId}`, ministry);
    return response.data;
  },
  delete: async (churchId: string, ministryId: string) => {
    await api.delete(`/api/churches/${churchId}/ministerio/${ministryId}`);
  },
};

// ===== SCALE ENDPOINTS =====
export const scaleApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<Scale[]>(`/api/churches/${churchId}/scales`);
    return response.data;
  },
  getById: async (churchId: string, scaleId: string) => {
    const response = await api.get<Scale>(`/api/churches/${churchId}/scales/${scaleId}`);
    return response.data;
  },
  create: async (churchId: string, scale: Omit<Scale, 'id'>) => {
    const response = await api.post<Scale>(`/api/churches/${churchId}/scales`, scale);
    return response.data;
  },
  update: async (churchId: string, scaleId: string, scale: Partial<Scale>) => {
    const response = await api.put<Scale>(`/api/churches/${churchId}/scales/${scaleId}`, scale);
    return response.data;
  },
  delete: async (churchId: string, scaleId: string) => {
    await api.delete(`/api/churches/${churchId}/scales/${scaleId}`);
  },
};

// ===== SMALL GROUP ENDPOINTS =====
export const smallGroupApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<SmallGroup[]>(`/api/churches/${churchId}/small-groups`);
    return response.data;
  },
  getById: async (churchId: string, groupId: string) => {
    const response = await api.get<SmallGroup>(`/api/churches/${churchId}/small-groups/${groupId}`);
    return response.data;
  },
  create: async (churchId: string, group: Omit<SmallGroup, 'id'>) => {
    const response = await api.post<SmallGroup>(`/api/churches/${churchId}/small-groups`, group);
    return response.data;
  },
  update: async (churchId: string, groupId: string, group: Partial<SmallGroup>) => {
    const response = await api.put<SmallGroup>(`/api/churches/${churchId}/small-groups/${groupId}`, group);
    return response.data;
  },
  delete: async (churchId: string, groupId: string) => {
    await api.delete(`/api/churches/${churchId}/small-groups/${groupId}`);
  },
};

// ===== PRAYER REQUEST ENDPOINTS =====
export const prayerRequestApi = {
  getByChurch: async (churchId: string) => {
    const response = await api.get<PrayerRequest[]>(`/api/churches/${churchId}/prayer-requests`);
    return response.data;
  },
  getById: async (churchId: string, requestId: string) => {
    const response = await api.get<PrayerRequest>(`/api/churches/${churchId}/prayer-requests/${requestId}`);
    return response.data;
  },
  create: async (churchId: string, request: Omit<PrayerRequest, 'id'>) => {
    const response = await api.post<PrayerRequest>(`/api/churches/${churchId}/prayer-requests`, request);
    return response.data;
  },
  update: async (churchId: string, requestId: string, request: Partial<PrayerRequest>) => {
    const response = await api.put<PrayerRequest>(`/api/churches/${churchId}/prayer-requests/${requestId}`, request);
    return response.data;
  },
  delete: async (churchId: string, requestId: string) => {
    await api.delete(`/api/churches/${churchId}/prayer-requests/${requestId}`);
  },
};