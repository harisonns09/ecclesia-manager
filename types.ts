export interface Church {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  themeColor: string; // Hex code for branding
}

export enum MemberStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  VISITOR = 'Visitante'
}

export interface Member {
  id: string;
  churchId: string; // Multi-tenancy link
  name: string;
  email: string;
  phone: string;
  role: string;
  status: MemberStatus;
  joinDate: string;
  birthDate?: string; // New field
}

export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída'
}

export enum TransactionCategory {
  TITHE = 'Dízimo',
  OFFERING = 'Oferta',
  RENT = 'Aluguel',
  UTILITIES = 'Utilidades',
  SALARY = 'Salário',
  MAINTENANCE = 'Manutenção',
  OTHER = 'Outros'
}

export interface Transaction {
  id: string;
  churchId: string; // Multi-tenancy link
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
}

export interface EventRegistration {
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
}

export interface Event {
  id: string;
  churchId: string; // Multi-tenancy link
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  price?: number;
  registrations?: EventRegistration[]; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// New Types for Ministries
export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  leaderName: string;
  description: string;
  color: string;
}

export interface Scale {
  id: string;
  churchId: string;
  ministryId: string;
  date: string;
  title: string; // e.g., "Culto de Domingo"
  volunteers: string[]; // List of Member IDs
}

// New Types for Small Groups (Cells)
export interface SmallGroup {
  id: string;
  churchId: string;
  name: string;
  leaderName: string;
  hostName: string;
  address: string;
  dayOfWeek: string; // 'Segunda', 'Terça', etc.
  time: string;
  neighborhood: string;
}

// New Types for Prayer Requests
export interface PrayerRequest {
  id: string;
  churchId: string;
  authorName: string; // Can be "Anonymous"
  request: string;
  date: string;
  category: 'Saúde' | 'Família' | 'Financeiro' | 'Espiritual' | 'Outros';
  prayedCount: number;
  isAnonymous: boolean;
}