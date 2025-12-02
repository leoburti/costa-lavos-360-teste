// Fallback estático para garantir que a aplicação nunca quebre por falta de dados de filtro
export const filterOptions = {
  supervisor: [
    { id: "1", label: "João Silva" },
    { id: "2", label: "Maria Santos" },
    { id: "3", label: "Carlos Oliveira" }
  ],
  vendedor: [
    { id: "1", label: "Pedro Costa" },
    { id: "2", label: "Lucas Martins" },
    { id: "3", label: "Juliana Souza" }
  ],
  regiao: [
    { id: "1", label: "Sul" },
    { id: "2", label: "Sudeste" },
    { id: "3", label: "Norte" },
    { id: "4", label: "Nordeste" }
  ],
  grupoCliente: [
    { id: "1", label: "Premium" },
    { id: "2", label: "Standard" },
    { id: "3", label: "Atacado" }
  ],
  cliente: [
    { id: "1", label: "Cliente A" },
    { id: "2", label: "Cliente B" },
    { id: "3", label: "Supermercado X" }
  ],
  produto: [
    { id: "1", label: "Produto X" },
    { id: "2", label: "Produto Y" },
    { id: "3", label: "Produto Z" }
  ]
};