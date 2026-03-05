export interface Church {
  id: string;
  name: string;
  instagram?: string; 
  address: string;
  city: string;
  state: string;      
  cnpj: string; 
  slug: string;   
}




export enum MemberStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  VISITOR = 'Visitante',
}

export interface Member {
  id: string;
  igrejaId: string;
  nome: string;
  email: string;
  telefone: string;
  
  dataNascimento?: string;
  genero: string
  estadoCivil: string;
  
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;

  ministerio?: string;
  dataBatismo?: string;
  status: MemberStatus;
  observacao?: string;
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
  OTHER = 'Outros',
  PAYMENT = 'Pagamento'
}

export interface Transaction {
  id: string;
  igrejaId: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: TransactionCategory;
  dataRegistro: string;
  eventoId?: string;
}

export interface EventRegistration {
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
}

export interface Event {
  id: string;
  churchId: string;
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
  title: string;
  volunteers: string[];
}

export interface SmallGroup {
  id: string;
  churchId: string;
  name: string;
  leaderName: string;
  hostName: string;
  address: string;
  dayOfWeek: string;
  time: string;
  neighborhood: string;
}

export interface PrayerRequest {
  id: string;
  churchId: string;
  authorName: string;
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
  dataVisita: string;
  dataAniversario?: string;
  status: VisitorStatus;
  observacao?: string;
  progressoTrilha?: number;
  trilhaCafeConcluido?: boolean;
  trilhaCelulaConcluida?: boolean;
  trilhaClasseConcluida?: boolean;
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
  codigoSeguranca: string;
  dataEntrada: string;
  alergias?: string;
  status: 'ATIVO' | 'FINALIZADO';
}

export interface User {
  id: string;
  user: string; // Login / Email
  password?: string; // Coloque opcional, pois em listagens a senha não vem do backend
  igrejaId: string;
  perfil: string; // Nome amigável do perfil (Ex: "Pastor", "Tesoureiro", "Secretária")
  permissions: string[]; // Array de ações permitidas (Ex: ["VER_FINANCEIRO", "EXCLUIR_MEMBRO"])
}

export interface AuditLogEntry {
  id: number;
  action: string;
  entityName: string;
  username: string;
  details: string;
  timestamp: string;
  churchId: number;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface DecodedToken {
  sub: string;
  id: string;
  nome: string;
  groups: string[]; // <-- AQUI estão os cargos E as permissões
  exp: number;
}