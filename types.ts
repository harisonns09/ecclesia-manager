// ========================================================================
//                            COMMON / SYSTEM
// ========================================================================

/**
 * Representa a estrutura de paginação retornada pelo Spring Data.
 */
export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Representa uma entrada no log de auditoria.
 */
export interface AuditLogEntry {
  id: number;
  action: string;
  entityName: string;
  username: string;
  details: string;
  timestamp: string;
  churchId: number;
}

/**
 * Representa uma mensagem no chat (ex: com IA).
 */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// ========================================================================
//                                 AUTH
// ========================================================================

/**
 * Representa um usuário do sistema administrativo.
 */
export interface User {
  id: string;
  user: string; // Login / Email
  password?: string;
  igrejaId: string;
  perfil: string; // Nome amigável (Ex: "Pastor", "Tesoureiro")
  permissions: string[]; // Ações permitidas (Ex: ["VER_FINANCEIRO", "EXCLUIR_MEMBRO"])
}

/**
 * Representa o payload decodificado de um token JWT.
 */
export interface DecodedToken {
  sub: string; // Geralmente o login/email
  id: string;  // ID do usuário
  nome: string;
  groups: string[]; // Cargos e Permissões
  exp: number;
}


// ========================================================================
//                                CHURCH
// ========================================================================

/**
 * Representa a entidade principal da Igreja.
 */
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

// ========================================================================
//                               MEMBERS
// ========================================================================
export enum MemberStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  VISITOR = 'Visitante',
}

/**
 * Representa um membro da igreja.
 */
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

// ========================================================================
//                               PRODUCTS
// ========================================================================

/**
 * Representa um produto da loja da igreja.
 */
export interface Product {
  id: string;
  igrejaId: string;
  nome: string;
  descricao?: string;
  preco: number;
  imageUrl?: string;
  estoque: number;
  ativo: boolean;
}

// ========================================================================
//                               FINANCIAL
// ========================================================================

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

/**
 * Representa uma transação financeira (entrada ou saída).
 */
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

// ========================================================================
//                                EVENTS
// ========================================================================

/**
 * Representa a inscrição de uma pessoa em um evento.
 */
export interface EventRegistration {
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
}

/**
 * Representa um evento da igreja.
 */
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

/**
 * Representa a resposta de uma criação de checkout de pagamento.
 */
export interface CheckoutResponse {
  checkoutUrl: string;
  transactionId: string;
}

// ========================================================================
//                               MINISTRIES
// ========================================================================

/**
 * Representa um ministério/departamento da igreja.
 */
export interface Ministry {
  id: string;
  nome: string;
  igrejaId: string;
  liderResponsavel: string;
}

// ========================================================================
//                                SCALES
// ========================================================================

/**
 * Representa uma escala de voluntários para um evento/culto.
 */
export interface Scale {
  id: string;
  churchId: string;
  ministryId: string;
  date: string;
  title: string;
  volunteers: string[];
}

// ========================================================================
//                             SMALL GROUPS
// ========================================================================

/**
 * Representa uma célula/pequeno grupo.
 */
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

// ========================================================================
//                           PRAYER REQUESTS
// ========================================================================

/**
 * Representa um pedido de oração.
 */
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

// ========================================================================
//                               VISITORS
// ========================================================================

export type VisitorStatus = 'Visitante' | 'Em Acompanhamento' | 'Membro';

/**
 * Representa um visitante e sua jornada na igreja.
 */
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

// ========================================================================
//                                 KIDS
// ========================================================================

/**
 * Dados para realizar o check-in de uma criança.
 */
export interface CheckInKidsRequest {
  igrejaId: string;
  nomeCrianca: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  alergias?: string;
  observacoes?: string;
  sala: string;
}

/**
 * Representa um check-in ativo de uma criança.
 */
export interface CheckInKids {
  igrejaId: string;
  id: number;
  nomeCrianca: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  codigoSeguranca: string;
  dataEntrada: string;
  alergias?: string;
  sala: string;
  status: 'ATIVO' | 'FINALIZADO';
}