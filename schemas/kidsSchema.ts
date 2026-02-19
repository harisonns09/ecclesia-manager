import { z } from 'zod';

export const kidsCheckInSchema = z.object({
  nomeCrianca: z.string()
    .min(3, "O nome da criança deve ter pelo menos 3 letras"),

  nomeResponsavel: z.string()
    .min(3, "O nome do responsável deve ter pelo menos 3 letras"),

  // Novo campo obrigatório para segurança
  telefoneResponsavel: z.string()
    .min(10, "Digite um telefone válido (com DDD)"),

  alergias: z.string().optional(),
  observacoes: z.string().optional(),
});

export type KidsFormData = z.infer<typeof kidsCheckInSchema>;