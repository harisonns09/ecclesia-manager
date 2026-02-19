import { z } from 'zod';
import { MemberStatus } from '../types'; // Importe seu Enum aqui

export const memberSchema = z.object({
    // Nome: obrigatório e com mínimo de caracteres
    nome: z.string()
        .min(3, "O nome deve ter pelo menos 3 caracteres")
        .max(100, "Nome muito longo"),
    email: z.string()
        .email("Insira um e-mail válido")
        .optional()
        .or(z.literal('')),

    telefone: z.string()
        .min(10, "Telefone deve ter no mínimo 10 dígitos")
        .max(15, "Telefone muito longo"),

    dataNascimento: z.string()
        .min(1, "A data de nascimento é obrigatória")
        .refine((val) => {
            const date = new Date(val);
            return date <= new Date();
        }, "A data não pode estar no futuro"),

    // Gênero: usamos enum para garantir que só aceite M ou F
    genero: z.enum(["M", "F"] as const, "Selecione o gênero"),

    estadoCivil: z.string().min(1, "Selecione o estado civil"),

    cep: z.string()
        .min(8, "O CEP deve ter 8 dígitos")
        .transform(val => val.replace(/\D/g, '')),

    endereco: z.string().min(1, "O endereço é obrigatório"),
    numero: z.string().min(1, "O número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "O bairro é obrigatório"),
    cidade: z.string().min(1, "A cidade é obrigatória"),

    estado: z.string()
        .length(2, "UF deve ter 2 caracteres")
        .transform(val => val.toUpperCase()),

    ministerio: z.string().min(1, "Selecione um ministério"),
    
    status: z.nativeEnum(MemberStatus),

    dataBatismo: z.string()
        .optional()
        .or(z.literal(''))
        .refine((val) => {
            if (!val) return true;
            const date = new Date(val);
            return date <= new Date();
        }, "A data de batismo não pode estar no futuro"),
});

// Isso exporta o "Tipo" do TypeScript baseado no schema acima
export type MemberFormData = z.infer<typeof memberSchema>;