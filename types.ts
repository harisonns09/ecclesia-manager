export interface Church {
  id: string;
  name: string;
  instagram?: string; 
  address: string;
  city: string;
  state: string;      
  cnpj: string; 
  slug: string;   
  // themeColor: string; // Remova se o Java não mandar
}


export enum MemberStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  VISITOR = 'Visitante', // Caso queira converter visitante em membro depois
}

export interface Member {
  id: string;
  igrejaId: string;
  nome: string;
  email: string;
  telefone: string;
  
  // --- Novos Campos ---
  dataNascimento?: string;
  genero: string
  estadoCivil: string;
  
  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;

  // Eclesiástico
  ministerio?: string;
  dataBatismo?: string;
  status: MemberStatus;
  observacao?: string; // Campo extra para anotações diversas
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
  nomeEvento: string;
  dataEvento: string;
  horario: string;
  descricao: string;
  local: string;
  preco?: number;
  precoPromocional?: number;
  inscricoes?: EventRegistration[]; 
  ministerioResponsavel: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// New Types for Ministries
export interface Ministry {
  id: string;
  nome: string;
  igrejaId: string;
  liderResponsavel: string;

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

export interface CheckoutResponse {
  checkoutUrl: string;
  transactionId: string;
}

export type VisitorStatus = 'Visitante' | 'Em Acompanhamento' | 'Membro';

export interface Visitor {
  id: string;
  churchId: string;
  nome: string;
  telefone: string;
  dataVisita: string; // Data da primeira visita
  dataAniversario?: string;
  status: VisitorStatus;
  observacao?: string; // Como conheceu a igreja, pedidos de oração, etc.
}

export interface CheckInKidsRequest {
  igrejaId: string;
  nomeCrianca: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  alergias?: string;
  observacoes?: string;
}

export interface CheckInKids {
  igrejaId: string;
  id: number;
  nomeCrianca: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  codigoSeguranca: string; // "K-1234"
  dataEntrada: string;
  alergias?: string;
  status: 'ATIVO' | 'FINALIZADO';
}