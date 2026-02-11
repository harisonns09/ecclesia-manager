// utils/formatters.ts

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  
  // Se já vier com T (ex: 2023-10-25T14:00:00), usa o Date normal
  if (dateString.includes('T')) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  // Se for apenas data (YYYY-MM-DD), forçamos o "fuso local"
  // Dividimos a string e criamos a data manualmente: new Date(ano, mes-1, dia)
  // Isso evita que o navegador aplique o UTC-3
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
};