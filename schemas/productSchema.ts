import { z } from 'zod';

export const productSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0, "O preço não pode ser negativo."),
  estoque: z.coerce.number().int("O estoque deve ser um número inteiro.").min(0),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  ativo: z.boolean(),
});