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

export const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '-';
    // Remove tudo que não é dígito
    const cleaned = phone.replace(/\D/g, '');
    
    // Formata (11) 99999-9999 ou (11) 9999-9999
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone; // Retorna original se não bater com o padrão
  };