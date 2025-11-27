import { supabase } from '@/lib/customSupabaseClient';

// Helper formatting functions to ensure InputMasks receive correct format
const formatCNPJ = (value) => {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length !== 14) return value; 
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

const formatCEP = (value) => {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length !== 8) return value;
  return clean.replace(/^(\d{5})(\d{3})/, "$1-$2");
};

const formatPhone = (value) => {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
};

export const fetchCompanyData = async (cnpj) => {
  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) {
    throw new Error("CNPJ inválido. Certifique-se de que possui 14 dígitos.");
  }

  console.log("--- [Senhor Lavos] Starting Integration ---");
  console.log("CNPJ Input:", cleanCnpj);

  try {
    console.log("Calling Supabase Edge Function: senhor-lavos-proxy");
    
    const { data, error } = await supabase.functions.invoke('senhor-lavos-proxy', {
      body: { cnpj: cleanCnpj }
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error(`Erro na comunicação com o servidor: ${error.message}`);
    }

    console.log("Raw Proxy Response:", data);

    if (data.StatusCode && data.StatusCode !== 200) {
       console.error("API Logical Error:", data.Message);
       throw new Error(data.Message || "A API retornou um erro lógico.");
    }
    
    if (data.error) {
        throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Senhor Lavos Integration Fatal Error:", error);
    throw error;
  }
};

export const mapApiDataToForm = (apiData) => {
  console.log(">>> [Mapping] Iniciando mapeamento de dados...");
  console.log(">>> [Mapping] Payload recebido:", apiData);

  // 1) Acessar response.retorno (conforme estrutura solicitada)
  // Fallback para apiData direto caso a estrutura varie ou seja flat
  const data = apiData.retorno || apiData;
  
  if (!data) {
      console.error(">>> [Mapping] Objeto 'retorno' não encontrado e apiData vazio.");
      return {};
  }

  console.log(">>> [Mapping] Objeto de dados alvo:", data);

  // Helpers para acesso seguro a arrays
  const getFirst = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : {});
  
  // --- Extração de Arrays ---
  const enderecos = Array.isArray(data.enderecos) ? data.enderecos : [];
  const telefones = Array.isArray(data.telefones) ? data.telefones : [];
  const emails = Array.isArray(data.emails) ? data.emails : [];
  const socios = Array.isArray(data.socios) ? data.socios : [];

  // --- Log de Arrays ---
  console.log(">>> [Mapping] Lista de Emails:", emails);
  console.log(">>> [Mapping] Lista de Telefones:", telefones);

  // --- Extração de Objetos Individuais ---
  const endereco = getFirst(enderecos);
  const socio = getFirst(socios);

  // 1) Email: Mapear emails[0].enderecoEmail
  const emailObj = getFirst(emails);
  const extractedEmail = emailObj.enderecoEmail || '';
  console.log(">>> [Mapping] Email extraído (enderecoEmail):", extractedEmail);

  // 2) Telefone: Mapear telefones[0].telefoneComDDD
  const telefoneObj = getFirst(telefones);
  const extractedPhone = telefoneObj.telefoneComDDD || '';
  console.log(">>> [Mapping] Telefone extraído (telefoneComDDD):", extractedPhone);

  // --- Lógica de Mapeamento Refinada ---

  // Logradouro -> Endereço (Prioriza 'logradouro', fallback 'endereco')
  const street = endereco.logradouro || endereco.endereco;
  
  // Data Fundação -> Data Abertura (Format YYYY-MM-DD)
  let foundationDate = '';
  const rawDate = data.dataAbertura || data.dataFundacao;
  if (rawDate) {
      foundationDate = rawDate.split('T')[0]; 
  }

  // CNAE Descrição -> Setor (Prioriza cnaePrincipal.descricao)
  const sector = data.cnaePrincipal?.descricao || data.cnaeDescricao;

  // Mapeamento Estrito para os campos do React Hook Form
  const mapped = {
    // Dados Básicos
    cnpj: formatCNPJ(data.cnpj),
    corporate_name: data.razaoSocial,
    fantasy_name: data.nomeFantasia || data.razaoSocial,

    // Endereço
    address_street: street, 
    address_number: endereco.numero,
    address_complement: endereco.complemento,
    address_district: endereco.bairro,
    address_city: endereco.cidade,
    address_state: endereco.uf,
    address_zip_code: formatCEP(endereco.cep),

    // Contato (Correções Solicitadas)
    phone: formatPhone(extractedPhone), // Mapeado de telefones[0].telefoneComDDD
    email: extractedEmail,              // Mapeado de emails[0].enderecoEmail

    // Representante / Sócio
    representative_name: socio.nome,
    representative_role: socio.cargo || socio.qualificacao,

    // Dados Adicionais
    industry_sector: sector,
    foundation_date: foundationDate,

    // Preservar dados brutos
    raw_integration_data: apiData
  };

  console.log(">>> [Mapping] Resultado final formatado:", mapped);
  
  // Remover chaves com valores undefined, null ou string vazia para não apagar dados que o usuário já digitou
  const cleanMapped = Object.fromEntries(
    Object.entries(mapped).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );

  return cleanMapped;
};