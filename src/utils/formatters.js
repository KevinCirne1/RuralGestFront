//Formata uma string de números para o padrão CPF (000.000.000-00)
export const formatarCPF = (valor) => {
  if (!valor) return "";
  // Remove tudo que não é número
  const nums = valor.replace(/\D/g, "");
  // Aplica a máscara de CPF
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};


//Formata uma string de números para o padrão Telefone/Celular
export const formatarTelefone = (valor) => {
  if (!valor) return "";
  const nums = valor.replace(/\D/g, "");
  // Se tiver 11 dígitos, trata como celular 
  if (nums.length === 11) {
    return nums.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  }
  // Se tiver 10 dígitos, trata como telefone fixo
  return nums.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
};

export const formatarCoordenadas = (valor) => {
  if (!valor) return "";
  // Remove espaços extras e garante um espaço após a vírgula
  return valor.replace(/\s/g, "").replace(/,/, ", ");
};


//Limpa as coordenadas para salvar no banco (remove espaços)
export const limparCoordenadas = (valor) => {
  if (!valor) return "";
  return valor.replace(/\s/g, "");
};

//Remove qualquer formatação (máscara) para enviar apenas números ao banco de dados
export const apenasNumeros = (valor) => {
  if (!valor) return "";
  return valor.replace(/\D/g, "");
};